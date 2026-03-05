const express = require("express");
const router = express.Router();
const { docClient } = require("../config/dynamodb");
const { generateId } = require("../utils/helpers");
const { verifyToken, authorize } = require("../middleware/auth");
const { ROLES } = require("../utils/constants");

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const result = await docClient
      .scan({
        TableName: process.env.SERVICES_TABLE,
        FilterExpression: "isActive = :isActive",
        ExpressionAttributeValues: { ":isActive": true },
      })
      .promise();

    res.json({
      success: true,
      count: result.Items.length,
      data: result.Items,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/services/:id
// @desc    Get service by ID
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const result = await docClient
      .get({
        TableName: process.env.SERVICES_TABLE,
        Key: { serviceId: req.params.id },
      })
      .promise();

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      data: result.Item,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/services
// @desc    Create new service
// @access  Super Admin only
router.post(
  "/",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const serviceId = generateId("SVC");

      const { name, description, duration, requiresDocuments, documentsRequired } = req.body;

      const newService = {
        serviceId,
        name,
        description,
        duration,
        requiresDocuments: requiresDocuments || false,
        documentsRequired: documentsRequired || [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient
        .put({
          TableName: process.env.SERVICES_TABLE,
          Item: newService,
        })
        .promise();

      res.status(201).json({
        success: true,
        message: "Service created successfully",
        data: newService,
      });
    } catch (error) {
      next(error);
    }
  },
);

// @route   PUT /api/services/:id
// @desc    Update service
// @access  Super Admin only
router.put(
  "/:id",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const serviceId = req.params.id;

      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      Object.keys(req.body).forEach((key, index) => {
        updateExpression.push(`#field${index} = :value${index}`);
        expressionAttributeNames[`#field${index}`] = key;
        expressionAttributeValues[`:value${index}`] = req.body[key];
      });

      updateExpression.push("#updatedAt = :updatedAt");
      expressionAttributeNames["#updatedAt"] = "updatedAt";
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();

      await docClient
        .update({
          TableName: process.env.SERVICES_TABLE,
          Key: { serviceId },
          UpdateExpression: `SET ${updateExpression.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
        .promise();

      const updated = await docClient
        .get({
          TableName: process.env.SERVICES_TABLE,
          Key: { serviceId },
        })
        .promise();

      res.json({
        success: true,
        message: "Service updated successfully",
        data: updated.Item,
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
