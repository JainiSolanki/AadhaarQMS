const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { docClient } = require("../config/dynamodb");
const { verifyToken } = require("../middleware/auth");
const { ROLES } = require("../utils/constants");

// @route   PUT /api/password/change
// @desc    Change password (All roles)
// @access  Authenticated users
router.put("/change", verifyToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    // Determine which table to query based on role
    const tableName =
      req.user.role === ROLES.CITIZEN
        ? process.env.USERS_TABLE
        : process.env.ADMINS_TABLE;

    const keyName = req.user.role === ROLES.CITIZEN ? "userId" : "adminId";

    // Get user/admin
    const result = await docClient
      .get({
        TableName: tableName,
        Key: { [keyName]: req.user.id },
      })
      .promise();

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.Item;

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await docClient
      .update({
        TableName: tableName,
        Key: { [keyName]: req.user.id },
        UpdateExpression: "SET password = :password, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":password": hashedPassword,
          ":updatedAt": new Date().toISOString(),
        },
      })
      .promise();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
