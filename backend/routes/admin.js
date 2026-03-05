const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { docClient } = require("../config/dynamodb");
const { generateId } = require("../utils/helpers");
const { verifyToken, authorize } = require("../middleware/auth");
const { validateStatusUpdate } = require("../middleware/validation");
const { ROLES, STATUSES, ALLOWED_TRANSITIONS } = require("../utils/constants");
const { notifyOperator } = require("../socket/socketManager");
// const { sendStatusUpdate } = require("../utils/emailService"); // Disabled — email service not configured

// @route   GET /api/admin/appointments
// @desc    Get appointments (with filters)
// @access  All admins
router.get(
  "/appointments",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.CENTER_ADMIN, ROLES.OPERATOR),
  async (req, res, next) => {
    try {
      const { date, status, centerId } = req.query;

      let targetCenterId = centerId;

      // If Center Admin or Operator, restrict to their center
      if (
        req.user.role === ROLES.CENTER_ADMIN ||
        req.user.role === ROLES.OPERATOR
      ) {
        targetCenterId = req.user.centerId;
      }

      let params;

      // If date and centerId provided, use center-date-index (most efficient)
      if (date && targetCenterId) {
        params = {
          TableName: process.env.APPOINTMENTS_TABLE,
          IndexName: "center-date-index",
          KeyConditionExpression: "centerId = :centerId AND #date = :date",
          ExpressionAttributeNames: {
            "#date": "date",
          },
          ExpressionAttributeValues: {
            ":centerId": targetCenterId,
            ":date": date,
          },
        };

        if (status) {
          params.FilterExpression = "#status = :status";
          params.ExpressionAttributeNames["#status"] = "status";
          params.ExpressionAttributeValues[":status"] = status;
        }

        const result = await docClient.query(params).promise();

        // Fetch center and service details
        const appointments = await enrichAppointments(result.Items);

        return res.json({
          success: true,
          count: appointments.length,
          data: appointments,
        });
      }

      // Otherwise, scan with filters
      params = {
        TableName: process.env.APPOINTMENTS_TABLE,
      };

      const filterExpressions = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      if (targetCenterId) {
        filterExpressions.push("centerId = :centerId");
        expressionAttributeValues[":centerId"] = targetCenterId;
      }

      if (date) {
        filterExpressions.push("#date = :date");
        expressionAttributeNames["#date"] = "date";
        expressionAttributeValues[":date"] = date;
      }

      if (status) {
        filterExpressions.push("#status = :status");
        expressionAttributeNames["#status"] = "status";
        expressionAttributeValues[":status"] = status;
      }

      if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(" AND ");
        if (Object.keys(expressionAttributeNames).length > 0) {
          params.ExpressionAttributeNames = expressionAttributeNames;
        }
        params.ExpressionAttributeValues = expressionAttributeValues;
      }

      const result = await docClient.scan(params).promise();

      const appointments = await enrichAppointments(result.Items);

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

// Helper function to enrich appointments with center and service details
async function enrichAppointments(appointments) {
  return await Promise.all(
    appointments.map(async (appt) => {
      const [centerResult, serviceResult, userResult] = await Promise.all([
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
        docClient
          .get({
            TableName: process.env.USERS_TABLE,
            Key: { userId: appt.userId },
          })
          .promise(),
      ]);

      return {
        ...appt,
        center: centerResult.Item,
        service: serviceResult.Item,
        user: userResult.Item
          ? {
            userId: userResult.Item.userId,
            name: userResult.Item.name,
            email: userResult.Item.email,
            phone: userResult.Item.phone,
          }
          : null,
      };
    }),
  );
}

// @route   PUT /api/admin/appointments/:id/status
// @desc    Update appointment status
// @access  Center Admin, Operator
router.put(
  "/appointments/:id/status",
  verifyToken,
  authorize(ROLES.CENTER_ADMIN, ROLES.OPERATOR),
  validateStatusUpdate,
  async (req, res, next) => {
    try {
      const { id: appointmentId } = req.params;
      const { status } = req.body;

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

      // Verify center access
      if (appointment.centerId !== req.user.centerId) {
        return res.status(403).json({
          success: false,
          message: "You can only update appointments from your center",
        });
      }

      // Check if transition is allowed
      const currentStatus = appointment.status;
      const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];

      if (!allowedTransitions.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status from ${currentStatus} to ${status}`,
        });
      }

      // Prevent premature No Show — only allow after the time slot has ended
      if (status === STATUSES.NO_SHOW) {
        const slotEndTime = appointment.timeSlot.split(" - ")[1];
        const slotEnd = new Date(
          `${appointment.date}T${slotEndTime}:00+05:30`,
        );
        if (new Date() < slotEnd) {
          return res.status(400).json({
            success: false,
            message: "Cannot mark as No Show before the appointment time slot has ended",
          });
        }
      }

      // Update status
      const updateParams = {
        TableName: process.env.APPOINTMENTS_TABLE,
        Key: { appointmentId },
        UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": new Date().toISOString(),
        },
      };

      // If status is "In Progress", assign operator
      if (status === STATUSES.IN_PROGRESS && req.user.role === ROLES.OPERATOR) {
        updateParams.UpdateExpression += ", operatorId = :operatorId";
        updateParams.ExpressionAttributeValues[":operatorId"] = req.user.id;
      }

      await docClient.update(updateParams).promise();

      // 🔌 Real-time: notify the assigned operator
      const targetOperatorId = appointment.operatorId || req.user.id;
      notifyOperator(targetOperatorId, "queue:updated", {
        type: "STATUS_CHANGE",
        appointmentId,
        newStatus: status,
        previousStatus: currentStatus,
      });

      // If status is "No Show", increment user's no-show count
      if (status === STATUSES.NO_SHOW) {
        await handleNoShow(appointment.userId);
      }

      // Send email notification (disabled — email service not configured)
      // try {
      //   await sendStatusUpdate({
      //     email: appointment.email,
      //     name: appointment.name,
      //     tokenNumber: appointment.tokenNumber,
      //     status,
      //   });
      // } catch (emailError) {
      //   console.error("Email notification failed:", emailError);
      // }

      // Get updated appointment
      const updated = await docClient
        .get({
          TableName: process.env.APPOINTMENTS_TABLE,
          Key: { appointmentId },
        })
        .promise();

      res.json({
        success: true,
        message: "Status updated successfully",
        data: updated.Item,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Handle No-Show: Increment count and block if threshold reached
async function handleNoShow(userId) {
  try {
    // Get user
    const userResult = await docClient
      .get({
        TableName: process.env.USERS_TABLE,
        Key: { userId },
      })
      .promise();

    if (!userResult.Item) return;

    const user = userResult.Item;
    const newNoShowCount = (user.noShowCount || 0) + 1;

    const maxNoShows = parseInt(process.env.MAX_NO_SHOWS_BEFORE_BLOCK) || 3;
    const blockDurationDays = parseInt(process.env.BLOCK_DURATION_DAYS) || 30;

    let blockedUntil = null;

    // If threshold reached, block user
    if (newNoShowCount >= maxNoShows) {
      const blockDate = new Date();
      blockDate.setDate(blockDate.getDate() + blockDurationDays);
      blockedUntil = blockDate.toISOString();
    }

    // Update user
    await docClient
      .update({
        TableName: process.env.USERS_TABLE,
        Key: { userId },
        UpdateExpression:
          "SET noShowCount = :count, blockedUntil = :blockedUntil, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":count": newNoShowCount,
          ":blockedUntil": blockedUntil,
          ":updatedAt": new Date().toISOString(),
        },
      })
      .promise();

    console.log(
      `User ${userId} no-show count: ${newNoShowCount}${blockedUntil ? " - BLOCKED" : ""}`,
    );
  } catch (error) {
    console.error("Error handling no-show:", error);
  }
}

// @route   PUT /api/admin/appointments/:id/assign-operator
// @desc    Assign operator to appointment
// @access  Center Admin
router.put(
  "/appointments/:id/assign-operator",
  verifyToken,
  authorize(ROLES.CENTER_ADMIN),
  async (req, res, next) => {
    try {
      const { id: appointmentId } = req.params;
      const { operatorId } = req.body;

      if (!operatorId) {
        return res.status(400).json({
          success: false,
          message: "operatorId is required",
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

      // Verify center access
      if (appointment.centerId !== req.user.centerId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Verify operator belongs to this center
      const operatorResult = await docClient
        .get({
          TableName: process.env.OPERATORS_TABLE,
          Key: { operatorId },
        })
        .promise();

      if (
        !operatorResult.Item ||
        operatorResult.Item.centerId !== req.user.centerId
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid operator for this center",
        });
      }

      // Assign operator
      await docClient
        .update({
          TableName: process.env.APPOINTMENTS_TABLE,
          Key: { appointmentId },
          UpdateExpression:
            "SET operatorId = :operatorId, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":operatorId": operatorId,
            ":updatedAt": new Date().toISOString(),
          },
        })
        .promise();

      res.json({
        success: true,
        message: "Operator assigned successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// @route   POST /api/admin/center-admin
// @desc    Create Center Admin
// @access  Super Admin only
router.post(
  "/center-admin",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { name, email, password, centerId } = req.body;

      // Validate inputs
      if (!name || !email || !password || !centerId) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Check if email exists
      const existingAdmin = await docClient
        .query({
          TableName: process.env.ADMINS_TABLE,
          IndexName: "email-index",
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: { ":email": email },
        })
        .promise();

      if (existingAdmin.Items.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Admin with this email already exists",
        });
      }

      // Verify center exists
      const centerResult = await docClient
        .get({
          TableName: process.env.CENTERS_TABLE,
          Key: { centerId },
        })
        .promise();

      if (!centerResult.Item) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin
      const adminId = generateId("ADMIN");
      const newAdmin = {
        adminId,
        name,
        email,
        password: hashedPassword,
        role: ROLES.CENTER_ADMIN,
        centerId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient
        .put({
          TableName: process.env.ADMINS_TABLE,
          Item: newAdmin,
        })
        .promise();

      res.status(201).json({
        success: true,
        message: "Center Admin created successfully",
        data: {
          adminId: newAdmin.adminId,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          centerId: newAdmin.centerId,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// @route   GET /api/admin/analytics
// @desc    Get analytics (center-specific or global)
// @access  All admins
router.get(
  "/analytics",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.CENTER_ADMIN),
  async (req, res, next) => {
    try {
      const { centerId } = req.query;

      let targetCenterId = centerId;

      // If Center Admin, restrict to their center
      if (req.user.role === ROLES.CENTER_ADMIN) {
        targetCenterId = req.user.centerId;
      }

      // Fetch all appointments (optionally filtered by center)
      let params = { TableName: process.env.APPOINTMENTS_TABLE };
      if (targetCenterId) {
        params.FilterExpression = "centerId = :centerId";
        params.ExpressionAttributeValues = { ":centerId": targetCenterId };
      }

      const [appointmentsResult, centersResult, servicesResult, operatorsResult] =
        await Promise.all([
          docClient.scan(params).promise(),
          docClient.scan({ TableName: process.env.CENTERS_TABLE }).promise(),
          docClient.scan({ TableName: process.env.SERVICES_TABLE }).promise(),
          docClient.scan({ TableName: process.env.OPERATORS_TABLE }).promise(),
        ]);

      const appointments = appointmentsResult.Items || [];
      const centers = centersResult.Items || [];
      const services = servicesResult.Items || [];
      const operators = operatorsResult.Items || [];
      const total = appointments.length;

      // --- Status distribution ---
      const byStatus = {};
      appointments.forEach((a) => {
        byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      });

      const completed = byStatus[STATUSES.COMPLETED] || 0;
      const noShows = byStatus[STATUSES.NO_SHOW] || 0;

      // --- By Service (flat: serviceName -> count) ---
      const serviceMap = {};
      services.forEach((s) => { serviceMap[s.serviceId] = s.name; });
      const byService = {};
      appointments.forEach((a) => {
        const name = serviceMap[a.serviceId] || "Unknown";
        byService[name] = (byService[name] || 0) + 1;
      });

      // --- By Center (centerId -> { name, total, completed, pending, checkedIn }) ---
      const centerMap = {};
      centers.forEach((c) => { centerMap[c.centerId] = c.name; });
      const byCenter = {};
      appointments.forEach((a) => {
        const cName = centerMap[a.centerId] || a.centerId;
        if (!byCenter[cName]) {
          byCenter[cName] = { total: 0, completed: 0, pending: 0, checkedIn: 0 };
        }
        byCenter[cName].total++;
        if (a.status === STATUSES.COMPLETED) byCenter[cName].completed++;
        if (a.status === STATUSES.PENDING) byCenter[cName].pending++;
        if (a.status === STATUSES.CHECKED_IN) byCenter[cName].checkedIn++;
      });

      // --- Daily trend (last 7 days) ---
      const dailyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
        const count = appointments.filter((a) => a.date === dateStr).length;
        dailyTrend.push({ date: dateStr, day: dayLabel, count });
      }

      // --- Peak hours (group by timeSlot start hour) ---
      const peakHours = {};
      appointments.forEach((a) => {
        if (a.timeSlot) {
          const slot = a.timeSlot.split(" - ")[0] || a.timeSlot;
          peakHours[slot] = (peakHours[slot] || 0) + 1;
        }
      });

      // --- Today snapshot ---
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = appointments.filter((a) => a.date === today);
      const todaySnapshot = {
        total: todayAppts.length,
        pending: todayAppts.filter((a) => a.status === STATUSES.PENDING).length,
        checkedIn: todayAppts.filter((a) => a.status === STATUSES.CHECKED_IN).length,
        inProgress: todayAppts.filter((a) => a.status === STATUSES.IN_PROGRESS).length,
        completed: todayAppts.filter((a) => a.status === STATUSES.COMPLETED).length,
        noShow: todayAppts.filter((a) => a.status === STATUSES.NO_SHOW).length,
        cancelled: todayAppts.filter((a) => a.status === STATUSES.CANCELLED).length,
      };

      const analytics = {
        totalAppointments: total,
        completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0",
        noShowRate: total > 0 ? ((noShows / total) * 100).toFixed(1) : "0.0",
        activeCenters: centers.filter((c) => c.isActive).length,
        totalOperators: operators.filter((o) => o.isActive).length,
        totalServices: services.length,
        byStatus,
        byService,
        byCenter,
        dailyTrend,
        peakHours,
        todaySnapshot,
      };

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },
);


// @route   GET /api/admin/all-centers
// @desc    Get all centers with stats
// @access  Super Admin only
router.get(
  "/all-centers",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const centersResult = await docClient
        .scan({
          TableName: process.env.CENTERS_TABLE,
        })
        .promise();

      // Get operators for each center
      const centersWithOperators = await Promise.all(
        centersResult.Items.map(async (center) => {
          const operatorsResult = await docClient
            .query({
              TableName: process.env.OPERATORS_TABLE,
              IndexName: "center-index",
              KeyConditionExpression: "centerId = :centerId",
              ExpressionAttributeValues: {
                ":centerId": center.centerId,
              },
            })
            .promise();

          return {
            ...center,
            operatorCount: operatorsResult.Items.length,
            operators: operatorsResult.Items,
          };
        })
      );

      res.json({
        success: true,
        count: centersWithOperators.length,
        data: centersWithOperators,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/admin/all-operators
// @desc    Get all operators grouped by center
// @access  Super Admin only
router.get(
  "/all-operators",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const operatorsResult = await docClient
        .scan({
          TableName: process.env.OPERATORS_TABLE,
        })
        .promise();

      // Get center details for each operator
      const operatorsWithCenters = await Promise.all(
        operatorsResult.Items.map(async (operator) => {
          const centerResult = await docClient
            .get({
              TableName: process.env.CENTERS_TABLE,
              Key: { centerId: operator.centerId },
            })
            .promise();

          return {
            ...operator,
            center: centerResult.Item,
          };
        })
      );

      // Group by center
      const groupedByCenter = operatorsWithCenters.reduce((acc, operator) => {
        const centerName = operator.center?.name || "Unknown Center";
        if (!acc[centerName]) {
          acc[centerName] = [];
        }
        acc[centerName].push(operator);
        return acc;
      }, {});

      res.json({
        success: true,
        count: operatorsWithCenters.length,
        data: operatorsWithCenters,
        groupedByCenter,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/admin/all-admins
// @desc    Get all center admins
// @access  Super Admin only
router.get(
  "/all-admins",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const result = await docClient
        .scan({
          TableName: process.env.ADMINS_TABLE,
          FilterExpression: "#role = :role",
          ExpressionAttributeNames: {
            "#role": "role",
          },
          ExpressionAttributeValues: {
            ":role": ROLES.CENTER_ADMIN,
          },
        })
        .promise();

      // Get center details for each admin
      const adminsWithCenters = await Promise.all(
        result.Items.map(async (admin) => {
          const centerResult = await docClient
            .get({
              TableName: process.env.CENTERS_TABLE,
              Key: { centerId: admin.centerId },
            })
            .promise();

          return {
            adminId: admin.adminId,
            name: admin.name,
            email: admin.email,
            centerId: admin.centerId,
            isActive: admin.isActive,
            createdAt: admin.createdAt,
            center: centerResult.Item,
          };
        })
      );

      res.json({
        success: true,
        count: adminsWithCenters.length,
        data: adminsWithCenters,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/admin/system-stats
// @desc    Get system-wide statistics
// @access  Super Admin only
router.get(
  "/system-stats",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const [centersResult, adminsResult, operatorsResult, appointmentsResult, servicesResult] =
        await Promise.all([
          docClient.scan({ TableName: process.env.CENTERS_TABLE }).promise(),
          docClient
            .scan({
              TableName: process.env.ADMINS_TABLE,
              FilterExpression: "#role = :role",
              ExpressionAttributeNames: { "#role": "role" },
              ExpressionAttributeValues: { ":role": ROLES.CENTER_ADMIN },
            })
            .promise(),
          docClient.scan({ TableName: process.env.OPERATORS_TABLE }).promise(),
          docClient.scan({ TableName: process.env.APPOINTMENTS_TABLE }).promise(),
          docClient.scan({ TableName: process.env.SERVICES_TABLE }).promise(),
        ]);

      const appointments = appointmentsResult.Items || [];
      const centers = centersResult.Items || [];
      const admins = adminsResult.Items || [];
      const operators = operatorsResult.Items || [];
      const services = servicesResult.Items || [];
      const today = new Date().toISOString().split("T")[0];

      // Calculate stats
      const stats = {
        totalCenters: centers.length,
        activeCenters: centers.filter((c) => c.isActive).length,
        totalCenterAdmins: admins.length,
        activeAdmins: admins.filter((a) => a.isActive).length,
        totalOperators: operators.length,
        activeOperators: operators.filter((o) => o.isActive).length,
        totalServices: services.length,
        totalAppointments: appointments.length,
        todayAppointments: appointments.filter((a) => a.date === today).length,
        completedAppointments: appointments.filter(
          (a) => a.status === STATUSES.COMPLETED
        ).length,
        pendingAppointments: appointments.filter(
          (a) => a.status === STATUSES.PENDING
        ).length,
        completionRate:
          appointments.length > 0
            ? (
              (appointments.filter((a) => a.status === STATUSES.COMPLETED)
                .length /
                appointments.length) *
              100
            ).toFixed(1)
            : "0.0",
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// @route   GET /api/admin/operator-queue
// @desc    Get today's appointments assigned to the logged-in operator
// @access  Operator only
// ═══════════════════════════════════════════════════════════════
router.get(
  "/operator-queue",
  verifyToken,
  authorize(ROLES.OPERATOR),
  async (req, res, next) => {
    try {
      const operatorId = req.user.id;
      const centerId = req.user.centerId;
      const today = new Date().toISOString().split("T")[0];

      // Get today's appointments for this center, filtered to this operator
      const result = await docClient
        .query({
          TableName: process.env.APPOINTMENTS_TABLE,
          IndexName: "center-date-index",
          KeyConditionExpression: "centerId = :centerId AND #date = :date",
          FilterExpression: "operatorId = :operatorId",
          ExpressionAttributeNames: { "#date": "date" },
          ExpressionAttributeValues: {
            ":centerId": centerId,
            ":date": today,
            ":operatorId": operatorId,
          },
        })
        .promise();

      const myAppointments = result.Items;

      // Enrich with service and user details
      const enriched = await Promise.all(
        myAppointments.map(async (appt) => {
          const [serviceResult, userResult] = await Promise.all([
            docClient
              .get({
                TableName: process.env.SERVICES_TABLE,
                Key: { serviceId: appt.serviceId },
              })
              .promise(),
            docClient
              .get({
                TableName: process.env.USERS_TABLE,
                Key: { userId: appt.userId },
              })
              .promise(),
          ]);

          return {
            ...appt,
            service: serviceResult.Item,
            user: userResult.Item
              ? {
                userId: userResult.Item.userId,
                name: userResult.Item.name,
                email: userResult.Item.email,
                phone: userResult.Item.phone,
              }
              : null,
          };
        }),
      );

      // Sort by queue position
      enriched.sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));

      // Separate by status
      const currentServing = enriched.find(
        (a) => a.status === STATUSES.IN_PROGRESS,
      );
      const checkedIn = enriched.filter(
        (a) => a.status === STATUSES.CHECKED_IN,
      );
      const pending = enriched.filter((a) => a.status === STATUSES.PENDING);
      const completed = enriched.filter(
        (a) => a.status === STATUSES.COMPLETED,
      );
      const noShow = enriched.filter((a) => a.status === STATUSES.NO_SHOW);
      const cancelled = enriched.filter(
        (a) => a.status === STATUSES.CANCELLED,
      );

      res.json({
        success: true,
        data: {
          date: today,
          currentServing: currentServing || null,
          appointments: enriched,
          summary: {
            total: enriched.length,
            checkedIn: checkedIn.length,
            pending: pending.length,
            inProgress: currentServing ? 1 : 0,
            completed: completed.length,
            noShow: noShow.length,
            cancelled: cancelled.length,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// @route   GET /api/admin/operator-history
// @desc    Get past appointments for the logged-in operator
// @access  Operator only
// ═══════════════════════════════════════════════════════════════
router.get(
  "/operator-history",
  verifyToken,
  authorize(ROLES.OPERATOR),
  async (req, res, next) => {
    try {
      const operatorId = req.user.id;
      const centerId = req.user.centerId;
      const { startDate, endDate } = req.query;

      // Get appointments using center-date-index (instead of full table scan)
      let params = {
        TableName: process.env.APPOINTMENTS_TABLE,
        IndexName: "center-date-index",
      };

      const expressionAttributeNames = { "#date": "date" };
      const expressionAttributeValues = {
        ":centerId": centerId,
        ":operatorId": operatorId,
      };

      if (startDate && endDate) {
        params.KeyConditionExpression =
          "centerId = :centerId AND #date BETWEEN :startDate AND :endDate";
        expressionAttributeValues[":startDate"] = startDate;
        expressionAttributeValues[":endDate"] = endDate;
      } else {
        params.KeyConditionExpression = "centerId = :centerId";
      }

      params.FilterExpression = "operatorId = :operatorId";
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;

      const result = await docClient.query(params).promise();

      // Enrich with service details
      const enriched = await Promise.all(
        result.Items.map(async (appt) => {
          const serviceResult = await docClient
            .get({
              TableName: process.env.SERVICES_TABLE,
              Key: { serviceId: appt.serviceId },
            })
            .promise();

          return {
            ...appt,
            service: serviceResult.Item,
          };
        }),
      );

      // Sort by date descending
      enriched.sort((a, b) => b.date.localeCompare(a.date));

      res.json({
        success: true,
        count: enriched.length,
        data: enriched,
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;

