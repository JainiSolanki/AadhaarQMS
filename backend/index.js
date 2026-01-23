const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initializeTables } = require("./utils/dynamodb");
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointment");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for development)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", appointmentRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AadhaarQMS Backend API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      appointments: "/api",
      health: "/health"
    }
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Initialize DynamoDB tables
initializeTables().then(() => {
  console.log("✅ Database tables initialized");
}).catch(err => {
  console.error("❌ Error initializing tables:", err);
});

module.exports = app;