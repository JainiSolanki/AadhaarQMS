// Validate Email Format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate Phone Number (Indian format)
const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Validate Password Strength
const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Validate Aadhaar Number (12 digits)
const validateAadhaar = (aadhaar) => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar);
};

// Validate Date Format (YYYY-MM-DD)
const validateDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

// Validate Future Date
const isFutureDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  return selectedDate >= today;
};

// Appointment Validation Middleware
const validateAppointment = (req, res, next) => {
  const { name, email, phone, aadhaarNumber, serviceType, date, timeSlot } = req.body;

  // Check required fields
  if (!name || !email || !phone || !aadhaarNumber || !serviceType || !date || !timeSlot) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  // Validate email
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  // Validate phone
  if (!validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number. Must be 10 digits starting with 6-9"
    });
  }

  // Validate Aadhaar
  if (!validateAadhaar(aadhaarNumber)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Aadhaar number. Must be 12 digits"
    });
  }

  // Validate date
  if (!validateDate(date)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Use YYYY-MM-DD"
    });
  }

  // Check if date is in future
  if (!isFutureDate(date)) {
    return res.status(400).json({
      success: false,
      message: "Appointment date must be today or in the future"
    });
  }

  next();
};

// User Registration Validation
const validateUserRegistration = (req, res, next) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  if (!validatePhone(phone)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number"
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters with uppercase, lowercase, and number"
    });
  }

  next();
};

module.exports = {
  validateAppointment,
  validateUserRegistration,
  validateEmail,
  validatePhone,
  validatePassword,
  validateAadhaar,
  validateDate,
  isFutureDate
};