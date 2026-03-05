const express = require("express");
const router = express.Router();
const { docClient } = require("../config/dynamodb");
const { getSlotAvailability, formatDate } = require("../utils/helpers");
const { TIME_SLOTS, STATUSES } = require("../utils/constants");

// @route   GET /api/queue/availability
// @desc    Get slot availability for a center on a specific date
// @access  Public
router.get("/availability", async (req, res, next) => {
  try {
    const { centerId, date } = req.query;

    if (!centerId || !date) {
      return res.status(400).json({
        success: false,
        message: "centerId and date are required",
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Get availability for all slots
    const availability = await Promise.all(
      TIME_SLOTS.map(async (slot) => {
        const slotAvailability = await getSlotAvailability(
          centerId,
          date,
          slot,
        );
        return {
          timeSlot: slot,
          ...slotAvailability,
        };
      }),
    );

    res.json({
      success: true,
      date,
      centerId,
      slots: availability,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/queue/today/:centerId
// @desc    Get today's queue for a center (public display)
// @access  Public
router.get("/today/:centerId", async (req, res, next) => {
  try {
    const { centerId } = req.params;
    const today = formatDate(new Date());

    // Get all appointments for today
    const result = await docClient
      .query({
        TableName: process.env.APPOINTMENTS_TABLE,
        IndexName: "center-date-index",
        KeyConditionExpression: "centerId = :centerId AND #date = :date",
        FilterExpression: "#status IN (:pending, :checkedIn, :inProgress)",
        ExpressionAttributeNames: {
          "#date": "date",
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":centerId": centerId,
          ":date": today,
          ":pending": STATUSES.PENDING,
          ":checkedIn": STATUSES.CHECKED_IN,
          ":inProgress": STATUSES.IN_PROGRESS,
        },
      })
      .promise();

    // Sort by token number
    const queue = result.Items.sort((a, b) =>
      a.tokenNumber.localeCompare(b.tokenNumber),
    ).map((appt) => ({
      tokenNumber: appt.tokenNumber,
      timeSlot: appt.timeSlot,
      status: appt.status,
      operatorId: appt.operatorId,
      counterId: appt.counterId,
    }));

    // Get current serving token
    const currentServing = queue.find(
      (appt) => appt.status === STATUSES.IN_PROGRESS,
    );

    res.json({
      success: true,
      date: today,
      centerId,
      totalInQueue: queue.length,
      currentServing: currentServing || null,
      queue,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/queue/my-position/:appointmentId
// @desc    Get user's position in queue (for real-time updates)
// @access  Public (can be called with appointment ID)
router.get("/my-position/:appointmentId", async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

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

    // Get all appointments ahead in queue (same center, same date, SAME OPERATOR, active status)
    const queueResult = await docClient
      .query({
        TableName: process.env.APPOINTMENTS_TABLE,
        IndexName: "center-date-index",
        KeyConditionExpression: "centerId = :centerId AND #date = :date",
        FilterExpression:
          "#status IN (:pending, :checkedIn, :inProgress) AND operatorId = :operatorId",
        ExpressionAttributeNames: {
          "#date": "date",
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":centerId": appointment.centerId,
          ":date": appointment.date,
          ":pending": STATUSES.PENDING,
          ":checkedIn": STATUSES.CHECKED_IN,
          ":inProgress": STATUSES.IN_PROGRESS,
          ":operatorId": appointment.operatorId,
        },
      })
      .promise();

    // Sort by token and find position within THIS OPERATOR'S queue
    const sortedQueue = queueResult.Items.sort((a, b) =>
      a.tokenNumber.localeCompare(b.tokenNumber),
    );

    const myPosition =
      sortedQueue.findIndex((appt) => appt.appointmentId === appointmentId) + 1;

    // Find current serving (within this operator's queue)
    const currentServing = sortedQueue.find(
      (appt) => appt.status === STATUSES.IN_PROGRESS,
    );

    // Estimate wait time (15 min per person average)
    const estimatedWaitMinutes = (myPosition - 1) * 15;

    res.json({
      success: true,
      data: {
        tokenNumber: appointment.tokenNumber,
        status: appointment.status,
        position: myPosition,
        totalInQueue: sortedQueue.length,
        currentServing: currentServing ? currentServing.tokenNumber : null,
        estimatedWaitMinutes,
        timeSlot: appointment.timeSlot,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
