/**
 * Admin Model Schema
 * Represents Super Admin, Center Admin, or Operator
 */

const AdminSchema = {
  adminId: "STRING (PK)", // Primary Key
  name: "STRING",
  email: "STRING", // GSI
  password: "STRING (hashed)",
  role: "STRING (SUPER_ADMIN | CENTER_ADMIN | OPERATOR)",
  centerId: "STRING | NULL", // GSI (for CENTER_ADMIN and OPERATOR)
  counterId: "STRING | NULL", // For operators
  isActive: "BOOLEAN",
  createdAt: "STRING (ISO Date)",
  updatedAt: "STRING (ISO Date)",
};

module.exports = AdminSchema;
