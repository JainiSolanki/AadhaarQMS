/**
 * User Model Schema
 * Represents a citizen user
 */

const UserSchema = {
  userId: "STRING (PK)", // Primary Key
  name: "STRING",
  email: "STRING", // GSI
  phone: "STRING",
  password: "STRING (hashed)",
  role: "STRING (CITIZEN)",
  noShowCount: "NUMBER",
  blockedUntil: "STRING (ISO Date) | NULL",
  createdAt: "STRING (ISO Date)",
  updatedAt: "STRING (ISO Date)",
};

module.exports = UserSchema;
