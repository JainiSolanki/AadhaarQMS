/**
 * Aadhaar Center Model Schema
 */

const CenterSchema = {
  centerId: "STRING (PK)", // Primary Key
  name: "STRING",
  address: "STRING",
  city: "STRING", // GSI
  state: "STRING",
  pincode: "STRING",
  phone: "STRING",
  email: "STRING",
  operatorCapacity: "NUMBER", // How many operators
  operatingHours: {
    monday: { open: "STRING", close: "STRING" },
    tuesday: { open: "STRING", close: "STRING" },
    wednesday: { open: "STRING", close: "STRING" },
    thursday: { open: "STRING", close: "STRING" },
    friday: { open: "STRING", close: "STRING" },
    saturday: { open: "STRING", close: "STRING" },
    sunday: { closed: "BOOLEAN" },
  },
  isActive: "BOOLEAN",
  createdAt: "STRING (ISO Date)",
  updatedAt: "STRING (ISO Date)",
};

module.exports = CenterSchema;
