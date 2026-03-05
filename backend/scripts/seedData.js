require("dotenv").config();
const bcrypt = require("bcryptjs");
const { docClient } = require("../config/dynamodb");
const { generateId } = require("../utils/helpers");
const { ROLES, SERVICE_TYPES } = require("../utils/constants");

// Seed Super Admin
async function seedSuperAdmin() {
  console.log("🌱 Seeding Super Admin...");

  const hashedPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD,
    10,
  );

  const superAdmin = {
    adminId: generateId("ADMIN"),
    email: process.env.SUPER_ADMIN_EMAIL,
    password: hashedPassword,
    name: "Super Admin",
    role: ROLES.SUPER_ADMIN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await docClient
      .put({
        TableName: process.env.ADMINS_TABLE,
        Item: superAdmin,
        ConditionExpression: "attribute_not_exists(adminId)",
      })
      .promise();
    console.log("✅ Super Admin created:", process.env.SUPER_ADMIN_EMAIL);
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      console.log("⚠️  Super Admin already exists");
    } else {
      throw error;
    }
  }
}

// Seed Services
async function seedServices() {
  console.log("🌱 Seeding Services...");

  const services = [
    {
      serviceId: generateId("SVC"),
      name: SERVICE_TYPES.NEW_ENROLLMENT,
      description: "First time Aadhaar enrollment for citizens",
      duration: 30, // minutes
      requiresDocuments: true,
      documentsRequired: ["POI", "POA", "DOB"],
      isActive: true,
    },
    {
      serviceId: generateId("SVC"),
      name: SERVICE_TYPES.BIOMETRIC_UPDATE,
      description: "Update fingerprint and iris scan",
      duration: 20,
      requiresDocuments: false,
      isActive: true,
    },
    {
      serviceId: generateId("SVC"),
      name: SERVICE_TYPES.ADDRESS_UPDATE,
      description: "Update address in Aadhaar",
      duration: 15,
      requiresDocuments: true,
      documentsRequired: ["POA"],
      isActive: true,
    },
    {
      serviceId: generateId("SVC"),
      name: SERVICE_TYPES.MOBILE_UPDATE,
      description: "Update mobile number linked to Aadhaar",
      duration: 10,
      requiresDocuments: false,
      isActive: true,
    },
    {
      serviceId: generateId("SVC"),
      name: SERVICE_TYPES.NAME_UPDATE,
      description: "Correct or update name in Aadhaar",
      duration: 15,
      requiresDocuments: true,
      documentsRequired: ["POI"],
      isActive: true,
    },
    {
      serviceId: generateId("SVC"),
      name: SERVICE_TYPES.CHILD_AADHAAR,
      description: "Aadhaar enrollment for children below 5 years",
      duration: 25,
      requiresDocuments: true,
      documentsRequired: ["POI", "POA", "DOB", "RELATIONSHIP"],
      isActive: true,
    },
  ];

  for (const service of services) {
    try {
      await docClient
        .put({
          TableName: process.env.SERVICES_TABLE,
          Item: {
            ...service,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
        .promise();
      console.log(`✅ Service created: ${service.name}`);
    } catch (error) {
      console.error(`Error creating service ${service.name}:`, error);
    }
  }
}

// Seed Sample Centers (For Demo)
async function seedSampleCenters() {
  console.log("🌱 Seeding Sample Centers...");

  const centers = [
    {
      centerId: generateId("CENTER"),
      name: "Ahmedabad - Satellite Center",
      address: "123, Jodhpur Cross Road, Satellite",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
      phone: "079-12345678",
      email: "satellite@aadhaar.gov.in",
      operatorCapacity: 8,
      operatingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "09:00", close: "14:00" },
        sunday: { closed: true },
      },
      isActive: true,
    },
    {
      centerId: generateId("CENTER"),
      name: "Ahmedabad - Maninagar Center",
      address: "456, Maninagar Railway Station Road",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380008",
      phone: "079-87654321",
      email: "maninagar@aadhaar.gov.in",
      operatorCapacity: 6,
      operatingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "09:00", close: "14:00" },
        sunday: { closed: true },
      },
      isActive: true,
    },
    {
      centerId: generateId("CENTER"),
      name: "Mumbai - Andheri Center",
      address: "789, Andheri West, Near Metro Station",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400058",
      phone: "022-12345678",
      email: "andheri@aadhaar.gov.in",
      operatorCapacity: 10,
      operatingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "09:00", close: "14:00" },
        sunday: { closed: true },
      },
      isActive: true,
    },
  ];

  for (const center of centers) {
    try {
      await docClient
        .put({
          TableName: process.env.CENTERS_TABLE,
          Item: {
            ...center,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        })
        .promise();
      console.log(`✅ Center created: ${center.name}`);
    } catch (error) {
      console.error(`Error creating center ${center.name}:`, error);
    }
  }
}

// Main seed function
async function seedDatabase() {
  try {
    console.log("🚀 Starting database seeding...");

    await seedSuperAdmin();
    await seedServices();
    await seedSampleCenters();

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
