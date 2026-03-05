const jwt = require("jsonwebtoken");
const { docClient } = require("../config/dynamodb");

// Verify JWT Token
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      centerId: decoded.centerId, // For center admins and operators
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// Check if user is blocked
exports.checkUserBlocked = async (req, res, next) => {
  try {
    if (req.user.role !== "CITIZEN") {
      return next();
    }

    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { userId: req.user.id },
    };

    const result = await docClient.get(params).promise();
    const user = result.Item;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is blocked
    if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Your account is temporarily blocked due to multiple no-shows",
        blockedUntil: user.blockedUntil,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
