const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { docClient } = require("../config/dynamodb");
const { generateId } = require("../utils/helpers");
const { ROLES } = require("../utils/constants");
const {
  validateUserRegistration,
  validateLogin,
} = require("../middleware/validation");

// Sign JWT Token
const signToken = (user) => {
  return jwt.sign(
    {
      id: user.userId || user.adminId,
      email: user.email,
      role: user.role,
      centerId: user.centerId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE },
  );
};

// @route   POST /api/auth/register
// @desc    Register new citizen
// @access  Public
router.post("/register", validateUserRegistration, async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await docClient
      .query({
        TableName: process.env.USERS_TABLE,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
      .promise();

    if (existingUser.Items.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = generateId("USER");
    const newUser = {
      userId,
      name,
      email,
      phone,
      password: hashedPassword,
      role: ROLES.CITIZEN,
      noShowCount: 0,
      blockedUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docClient
      .put({
        TableName: process.env.USERS_TABLE,
        Item: newUser,
      })
      .promise();

    // Generate token
    const token = signToken(newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: {
          userId: newUser.userId,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login citizen
// @access  Public
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await docClient
      .query({
        TableName: process.env.USERS_TABLE,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
      .promise();

    if (result.Items.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.Items[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if blocked
    const isBlocked =
      user.blockedUntil && new Date(user.blockedUntil) > new Date();

    // Generate token
    const token = signToken(user);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isBlocked,
          blockedUntil: user.blockedUntil,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/admin/login
// @desc    Login admin (Super Admin / Center Admin / Operator)
// @access  Public
router.post("/admin/login", validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const result = await docClient
      .query({
        TableName: process.env.ADMINS_TABLE,
        IndexName: "email-index",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: { ":email": email },
      })
      .promise();

    if (result.Items.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const admin = result.Items[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // If operator, fetch counterId from Operators table (operatorId === adminId)
    let counterId = null;
    if (admin.role === ROLES.OPERATOR) {
      try {
        const opResult = await docClient
          .get({
            TableName: process.env.OPERATORS_TABLE,
            Key: { operatorId: admin.adminId },
          })
          .promise();
        if (opResult.Item) {
          counterId = opResult.Item.counterId || null;
        }
      } catch (e) { /* ignore */ }
    }

    // Generate token
    const token = signToken(admin);

    res.json({
      success: true,
      message: "Admin login successful",
      data: {
        token,
        admin: {
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          centerId: admin.centerId || null,
          counterId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Authenticated
router.get("/me", require("../middleware/auth").verifyToken, async (req, res, next) => {
  try {
    const tableName =
      req.user.role === ROLES.CITIZEN
        ? process.env.USERS_TABLE
        : process.env.ADMINS_TABLE;
    const keyName = req.user.role === ROLES.CITIZEN ? "userId" : "adminId";

    const result = await docClient
      .get({ TableName: tableName, Key: { [keyName]: req.user.id } })
      .promise();

    if (!result.Item) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const u = result.Item;

    // If operator, fetch counterId from Operators table (operatorId === adminId)
    let counterId = null;
    if (u.role === ROLES.OPERATOR) {
      try {
        const opResult = await docClient
          .get({
            TableName: process.env.OPERATORS_TABLE,
            Key: { operatorId: req.user.id },
          })
          .promise();
        if (opResult.Item) {
          counterId = opResult.Item.counterId || null;
        }
      } catch (e) { /* ignore */ }
    }

    res.json({
      success: true,
      data: {
        userId: u.userId || u.adminId,
        name: u.name,
        email: u.email,
        phone: u.phone || null,
        role: u.role,
        createdAt: u.createdAt,
        noShowCount: u.noShowCount || 0,
        blockedUntil: u.blockedUntil || null,
        counterId,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (name, phone)
// @access  Authenticated
router.put("/profile", require("../middleware/auth").verifyToken, async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
    }

    const tableName =
      req.user.role === ROLES.CITIZEN
        ? process.env.USERS_TABLE
        : process.env.ADMINS_TABLE;
    const keyName = req.user.role === ROLES.CITIZEN ? "userId" : "adminId";

    const updateExpr = "SET #n = :name, phone = :phone, updatedAt = :updatedAt";
    const exprNames = { "#n": "name" };
    const exprValues = {
      ":name": name.trim(),
      ":phone": phone ? phone.trim() : null,
      ":updatedAt": new Date().toISOString(),
    };

    await docClient
      .update({
        TableName: tableName,
        Key: { [keyName]: req.user.id },
        UpdateExpression: updateExpr,
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprValues,
      })
      .promise();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { name: name.trim(), phone: phone ? phone.trim() : null },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
