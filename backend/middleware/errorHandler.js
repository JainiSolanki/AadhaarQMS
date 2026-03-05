const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.errors,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // DynamoDB errors
  if (err.code === "ResourceNotFoundException") {
    return res.status(404).json({
      success: false,
      message: "Resource not found",
    });
  }

  if (err.code === "ConditionalCheckFailedException") {
    return res.status(409).json({
      success: false,
      message: "Operation failed due to conflict",
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
