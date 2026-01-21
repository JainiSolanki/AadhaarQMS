const express = require("express");
const cors = require("cors");

const  appointmentRoutes = require("./routes/appointment");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", appointmentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("AadhaarQMS Backend is running");
});

module.exports = app;
