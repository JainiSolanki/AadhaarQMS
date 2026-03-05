const express = require("express");
const router = express.Router();
const { docClient } = require("../config/dynamodb");
const { generateId } = require("../utils/helpers");
const { verifyToken, authorize } = require("../middleware/auth");
const { validateCenter } = require("../middleware/validation");
const { ROLES } = require("../utils/constants");

// @route   GET /api/centers
// @desc    Get all active centers (with optional filters)
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const { state, city } = req.query;


    // Start with base filter
    const filterExpressions = ["isActive = :isActive"];
    const expressionAttributeValues = { ":isActive": true };
    const expressionAttributeNames = {};

    // Add state filter (state is a reserved word, needs attribute name)
    if (state) {
      filterExpressions.push("#state = :state");
      expressionAttributeNames["#state"] = "state";
      expressionAttributeValues[":state"] = state;
    }

    // Add city filter
    if (city) {
      filterExpressions.push("city = :city");
      expressionAttributeValues[":city"] = city;
    }

    // Build scan params
    const params = {
      TableName: process.env.CENTERS_TABLE,
      FilterExpression: filterExpressions.join(" AND "),
      ExpressionAttributeValues: expressionAttributeValues,
    };

    // Only add ExpressionAttributeNames if we have any
    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }


    const result = await docClient.scan(params).promise();


    res.json({
      success: true,
      count: result.Items.length,
      data: result.Items,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/centers/cities
// @desc    Get unique cities grouped by state
// @access  Public
router.get("/cities", async (req, res, next) => {
  try {

    const result = await docClient
      .scan({
        TableName: process.env.CENTERS_TABLE,
        FilterExpression: "isActive = :isActive",
        ExpressionAttributeValues: { ":isActive": true },
        ProjectionExpression: "#state, city",
        ExpressionAttributeNames: { "#state": "state" },
      })
      .promise();


    // Group by state
    const groupedByState = result.Items.reduce((acc, item) => {
      if (!acc[item.state]) {
        acc[item.state] = new Set();
      }
      acc[item.state].add(item.city);
      return acc;
    }, {});

    // Convert Sets to Arrays
    const statesWithCities = Object.keys(groupedByState)
      .map((state) => ({
        state,
        cities: Array.from(groupedByState[state]).sort(),
      }))
      .sort((a, b) => a.state.localeCompare(b.state));

    res.json({
      success: true,
      data: statesWithCities,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/centers/:id
// @desc    Get center by ID
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const result = await docClient
      .get({
        TableName: process.env.CENTERS_TABLE,
        Key: { centerId: req.params.id },
      })
      .promise();

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
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

// @route   POST /api/centers
// @desc    Create new center
// @access  Super Admin only
router.post(
  "/",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  validateCenter,
  async (req, res, next) => {
    try {
      const centerId = generateId("CENTER");

      const newCenter = {
        centerId,
        ...req.body,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docClient
        .put({
          TableName: process.env.CENTERS_TABLE,
          Item: newCenter,
        })
        .promise();

      res.status(201).json({
        success: true,
        message: "Center created successfully",
        data: newCenter,
      });
    } catch (error) {
      next(error);
    }
  },
);

// @route   PUT /api/centers/:id
// @desc    Update center
// @access  Super Admin only
router.put(
  "/:id",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const centerId = req.params.id;

      // Check if center exists
      const existing = await docClient
        .get({
          TableName: process.env.CENTERS_TABLE,
          Key: { centerId },
        })
        .promise();

      if (!existing.Item) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      // Update only allowed fields (whitelist)
      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};
      const allowedFields = [
        "name", "address", "city", "state", "pincode",
        "phone", "email", "operatorCapacity", "operatingHours", "isActive",
      ];

      Object.keys(req.body).forEach((key, index) => {
        if (!allowedFields.includes(key)) return;
        updateExpression.push(`#field${index} = :value${index}`);
        expressionAttributeNames[`#field${index}`] = key;
        expressionAttributeValues[`:value${index}`] = req.body[key];
      });

      updateExpression.push("#updatedAt = :updatedAt");
      expressionAttributeNames["#updatedAt"] = "updatedAt";
      expressionAttributeValues[":updatedAt"] = new Date().toISOString();

      await docClient
        .update({
          TableName: process.env.CENTERS_TABLE,
          Key: { centerId },
          UpdateExpression: `SET ${updateExpression.join(", ")}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        })
        .promise();

      // Get updated center
      const updated = await docClient
        .get({
          TableName: process.env.CENTERS_TABLE,
          Key: { centerId },
        })
        .promise();

      res.json({
        success: true,
        message: "Center updated successfully",
        data: updated.Item,
      });
    } catch (error) {
      next(error);
    }
  },
);

// @route   DELETE /api/centers/:id
// @desc    Deactivate center
// @access  Super Admin only
router.delete(
  "/:id",
  verifyToken,
  authorize(ROLES.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      await docClient
        .update({
          TableName: process.env.CENTERS_TABLE,
          Key: { centerId: req.params.id },
          UpdateExpression: "SET isActive = :isActive, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":isActive": false,
            ":updatedAt": new Date().toISOString(),
          },
        })
        .promise();

      res.json({
        success: true,
        message: "Center deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
