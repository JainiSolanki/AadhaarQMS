const express = require("express");
const router = express.Router();
const { dynamoDB } = require("../utils/dynamodb");
const { verifyToken, isAdmin, isUser } = require("../middleware/auth");
const { validateAppointment } = require("../middleware/validation");
require("dotenv").config();

const APPOINTMENTS_TABLE = process.env.APPOINTMENTS_TABLE;

// Helper: Generate Sequential Token Number for a Date
const generateTokenNumber = async (date) => {
  try {
    // Get all appointments for this date
    const result = await dynamoDB.scan({
      TableName: APPOINTMENTS_TABLE,
      FilterExpression: "#date = :date",
      ExpressionAttributeNames: { "#date": "date" },
      ExpressionAttributeValues: { ":date": date }
    }).promise();

    // Find the highest token number for today
    let maxToken = 0;
    result.Items.forEach(item => {
      const tokenNum = parseInt(item.tokenNumber.replace(/\D/g, ''));
      if (tokenNum > maxToken) maxToken = tokenNum;
    });

    // Generate next token (e.g., TKN-001, TKN-002)
    const nextToken = maxToken + 1;
    return `TKN-${String(nextToken).padStart(3, '0')}`;

  } catch (error) {
    console.error("Error generating token:", error);
    return `TKN-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  }
};

// ==================== USER ROUTES ====================

// POST: Book Appointment (Protected - User only)
router.post("/appointment", verifyToken, isUser, validateAppointment, async (req, res) => {
  try {
    const { name, email, phone, aadhaarNumber, serviceType, date, timeSlot } = req.body;
    const userId = req.user.userId;

    // Check if user already has appointment on same date
    const existingAppointments = await dynamoDB.scan({
      TableName: APPOINTMENTS_TABLE,
      FilterExpression: "userId = :userId AND #date = :date AND #status = :status",
      ExpressionAttributeNames: {
        "#date": "date",
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":date": date,
        ":status": "Pending"
      }
    }).promise();

    if (existingAppointments.Items.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending appointment on this date"
      });
    }

    // Check slot availability (max 10 appointments per slot)
    const slotAppointments = await dynamoDB.scan({
      TableName: APPOINTMENTS_TABLE,
      FilterExpression: "#date = :date AND timeSlot = :timeSlot AND #status = :status",
      ExpressionAttributeNames: {
        "#date": "date",
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":date": date,
        ":timeSlot": timeSlot,
        ":status": "Pending"
      }
    }).promise();

    if (slotAppointments.Items.length >= 10) {
      return res.status(400).json({
        success: false,
        message: "This time slot is fully booked. Please select another slot."
      });
    }

    // Generate token number
    const tokenNumber = await generateTokenNumber(date);

    // Create appointment
    const appointment = {
      appointmentId: `APT_${Date.now()}`,
      userId,
      name,
      email,
      phone,
      aadhaarNumber,
      serviceType,
      date,
      timeSlot,
      tokenNumber,
      status: "Pending",
      queuePosition: slotAppointments.Items.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: APPOINTMENTS_TABLE,
      Item: appointment
    }).promise();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointmentId: appointment.appointmentId,
        tokenNumber: appointment.tokenNumber,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        queuePosition: appointment.queuePosition,
        status: appointment.status
      }
    });

  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error booking appointment",
      error: error.message
    });
  }
});

// GET: Get User's Appointments (Protected - User only)
router.get("/my-appointments", verifyToken, isUser, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await dynamoDB.scan({
      TableName: APPOINTMENTS_TABLE,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId }
    }).promise();

    // Sort by date descending
    const appointments = result.Items.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message
    });
  }
});

// GET: Get Single Appointment by ID (Protected - User)
router.get("/appointment/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dynamoDB.get({
      TableName: APPOINTMENTS_TABLE,
      Key: { appointmentId: id }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Check if user owns this appointment or is admin
    if (req.user.role !== "admin" && result.Item.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: result.Item
    });

  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointment",
      error: error.message
    });
  }
});

// DELETE: Cancel Appointment (Protected - User)
router.delete("/appointment/:id", verifyToken, isUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if appointment exists and belongs to user
    const result = await dynamoDB.get({
      TableName: APPOINTMENTS_TABLE,
      Key: { appointmentId: id }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    if (result.Item.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (result.Item.status === "Served") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a served appointment"
      });
    }

    // Update status to Cancelled instead of deleting
    await dynamoDB.update({
      TableName: APPOINTMENTS_TABLE,
      Key: { appointmentId: id },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": "Cancelled",
        ":updatedAt": new Date().toISOString()
      }
    }).promise();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully"
    });

  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling appointment",
      error: error.message
    });
  }
});

// ==================== ADMIN ROUTES ====================

// GET: Get All Appointments (Protected - Admin only)
router.get("/admin/appointments", verifyToken, isAdmin, async (req, res) => {
  try {
    const { date, status, serviceType } = req.query;

    let filterExpression = "";
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};

    // Build filter expression
    const filters = [];
    
    if (date) {
      filters.push("#date = :date");
      expressionAttributeNames["#date"] = "date";
      expressionAttributeValues[":date"] = date;
    }
    
    if (status) {
      filters.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
    }
    
    if (serviceType) {
      filters.push("serviceType = :serviceType");
      expressionAttributeValues[":serviceType"] = serviceType;
    }

    if (filters.length > 0) {
      filterExpression = filters.join(" AND ");
    }

    const params = {
      TableName: APPOINTMENTS_TABLE
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression;
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const result = await dynamoDB.scan(params).promise();

    // Sort by date and time
    const appointments = result.Items.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.timeSlot.localeCompare(b.timeSlot);
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });

  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message
    });
  }
});

// PUT: Update Appointment Status (Protected - Admin only)
router.put("/admin/appointment/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "In Progress", "Served", "Cancelled", "No Show"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    // Check if appointment exists
    const result = await dynamoDB.get({
      TableName: APPOINTMENTS_TABLE,
      Key: { appointmentId: id }
    }).promise();

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Update status
    await dynamoDB.update({
      TableName: APPOINTMENTS_TABLE,
      Key: { appointmentId: id },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString()
      }
    }).promise();

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: { appointmentId: id, status }
    });

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment status",
      error: error.message
    });
  }
});

// GET: Get Dashboard Analytics (Protected - Admin only)
router.get("/admin/analytics", verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await dynamoDB.scan({
      TableName: APPOINTMENTS_TABLE
    }).promise();

    const appointments = result.Items;

    // Calculate statistics
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === "Pending").length;
    const inProgress = appointments.filter(a => a.status === "In Progress").length;
    const served = appointments.filter(a => a.status === "Served").length;
    const cancelled = appointments.filter(a => a.status === "Cancelled").length;
    const noShow = appointments.filter(a => a.status === "No Show").length;

    // Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);

    // Service type breakdown
    const serviceBreakdown = {};
    appointments.forEach(a => {
      serviceBreakdown[a.serviceType] = (serviceBreakdown[a.serviceType] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total,
          pending,
          inProgress,
          served,
          cancelled,
          noShow
        },
        today: {
          total: todayAppointments.length,
          pending: todayAppointments.filter(a => a.status === "Pending").length,
          served: todayAppointments.filter(a => a.status === "Served").length
        },
        serviceBreakdown
      }
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
      error: error.message
    });
  }
});

// GET: Get Queue Status for Today (Public or Protected)
router.get("/queue/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await dynamoDB.scan({
      TableName: APPOINTMENTS_TABLE,
      FilterExpression: "#date = :date AND (#status = :pending OR #status = :inProgress)",
      ExpressionAttributeNames: {
        "#date": "date",
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":date": today,
        ":pending": "Pending",
        ":inProgress": "In Progress"
      }
    }).promise();

    // Sort by token number
    const queue = result.Items.sort((a, b) => 
      a.tokenNumber.localeCompare(b.tokenNumber)
    );

    res.status(200).json({
      success: true,
      date: today,
      queueLength: queue.length,
      data: queue.map(item => ({
        tokenNumber: item.tokenNumber,
        timeSlot: item.timeSlot,
        status: item.status
      }))
    });

  } catch (error) {
    console.error("Error fetching queue:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching queue status",
      error: error.message
    });
  }
});

module.exports = router;