const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { docClient } = require("../config/dynamodb");
const { generateId } = require("../utils/helpers");
const { verifyToken, authorize } = require("../middleware/auth");
const { ROLES } = require("../utils/constants");
const { body, validationResult } = require("express-validator");

// Validate operator creation
const validateOperator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("centerId").notEmpty().withMessage("Center ID is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

// @route   GET /api/operators
// @desc    Get all operators (Super Admin sees all, Center Admin sees their center's)
// @access  Super Admin, Center Admin
router.get(
  "/",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.CENTER_ADMIN),
  async (req, res, next) => {
    try {
      let params = {
        TableName: process.env.OPERATORS_TABLE,
      };

      // If Center Admin, filter by their centerId
      if (req.user.role === ROLES.CENTER_ADMIN) {
        params = {
          TableName: process.env.OPERATORS_TABLE,
          IndexName: "center-index",
          KeyConditionExpression: "centerId = :centerId",
          ExpressionAttributeValues: {
            ":centerId": req.user.centerId,
          },
        };

        const result = await docClient.query(params).promise();
        return res.json({
          success: true,
          count: result.Items.length,
          data: result.Items.map((op) => ({ ...op, password: undefined })),
        });
      }

      // Super Admin sees all
      const result = await docClient.scan(params).promise();

      res.json({
        success: true,
        count: result.Items.length,
        data: result.Items.map((op) => ({ ...op, password: undefined })),
      });
    } catch (error) {
      next(error);
    }
  },
);

