const express = require("express");
const router = express.Router();
const dynamoDB = require("../utils/dynamodb");

const TABLE_NAME = "Appointments";

// POST: Book appointment
router.post("/appointment", async (req, res) => {
  const { name, serviceType, date, timeSlot } = req.body;

  if (!name || !serviceType || !date || !timeSlot) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const appointment = {
    appointmentId: Date.now().toString(),
    name,
    serviceType,
    date,
    timeSlot,
    tokenNumber: Math.floor(Math.random() * 10000),
    status: "Pending"
  };

  const params = {
    TableName: TABLE_NAME,
    Item: appointment
  };

  try {
    await dynamoDB.put(params).promise();
    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving appointment" });
  }
});

// GET: Fetch all appointments (Admin)
router.get("/appointments", async (req, res) => {
  const params = {
    TableName: TABLE_NAME
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    res.status(200).json(data.Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching appointments" });
  }
});

module.exports = router;
