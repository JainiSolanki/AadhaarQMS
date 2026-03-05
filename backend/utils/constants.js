// User Roles
exports.ROLES = {
  CITIZEN: "CITIZEN",
  SUPER_ADMIN: "SUPER_ADMIN",
  CENTER_ADMIN: "CENTER_ADMIN",
  OPERATOR: "OPERATOR",
};

// Appointment Statuses
exports.STATUSES = {
  PENDING: "Pending",
  CHECKED_IN: "Checked In",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

// Status Transitions (What status can change to what)
exports.ALLOWED_TRANSITIONS = {
  Pending: ["Checked In", "Cancelled", "No Show"],
  "Checked In": ["In Progress", "Cancelled"],
  "In Progress": ["Completed", "Cancelled"],
  Completed: [], // Terminal state
  Cancelled: [], // Terminal state
  "No Show": [], // Terminal state
};

// Time Slots (9 AM - 6 PM, 1-hour slots)
exports.TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
];

// Indian States
exports.INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

// Service Categories
exports.SERVICE_TYPES = {
  NEW_ENROLLMENT: "New Aadhaar Enrollment",
  BIOMETRIC_UPDATE: "Biometric Update",
  DEMOGRAPHIC_UPDATE: "Demographic Update",
  ADDRESS_UPDATE: "Address Update",
  MOBILE_UPDATE: "Mobile Number Update",
  EMAIL_UPDATE: "Email Update",
  NAME_UPDATE: "Name Update",
  DOB_UPDATE: "Date of Birth Update",
  GENDER_UPDATE: "Gender Update",
  AADHAAR_REPRINT: "Aadhaar Reprint",
  CHILD_AADHAAR: "Child Aadhaar Enrollment",
};

// Document Types
exports.DOCUMENT_TYPES = {
  POI: "Proof of Identity",
  POA: "Proof of Address",
  DOB: "Proof of Date of Birth",
  RELATIONSHIP: "Proof of Relationship",
};

// Capacity Settings
exports.CAPACITY = {
  SLOTS_PER_OPERATOR: 20, // Each operator can handle 20 appointments per day
  APPOINTMENTS_PER_SLOT: 5, // 5 appointments per hour slot per operator
};
