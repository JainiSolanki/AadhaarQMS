const { body, param, query, validationResult } = require("express-validator");

// Validate request
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Aadhaar number validation (12 digits + Verhoeff checksum)
const verhoeffCheck = (aadhaar) => {
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];

  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];

  let c = 0;
  const invertedArray = aadhaar.split("").map(Number).reverse();

  invertedArray.forEach((val, i) => {
    c = d[c][p[i % 8][val]];
  });

  return c === 0;
};

exports.isValidAadhaar = (value) => {
  if (!/^\d{12}$/.test(value)) {
    throw new Error("Aadhaar must be 12 digits");
  }
  if (!verhoeffCheck(value)) {
    throw new Error("Invalid Aadhaar number");
  }
  return true;
};

// User Registration Validation
exports.validateUserRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Invalid Indian phone number"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain uppercase, lowercase, number and special character",
    ),

  exports.validate,
];

// Login Validation
exports.validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  exports.validate,
];

// Appointment Booking Validation
exports.validateAppointment = [
  body("centerId").notEmpty().withMessage("Center is required"),

  body("serviceId").notEmpty().withMessage("Service is required"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const maxDate = new Date(today);
      maxDate.setDate(
        maxDate.getDate() + parseInt(process.env.MAX_BOOKING_DAYS_AHEAD),
      );

      if (bookingDate < today) {
        throw new Error("Cannot book for past dates");
      }
      if (bookingDate > maxDate) {
        throw new Error(
          `Cannot book more than ${process.env.MAX_BOOKING_DAYS_AHEAD} days in advance`,
        );
      }
      return true;
    }),

  body("timeSlot")
    .notEmpty()
    .withMessage("Time slot is required")
    .matches(
      /^([0-1][0-9]|2[0-3]):[0-5][0-9] - ([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    )
    .withMessage("Invalid time slot format"),

  body("name").trim().notEmpty().withMessage("Name is required"),

  body("aadhaarNumber").optional().custom(exports.isValidAadhaar),

  exports.validate,
];

// Center Creation Validation
exports.validateCenter = [
  body("name").trim().notEmpty().withMessage("Center name is required"),

  body("address").trim().notEmpty().withMessage("Address is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("pincode")
    .notEmpty()
    .withMessage("Pincode is required")
    .matches(/^\d{6}$/)
    .withMessage("Invalid pincode"),

  body("operatorCapacity")
    .optional()
    .toInt()
    .isInt({ min: 1, max: 20 })
    .withMessage("Operator capacity must be 1-20"),

  body("operatingHours")
    .optional(),

  exports.validate,
];

// Status Update Validation
exports.validateStatusUpdate = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      "Pending",
      "Checked In",
      "In Progress",
      "Completed",
      "Cancelled",
      "No Show",
    ])
    .withMessage("Invalid status"),

  exports.validate,
];
