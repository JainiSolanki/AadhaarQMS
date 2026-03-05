/**
 * Appointment Model Schema
 */

const AppointmentSchema = {
  appointmentId: "STRING (PK)", // Primary Key
  userId: "STRING", // GSI (user-index)
  centerId: "STRING", // GSI (center-date-index)
  serviceId: "STRING",
  operatorId: "STRING | NULL", // Auto-assigned operator (GSI: operator-date-index)
  counterId: "STRING | NULL", // Counter number at center
  name: "STRING",
  email: "STRING",
  phone: "STRING",
  aadhaarNumber: "STRING (encrypted) | NULL",
  date: "STRING (YYYY-MM-DD)", // Part of GSI
  timeSlot: "STRING (HH:MM - HH:MM)", // GSI (center-date-slot-index)
  tokenNumber: "STRING (TKN-###)",
  status:
    "STRING (Pending | Checked In | In Progress | Completed | Cancelled | No Show)",
  queuePosition: "NUMBER",
  createdAt: "STRING (ISO Date)",
  updatedAt: "STRING (ISO Date)",
};

module.exports = AppointmentSchema;
