const express = require("express");
const router = express.Router();
const { docClient } = require("../config/dynamodb");
const {
  generateId,
  generateTokenNumber,
  generateQRCode,
  encryptAadhaar,
  decryptAadhaar,
  maskAadhaar,
  getSlotAvailability,
  formatDate,
} = require("../utils/helpers");
const {
  verifyToken,
  authorize,
  checkUserBlocked,
} = require("../middleware/auth");
const { validateAppointment } = require("../middleware/validation");
const { ROLES, STATUSES } = require("../utils/constants");
const { notifyOperator, notifyCenter } = require("../socket/socketManager");
const { sendBookingConfirmation } = require("../services/smsService");
const { sendBookingConfirmation: sendBookingEmail } = require("../services/emailService");

// ═══════════════════════════════════════════════════════════════
// HELPER: Round-robin auto-assign operator (least loaded)
// ═══════════════════════════════════════════════════════════════
async function autoAssignOperator(centerId, date, timeSlot) {
  // 1. Get all active operators for the center
  const operatorsResult = await docClient
    .query({
      TableName: process.env.OPERATORS_TABLE,
      IndexName: "center-index",
      KeyConditionExpression: "centerId = :centerId",
      FilterExpression: "isActive = :isActive",
      ExpressionAttributeValues: {
        ":centerId": centerId,
        ":isActive": true,
      },
    })
    .promise();

  const operators = operatorsResult.Items;
  if (operators.length === 0) return null;

  // 2. Get all booked appointments for this center/date/slot
  const appointmentsResult = await docClient
    .query({
      TableName: process.env.APPOINTMENTS_TABLE,
      IndexName: "center-date-slot-index",
      KeyConditionExpression: "centerId = :centerId AND timeSlot = :timeSlot",
      FilterExpression:
        "#date = :date AND #status IN (:pending, :checkedIn, :inProgress)",
      ExpressionAttributeNames: {
        "#date": "date",
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":centerId": centerId,
        ":timeSlot": timeSlot,
        ":date": date,
        ":pending": STATUSES.PENDING,
        ":checkedIn": STATUSES.CHECKED_IN,
        ":inProgress": STATUSES.IN_PROGRESS,
      },
    })
    .promise();

  // 3. Count appointments per operator for this slot
  const loadMap = {};
  operators.forEach((op) => {
    loadMap[op.operatorId] = 0;
  });

  appointmentsResult.Items.forEach((appt) => {
    if (appt.operatorId && loadMap[appt.operatorId] !== undefined) {
      loadMap[appt.operatorId]++;
    }
  });

  // 4. Pick operator with fewest appointments (round-robin by load)
  let minLoad = Infinity;
  let chosenOperator = null;

  for (const op of operators) {
    const load = loadMap[op.operatorId] || 0;
    if (load < minLoad) {
      minLoad = load;
      chosenOperator = op;
    }
  }

  return chosenOperator;
}

