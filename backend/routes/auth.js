const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { dynamoDB } = require("../utils/dynamodb");
const { validateUserRegistration } = require("../middleware/validation");
require("dotenv").config();

const USERS_TABLE = process.env.USERS_TABLE;
const ADMIN_TABLE = process.env.ADMIN_TABLE;

// Generate JWT Token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ==================== USER ROUTES ====================

// POST: User Registration
router.post("/register", validateUserRegistration, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await dynamoDB.scan({
      TableName: USERS_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email }
    }).promise();

    if (existingUser.Items.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      userId: `USER_${Date.now()}`,
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user",
      createdAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: USERS_TABLE,
      Item: user
    }).promise();

    // Generate token
    const token = generateToken(user.userId, user.email, user.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message
    });
  }
});

// POST: User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    const result = await dynamoDB.scan({
      TableName: USERS_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email }
    }).promise();

    if (result.Items.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result.Items[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    const token = generateToken(user.userId, user.email, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message
    });
  }
});

// ==================== ADMIN ROUTES ====================

// POST: Admin Login
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find admin by email
    const result = await dynamoDB.scan({
      TableName: ADMIN_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": email }
    }).promise();

    if (result.Items.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    const admin = result.Items[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

    // Generate token
    const token = generateToken(admin.adminId, admin.email, "admin");

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: "admin"
      },
      token
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during admin login",
      error: error.message
    });
  }
});

// POST: Create Default Admin (Run once for setup)
router.post("/admin/create-default", async (req, res) => {
  try {
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@aadhaarqms.com";
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";

    // Check if admin already exists
    const existingAdmin = await dynamoDB.scan({
      TableName: ADMIN_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: { ":email": defaultEmail }
    }).promise();

    if (existingAdmin.Items.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Default admin already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create admin
    const admin = {
      adminId: `ADMIN_${Date.now()}`,
      name: "System Administrator",
      email: defaultEmail,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date().toISOString()
    };

    await dynamoDB.put({
      TableName: ADMIN_TABLE,
      Item: admin
    }).promise();

    res.status(201).json({
      success: true,
      message: "Default admin created successfully",
      data: {
        email: defaultEmail,
        password: defaultPassword,
        note: "Please change the password after first login"
      }
    });

  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating default admin",
      error: error.message
    });
  }
});

module.exports = router;