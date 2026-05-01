const express = require("express");
const router = express.Router();
const { docClient } = require("../config/dynamodb");
const { generateQRCode } = require("../utils/helpers");

// ═══════════════════════════════════════════════════════════════
// @route   GET /api/public/appointment/:id
// @desc    Fetch safe, non-sensitive appointment data for QR page
// @access  Public (no auth required — shared via SMS link)
// ═══════════════════════════════════════════════════════════════
router.get("/appointment/:id", async (req, res, next) => {
  try {
    // Add ngrok skip header to response
    res.set('ngrok-skip-browser-warning', 'true');
    
    const { id } = req.params;

    if (!id || id.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    // Fetch appointment
    const apptResult = await docClient
      .get({
        TableName: process.env.APPOINTMENTS_TABLE,
        Key: { appointmentId: id },
        // Only project safe, non-PII fields
        ProjectionExpression:
          "appointmentId, tokenNumber, #date, timeSlot, #status, centerId, serviceId, queuePosition, createdAt",
        ExpressionAttributeNames: {
          "#date": "date",
          "#status": "status",
        },
      })
      .promise();

    if (!apptResult.Item) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const appt = apptResult.Item;

    // Block access to cancelled/terminal appointments on this public page
    // (still show but mark expired)
    const isActive = !["Cancelled"].includes(appt.status);

    // Fetch center details (name only)
    let center = null;
    try {
      const centerResult = await docClient
        .get({
          TableName: process.env.CENTERS_TABLE,
          Key: { centerId: appt.centerId },
          ProjectionExpression: "#name, address, city, #state",
          ExpressionAttributeNames: { "#name": "name", "#state": "state" },
        })
        .promise();
      center = centerResult.Item || null;
    } catch {
      // Non-fatal
    }

    // Fetch service name
    let service = null;
    try {
      const serviceResult = await docClient
        .get({
          TableName: process.env.SERVICES_TABLE,
          Key: { serviceId: appt.serviceId },
          ProjectionExpression: "#name",
          ExpressionAttributeNames: { "#name": "name" },
        })
        .promise();
      service = serviceResult.Item || null;
    } catch {
      // Non-fatal
    }

    // Generate QR code — helper expects { appointmentId, tokenNumber, date }
    // It produces the string: AQMS:<appointmentId>:<tokenNumber>:<date>
    const qrContent = `AQMS:${appt.appointmentId}:${appt.tokenNumber}:${appt.date}`;
    const qrCode = await generateQRCode({
      appointmentId: appt.appointmentId,
      tokenNumber: appt.tokenNumber,
      date: appt.date,
    });

    res.json({
      success: true,
      data: {
        appointmentId: appt.appointmentId,
        tokenNumber: appt.tokenNumber,
        date: appt.date,
        timeSlot: appt.timeSlot,
        status: appt.status,
        queuePosition: appt.queuePosition,
        isActive,
        qrCode,        // base64 data URL
        qrContent,     // raw string for manual entry
        center: center
          ? {
              name: center.name,
              address: center.address,
              city: center.city,
              state: center.state,
            }
          : null,
        service: service ? { name: service.name } : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