// ═══════════════════════════════════════════════════════════════
// @route   POST /api/appointments
// @desc    Book new appointment (with auto round-robin assignment)
// @access  Citizen only
// ═══════════════════════════════════════════════════════════════
router.post(
  "/",
  verifyToken,
  authorize(ROLES.CITIZEN),
  checkUserBlocked,
  validateAppointment,
  async (req, res, next) => {
    try {
      const { centerId, serviceId, date, timeSlot, name, aadhaarNumber } =
        req.body;
      const userId = req.user.id;

      // Get user details
      const userResult = await docClient
        .get({
          TableName: process.env.USERS_TABLE,
          Key: { userId },
        })
        .promise();

      const user = userResult.Item;

      // Check for duplicate booking
      const duplicateCheck = await docClient
        .query({
          TableName: process.env.APPOINTMENTS_TABLE,
          IndexName: "user-index",
          KeyConditionExpression: "userId = :userId",
          FilterExpression:
            "#date = :date AND #status IN (:pending, :checkedIn, :inProgress)",
          ExpressionAttributeNames: {
            "#date": "date",
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":userId": userId,
            ":date": date,
            ":pending": STATUSES.PENDING,
            ":checkedIn": STATUSES.CHECKED_IN,
            ":inProgress": STATUSES.IN_PROGRESS,
          },
        })
        .promise();

      if (duplicateCheck.Items.length > 0) {
        return res.status(400).json({
          success: false,
          message: "You already have an appointment on this date",
        });
      }

      // Check slot availability
      const availability = await getSlotAvailability(centerId, date, timeSlot);

      if (availability.isFull) {
        return res.status(400).json({
          success: false,
          message: "This slot is fully booked. Please choose another slot.",
        });
      }

      // Get center details
      const centerResult = await docClient
        .get({
          TableName: process.env.CENTERS_TABLE,
          Key: { centerId },
        })
        .promise();

      const center = centerResult.Item;

      // Get service details
      const serviceResult = await docClient
        .get({
          TableName: process.env.SERVICES_TABLE,
          Key: { serviceId },
        })
        .promise();

      const service = serviceResult.Item;

      // ✅ ROUND-ROBIN AUTO-ASSIGN OPERATOR
      const assignedOperator = await autoAssignOperator(
        centerId,
        date,
        timeSlot,
      );

      // Generate token number
      const tokenNumber = await generateTokenNumber(centerId, date);

      // Create appointment
      const appointmentId = generateId("APPT");

      const appointment = {
        appointmentId,
        userId,
        centerId,
        serviceId,
        name: name || user.name,
        email: user.email,
        phone: user.phone,
        aadhaarNumber: aadhaarNumber ? encryptAadhaar(aadhaarNumber) : null,
        date,
        timeSlot,
        tokenNumber,
        status: STATUSES.PENDING,
        queuePosition: availability.booked + 1,
        operatorId: assignedOperator ? assignedOperator.operatorId : null,
        counterId: assignedOperator ? assignedOperator.counterId : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient
        .put({
          TableName: process.env.APPOINTMENTS_TABLE,
          Item: appointment,
        })
        .promise();

      // Generate QR Code — include userId for check-in validation
      const qrData = {
        appointmentId,
        tokenNumber,
        date,
        timeSlot,
        centerId,
        userId,
      };
      const qrCode = await generateQRCode(qrData);

      // Send confirmation SMS with QR link (non-blocking — failure does not affect booking)
      sendBookingConfirmation({
        phone: user.phone,
        name: appointment.name,
        appointmentId,
        tokenNumber,
        date,
        timeSlot,
        centerName: center.name,
      }).catch((err) =>
        console.error("SMS send error (non-fatal):", err.message)
      );

      // Send confirmation EMAIL with QR code (non-blocking — failure does not affect booking)
      sendBookingEmail({
        email: user.email,
        name: appointment.name,
        appointmentId,
        tokenNumber,
        date,
        timeSlot,
        centerName: center.name,
        centerCity: center.city,
        serviceName: service.name,
        qrCode, // base64 data URL
      }).catch((err) =>
        console.error("Email send error (non-fatal):", err.message)
      );

      res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        data: {
          appointmentId,
          tokenNumber,
          qrCode,
          date,
          timeSlot,
          status: appointment.status,
          queuePosition: appointment.queuePosition,
          operatorId: assignedOperator ? assignedOperator.operatorId : null,
          operatorName: assignedOperator ? assignedOperator.name : null,
          counterId: assignedOperator ? assignedOperator.counterId : null,
          center: {
            name: center.name,
            address: center.address,
            city: center.city,
          },
          service: {
            name: service.name,
            duration: service.duration,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// @route   POST /api/appointments/check-in
// @desc    QR scan check-in — updates status to "Checked In"
// @access  Public (kiosk/portal — QR data validates the appointment)
// ═══════════════════════════════════════════════════════════════
router.post("/check-in", async (req, res, next) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: "QR data is required",
      });
    }

    // Parse QR string: "AQMS:appointmentId:tokenNumber:date"
    let appointmentId;
    if (qrData.startsWith("AQMS:")) {
      const parts = qrData.split(":");
      appointmentId = parts[1];
    } else {
      // Try parsing as JSON (legacy QR format)
      try {
        const parsed = JSON.parse(qrData);
        appointmentId = parsed.appointmentId;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid QR code format",
        });
      }
    }

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Could not extract appointment ID from QR code",
      });
    }

    // Get appointment
    const apptResult = await docClient
      .get({
        TableName: process.env.APPOINTMENTS_TABLE,
        Key: { appointmentId },
      })
      .promise();

    if (!apptResult.Item) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const appointment = apptResult.Item;

    // Validate date is today (using IST)
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = formatDate(nowIST);
    if (appointment.date !== today) {
      return res.status(400).json({
        success: false,
        message: `This appointment is for ${appointment.date}, not today (${today})`,
      });
    }

    // Validate status is Pending
    if (appointment.status !== STATUSES.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Cannot check in. Current status: ${appointment.status}`,
      });
    }

    // Update status to Checked In
    await docClient
      .update({
        TableName: process.env.APPOINTMENTS_TABLE,
        Key: { appointmentId },
        UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":status": STATUSES.CHECKED_IN,
          ":updatedAt": new Date().toISOString(),
        },
      })
      .promise();

    // Get operator name for display
    let operatorName = null;
    if (appointment.operatorId) {
      const opResult = await docClient
        .get({
          TableName: process.env.OPERATORS_TABLE,
          Key: { operatorId: appointment.operatorId },
        })
        .promise();
      operatorName = opResult.Item ? opResult.Item.name : null;
    }

    // 🔌 Real-time: notify the assigned operator about the check-in
    if (appointment.operatorId) {
      notifyOperator(appointment.operatorId, "queue:updated", {
        type: "CHECK_IN",
        appointmentId,
        tokenNumber: appointment.tokenNumber,
        citizenName: appointment.name,
        counterNumber: appointment.counterId,
      });
    }

    // Also notify all operators in the center (for center-wide dashboards)
    notifyCenter(appointment.centerId, "queue:updated", {
      type: "CHECK_IN",
      appointmentId,
      tokenNumber: appointment.tokenNumber,
    });

    res.json({
      success: true,
      message: "Check-in successful!",
      data: {
        appointmentId,
        tokenNumber: appointment.tokenNumber,
        counterNumber: appointment.counterId || "Not Assigned",
        operatorName: operatorName || "Not Assigned",
        citizenName: appointment.name,
        timeSlot: appointment.timeSlot,
        serviceName: appointment.serviceId, // Will be enriched below
      },
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════
// @route   GET /api/appointments/my
// @desc    Get user's appointments
// @access  Citizen only
// ═══════════════════════════════════════════════════════════════
router.get(
  "/my",
  verifyToken,
  authorize(ROLES.CITIZEN),
  async (req, res, next) => {
    try {
      const result = await docClient
        .query({
          TableName: process.env.APPOINTMENTS_TABLE,
          IndexName: "user-index",
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: { ":userId": req.user.id },
          ScanIndexForward: false,
        })
        .promise();

      // Fetch center, service, and operator details for each appointment
      const appointments = await Promise.all(
        result.Items.map(async (appt) => {
          const promises = [
            docClient
              .get({
                TableName: process.env.CENTERS_TABLE,
                Key: { centerId: appt.centerId },
              })
              .promise(),
            docClient
              .get({
                TableName: process.env.SERVICES_TABLE,
                Key: { serviceId: appt.serviceId },
              })
              .promise(),
          ];

          // Fetch operator if assigned
          if (appt.operatorId) {
            promises.push(
              docClient
                .get({
                  TableName: process.env.OPERATORS_TABLE,
                  Key: { operatorId: appt.operatorId },
                })
                .promise(),
            );
          }

          const results = await Promise.all(promises);

          return {
            ...appt,
            aadhaarNumber: appt.aadhaarNumber
              ? maskAadhaar(decryptAadhaar(appt.aadhaarNumber))
              : null,
            center: results[0].Item,
            service: results[1].Item,
            operator: results[2]?.Item
              ? {
                name: results[2].Item.name,
                counterId: results[2].Item.counterId,
              }
              : null,
          };
        }),
      );

      res.json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// @route   GET /api/appointments/:id
// @desc    Get appointment details
// @access  Citizen (own) or Admin
// ═══════════════════════════════════════════════════════════════
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const result = await docClient
      .get({
        TableName: process.env.APPOINTMENTS_TABLE,
        Key: { appointmentId: req.params.id },
      })
      .promise();

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const appointment = result.Item;

    // Check authorization
    if (req.user.role === ROLES.CITIZEN && appointment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Fetch related data
    const promises = [
      docClient
        .get({
          TableName: process.env.CENTERS_TABLE,
          Key: { centerId: appointment.centerId },
        })
        .promise(),
      docClient
        .get({
          TableName: process.env.SERVICES_TABLE,
          Key: { serviceId: appointment.serviceId },
        })
        .promise(),
    ];

    if (appointment.operatorId) {
      promises.push(
        docClient
          .get({
            TableName: process.env.OPERATORS_TABLE,
            Key: { operatorId: appointment.operatorId },
          })
          .promise(),
      );
    }

    const results = await Promise.all(promises);

    // Generate QR code
    const qrData = {
      appointmentId: appointment.appointmentId,
      tokenNumber: appointment.tokenNumber,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      centerId: appointment.centerId,
      userId: appointment.userId,
    };
    const qrCode = await generateQRCode(qrData);

    res.json({
      success: true,
      data: {
        ...appointment,
        aadhaarNumber: appointment.aadhaarNumber
          ? maskAadhaar(decryptAadhaar(appointment.aadhaarNumber))
          : null,
        qrCode,
        center: results[0].Item,
        service: results[1].Item,
        operator: results[2]?.Item
          ? {
            name: results[2].Item.name,
            counterId: results[2].Item.counterId,
            email: results[2].Item.email,
          }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════
// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Citizen (own)
// ═══════════════════════════════════════════════════════════════
router.delete(
  "/:id",
  verifyToken,
  authorize(ROLES.CITIZEN),
  async (req, res, next) => {
    try {
      const result = await docClient
        .get({
          TableName: process.env.APPOINTMENTS_TABLE,
          Key: { appointmentId: req.params.id },
        })
        .promise();

      if (!result.Item) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      const appointment = result.Item;

      // Check ownership
      if (appointment.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Check if already in terminal state
      if (
        [STATUSES.COMPLETED, STATUSES.CANCELLED, STATUSES.NO_SHOW].includes(
          appointment.status,
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel appointment in current status",
        });
      }

      // Check if within cancellation window (2 hours before slot, IST)
      const appointmentDateTime = new Date(
        `${appointment.date}T${appointment.timeSlot.split(" - ")[0]}:00+05:30`,
      );
      const now = new Date();
      const hoursDiff = (appointmentDateTime - now) / (1000 * 60 * 60);

      if (hoursDiff < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot cancel appointment within 2 hours of the scheduled time",
        });
      }

      // Update status to cancelled
      await docClient
        .update({
          TableName: process.env.APPOINTMENTS_TABLE,
          Key: { appointmentId: req.params.id },
          UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":status": STATUSES.CANCELLED,
            ":updatedAt": new Date().toISOString(),
          },
        })
        .promise();

      res.json({
        success: true,
        message: "Appointment cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
