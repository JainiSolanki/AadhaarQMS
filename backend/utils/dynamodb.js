const { dynamoDB } = require("../config/dynamodb");
require("dotenv").config();
const TABLE_SCHEMAS = {
  // Users Table
  [process.env.USERS_TABLE]: {
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },

  // Admins Table (3 types: SUPER_ADMIN, CENTER_ADMIN, OPERATOR)
  [process.env.ADMINS_TABLE]: {
    KeySchema: [{ AttributeName: "adminId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "adminId", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
      { AttributeName: "centerId", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "center-index",
        KeySchema: [{ AttributeName: "centerId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },

  // Centers Table (State → City → Centers)
  [process.env.CENTERS_TABLE]: {
    KeySchema: [{ AttributeName: "centerId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "centerId", AttributeType: "S" },
      { AttributeName: "city", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "city-index",
        KeySchema: [{ AttributeName: "city", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },

  // Services Table
  [process.env.SERVICES_TABLE]: {
    KeySchema: [{ AttributeName: "serviceId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "serviceId", AttributeType: "S" }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },

  // Appointments Table
  [process.env.APPOINTMENTS_TABLE]: {
    KeySchema: [{ AttributeName: "appointmentId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "appointmentId", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "centerId", AttributeType: "S" },
      { AttributeName: "date", AttributeType: "S" },
      { AttributeName: "timeSlot", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "user-index",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "center-date-index",
        KeySchema: [
          { AttributeName: "centerId", KeyType: "HASH" },
          { AttributeName: "date", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: "center-date-slot-index",
        KeySchema: [
          { AttributeName: "centerId", KeyType: "HASH" },
          { AttributeName: "timeSlot", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },

  // Operators Table
  [process.env.OPERATORS_TABLE]: {
    KeySchema: [{ AttributeName: "operatorId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "operatorId", AttributeType: "S" },
      { AttributeName: "centerId", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "center-index",
        KeySchema: [{ AttributeName: "centerId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },
};

async function createTable(tableName, schema) {
  const params = {
    TableName: tableName,
    ...schema,
  };

  try {
    await dynamoDB.createTable(params).promise();
    console.log(`✅ Table created: ${tableName}`);

    // Wait for table to be active
    await dynamoDB.waitFor("tableExists", { TableName: tableName }).promise();
    console.log(`✅ Table active: ${tableName}`);
  } catch (error) {
    if (error.code === "ResourceInUseException") {
      console.log(`⚠️  Table already exists: ${tableName}`);
    } else {
      console.error(`❌ Error creating table ${tableName}:`, error);
      throw error;
    }
  }
}

async function initializeTables() {
  console.log("🔄 Starting table initialization...");

  for (const [tableName, schema] of Object.entries(TABLE_SCHEMAS)) {
    await createTable(tableName, schema);
  }

  console.log("✅ All tables initialized successfully");
}

module.exports = { initializeTables };
