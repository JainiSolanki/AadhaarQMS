/**
 * Operator Model Schema
 * Lightweight reference table for quick lookups
 */

const OperatorSchema = {
  operatorId: "STRING (PK)", // Primary Key
  centerId: "STRING", // GSI
  name: "STRING",
  email: "STRING",
  counterId: "STRING | NULL", // Counter number at center
  isActive: "BOOLEAN",
  createdAt: "STRING (ISO Date)",
  updatedAt: "STRING (ISO Date)",
};

module.exports = OperatorSchema;