// @route   GET /api/operators/center/:centerId
// @desc    Get operators by center
// @access  Public (for assignment purposes)
router.get("/center/:centerId", async (req, res, next) => {
  try {
    const result = await docClient
      .query({
        TableName: process.env.OPERATORS_TABLE,
        IndexName: "center-index",
        KeyConditionExpression: "centerId = :centerId",
        FilterExpression: "isActive = :isActive",
        ExpressionAttributeValues: {
          ":centerId": req.params.centerId,
          ":isActive": true,
        },
      })
      .promise();

    res.json({
      success: true,
      count: result.Items.length,
      data: result.Items.map((op) => ({
        operatorId: op.operatorId,
        name: op.name,
        email: op.email,
        counterId: op.counterId,
        isActive: op.isActive,
      })),
    });
  } catch (error) {
    next(error);
  }
});
// @route   POST /api/operators
// @desc    Create operator (multiple per center, unique counter)
// @access  Super Admin, Center Admin (for their center)
router.post(
  "/",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.CENTER_ADMIN),
  validateOperator,
  async (req, res, next) => {
    try {
      const { name, email, password, centerId, counterId } = req.body;

      // If Center Admin, verify they're creating operator for their own center
      if (
        req.user.role === ROLES.CENTER_ADMIN &&
        centerId !== req.user.centerId
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only create operators for your center",
        });
      }

      // Check if counter is already taken by another active operator at this center
      const existingOperators = await docClient
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

      // Enforce operator capacity limit
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

      const capacity = centerResult.Item.operatorCapacity || 5;
      if (existingOperators.Items.length >= capacity) {
        return res.status(400).json({
          success: false,
          message: `Center has reached its operator capacity of ${capacity}. Deactivate an existing operator or increase the center's capacity.`,
        });
      }

      // Validate counter assignment
      if (!counterId) {
        return res.status(400).json({
          success: false,
          message: "Counter ID is required. Please assign a counter number.",
        });
      }

      const counterToAssign = String(counterId);
      const counterTaken = existingOperators.Items.some(
        (op) => String(op.counterId) === counterToAssign,
      );

      if (counterTaken) {
        return res.status(400).json({
          success: false,
          message: `Counter "${counterToAssign}" is already assigned to another active operator at this center.`,
        });
      }

      // Check if email already exists
      const existingOperator = await docClient
        .query({
          TableName: process.env.ADMINS_TABLE,
          IndexName: "email-index",
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: { ":email": email },
        })
        .promise();

      if (existingOperator.Items.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Operator with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create operator in Admins table
      const operatorId = generateId("OPR");
      const newOperator = {
        adminId: operatorId,
        operatorId,
        name,
        email,
        password: hashedPassword,
        role: ROLES.OPERATOR,
        centerId,
        counterId: counterToAssign,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient
        .put({
          TableName: process.env.ADMINS_TABLE,
          Item: newOperator,
        })
        .promise();

      // Also add to Operators table
      const operatorRecord = {
        operatorId,
        centerId,
        name,
        email,
        counterId: counterToAssign,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient
        .put({
          TableName: process.env.OPERATORS_TABLE,
          Item: operatorRecord,
        })
        .promise();

      res.status(201).json({
        success: true,
        message: "Operator created successfully",
        data: {
          operatorId: newOperator.operatorId,
          name: newOperator.name,
          email: newOperator.email,
          centerId: newOperator.centerId,
          counterId: newOperator.counterId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/operators/:id
// @desc    Update operator
// @access  Super Admin, Center Admin (their center's operators)
router.put(
  "/:id",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.CENTER_ADMIN),
  async (req, res, next) => {
    try {
      const operatorId = req.params.id;
      const { name, counterId, isActive } = req.body;

      // Get operator
      const operatorResult = await docClient
        .get({
          TableName: process.env.OPERATORS_TABLE,
          Key: { operatorId },
        })
        .promise();

      if (!operatorResult.Item) {
        return res.status(404).json({
          success: false,
          message: "Operator not found",
        });
      }

      const operator = operatorResult.Item;

      // If Center Admin, verify it's their operator
      if (
        req.user.role === ROLES.CENTER_ADMIN &&
        operator.centerId !== req.user.centerId
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only update operators from your center",
        });
      }

      // Build update expression
      const updates = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      if (name) {
        updates.push("#name = :name");
        expressionAttributeNames["#name"] = "name";
        expressionAttributeValues[":name"] = name;
      }

      if (counterId !== undefined) {
        updates.push("counterId = :counterId");
        expressionAttributeValues[":counterId"] = counterId;
      }

      if (isActive !== undefined) {
        updates.push("isActive = :isActive");
        expressionAttributeValues[":isActive"] = isActive;
      }

      updates.push("updatedAt = :updatedAt");
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();

      // Update Operators table
      await docClient
        .update({
          TableName: process.env.OPERATORS_TABLE,
          Key: { operatorId },
          UpdateExpression: `SET ${updates.join(", ")}`,
          ...(Object.keys(expressionAttributeNames).length > 0 && {
            ExpressionAttributeNames: expressionAttributeNames,
          }),
          ExpressionAttributeValues: expressionAttributeValues,
        })
        .promise();

      // Also update Admins table
      const adminUpdates = [];
      const adminExpAttrNames = {};
      const adminExpAttrValues = {};

      if (name) {
        adminUpdates.push("#name = :name");
        adminExpAttrNames["#name"] = "name";
        adminExpAttrValues[":name"] = name;
      }

      if (counterId !== undefined) {
        adminUpdates.push("counterId = :counterId");
        adminExpAttrValues[":counterId"] = counterId;
      }

      if (isActive !== undefined) {
        adminUpdates.push("isActive = :isActive");
        adminExpAttrValues[":isActive"] = isActive;
      }

      adminUpdates.push("updatedAt = :updatedAt");
      adminExpAttrValues[":updatedAt"] = new Date().toISOString();

      await docClient
        .update({
          TableName: process.env.ADMINS_TABLE,
          Key: { adminId: operatorId },
          UpdateExpression: `SET ${adminUpdates.join(", ")}`,
          ...(Object.keys(adminExpAttrNames).length > 0 && {
            ExpressionAttributeNames: adminExpAttrNames,
          }),
          ExpressionAttributeValues: adminExpAttrValues,
        })
        .promise();

      // Get updated operator
      const updated = await docClient
        .get({
          TableName: process.env.OPERATORS_TABLE,
          Key: { operatorId },
        })
        .promise();

      res.json({
        success: true,
        message: "Operator updated successfully",
        data: updated.Item,
      });
    } catch (error) {
      next(error);
    }
  },
);

// @route   DELETE /api/operators/:id
// @desc    Deactivate operator
// @access  Super Admin, Center Admin
router.delete(
  "/:id",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN, ROLES.CENTER_ADMIN),
  async (req, res, next) => {
    try {
      const operatorId = req.params.id;

      // Get operator
      const operatorResult = await docClient
        .get({
          TableName: process.env.OPERATORS_TABLE,
          Key: { operatorId },
        })
        .promise();

      if (!operatorResult.Item) {
        return res.status(404).json({
          success: false,
          message: "Operator not found",
        });
      }

      const operator = operatorResult.Item;

      // If Center Admin, verify it's their operator
      if (
        req.user.role === ROLES.CENTER_ADMIN &&
        operator.centerId !== req.user.centerId
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only delete operators from your center",
        });
      }

      // Deactivate in both tables
      await docClient
        .update({
          TableName: process.env.OPERATORS_TABLE,
          Key: { operatorId },
          UpdateExpression: "SET isActive = :isActive, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":isActive": false,
            ":updatedAt": new Date().toISOString(),
          },
        })
        .promise();

      await docClient
        .update({
          TableName: process.env.ADMINS_TABLE,
          Key: { adminId: operatorId },
          UpdateExpression: "SET isActive = :isActive, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":isActive": false,
            ":updatedAt": new Date().toISOString(),
          },
        })
        .promise();

      res.json({
        success: true,
        message: "Operator deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
