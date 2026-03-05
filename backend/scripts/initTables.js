require("dotenv").config();
const { initializeTables } = require("../utils/dynamodb");

async function init() {
  try {
    console.log("🔄 Starting DynamoDB table initialization...");
    console.log(`📍 Region: ${process.env.AWS_REGION}`);
    console.log("");

    await initializeTables();

    console.log("");
    console.log("✅ All tables initialized successfully!");
    console.log("");
    console.log("💡 Next steps:");
    console.log("   1. Run: npm run seed (to seed initial data)");
    console.log("   2. Run: npm run dev (to start the server)");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing tables:", error);
    process.exit(1);
  }
}

init();
