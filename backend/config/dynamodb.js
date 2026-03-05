require("dotenv").config(); // ADD THIS LINE!

const AWS = require("aws-sdk");

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

// Debug: Log to verify initialization
if (!process.env.AWS_REGION) {
  console.error("❌ ERROR: AWS_REGION is not set in environment variables!");
  console.error("Please check your .env file");
  process.exit(1);
}

console.log(`✅ AWS SDK configured for region: ${process.env.AWS_REGION}`);

module.exports = { dynamoDB, docClient };
