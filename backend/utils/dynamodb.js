const AWS = require("aws-sdk");
require("dotenv").config();

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Helper function to create table if not exists
const createTableIfNotExists = async (tableName, keySchema, attributeDefinitions) => {
  const dynamoDBService = new AWS.DynamoDB();
  
  try {
    await dynamoDBService.describeTable({ TableName: tableName }).promise();
    console.log(`✅ Table ${tableName} already exists`);
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      console.log(`⚠️  Creating table ${tableName}...`);
      
      const params = {
        TableName: tableName,
        KeySchema: keySchema,
        AttributeDefinitions: attributeDefinitions,
        BillingMode: 'PAY_PER_REQUEST'
      };
      
      try {
        await dynamoDBService.createTable(params).promise();
        console.log(`✅ Table ${tableName} created successfully`);
      } catch (createError) {
        console.error(`❌ Error creating table ${tableName}:`, createError);
      }
    } else {
      console.error(`❌ Error checking table ${tableName}:`, error);
    }
  }
};

// Initialize all required tables
const initializeTables = async () => {
  // Users Table
  await createTableIfNotExists(
    process.env.USERS_TABLE,
    [{ AttributeName: 'userId', KeyType: 'HASH' }],
    [{ AttributeName: 'userId', AttributeType: 'S' }]
  );

  // Appointments Table
  await createTableIfNotExists(
    process.env.APPOINTMENTS_TABLE,
    [{ AttributeName: 'appointmentId', KeyType: 'HASH' }],
    [{ AttributeName: 'appointmentId', AttributeType: 'S' }]
  );

  // Admins Table
  await createTableIfNotExists(
    process.env.ADMIN_TABLE,
    [{ AttributeName: 'adminId', KeyType: 'HASH' }],
    [{ AttributeName: 'adminId', AttributeType: 'S' }]
  );
};

module.exports = {
  dynamoDB,
  initializeTables
};