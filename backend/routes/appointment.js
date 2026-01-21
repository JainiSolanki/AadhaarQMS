const express = require("express");
const router = express.Router();

// Temporary in-memory storage
let appointments = [];
let tokenCounter = 1;

// POST: Book appointment
router.post("/appointment", (req, res) => {
  const { name, serviceType, date, timeSlot } = req.body;

  if (!name || !serviceType || !date || !timeSlot) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const appointment = {
    id: Date.now().toString(),
    name,
    serviceType,
    date,
    timeSlot,
    tokenNumber: tokenCounter++,
    status: "Pending"
  };

  appointments.push(appointment);

  res.status(201).json({
    message: "Appointment booked successfully",
    appointment
  });
});

module.exports = router;
