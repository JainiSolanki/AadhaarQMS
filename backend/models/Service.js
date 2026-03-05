/**
 * Service Model Schema
 */

const ServiceSchema = {
  serviceId: "STRING (PK)", // Primary Key
  name: "STRING",
  description: "STRING",
  duration: "NUMBER (minutes)",
  requiresDocuments: "BOOLEAN",
  documentsRequired: ["POI", "POA", "DOB", "RELATIONSHIP"], // Array of strings
  isActive: "BOOLEAN",
  createdAt: "STRING (ISO Date)",
  updatedAt: "STRING (ISO Date)",
};

module.exports = ServiceSchema;
