const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const crypto = require("crypto");
const { docClient } = require("../config/dynamodb");

// Generate unique ID
exports.generateId = (prefix = "") => {
  const id = uuidv4();
  return prefix ? `${prefix}_${id}` : id;
};

// Generate Token Number (Sequential per center per date, with retry for concurrency)
exports.generateTokenNumber = async (centerId, date) => {
  const params = {
    TableName: process.env.APPOINTMENTS_TABLE,
    IndexName: "center-date-index",
    KeyConditionExpression: "centerId = :centerId AND #date = :date",
    ExpressionAttributeNames: {
      "#date": "date",
    },
    ExpressionAttributeValues: {
      ":centerId": centerId,
      ":date": date,
    },
  };

  try {
    const result = await docClient.query(params).promise();
    const existingTokens = new Set(
      result.Items.map((item) => item.tokenNumber),
    );

    // Find the next available token number (handles concurrent duplicates)
    let count = result.Items.length + 1;
    let token = `TKN-${String(count).padStart(3, "0")}`;
    let retries = 0;

    while (existingTokens.has(token) && retries < 10) {
      count++;
      token = `TKN-${String(count).padStart(3, "0")}`;
      retries++;
    }

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    return `TKN-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
  }
};

// Generate QR Code
exports.generateQRCode = async (data) => {
  try {
    // Create a compact string with only essential data
    const qrPayload = `AQMS:${data.appointmentId}:${data.tokenNumber}:${data.date}`;

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "M", // Medium error correction
      type: "image/png",
      quality: 0.92,
      margin: 1,
      width: 300, // 300x300 pixels
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCode;
  } catch (error) {
    console.error("QR Code generation error:", error);
    throw new Error("Failed to generate QR code");
  }
};

// Encrypt Aadhaar Number
exports.encryptAadhaar = (aadhaar) => {
  if (!aadhaar) return null;

  const algorithm = "aes-256-cbc";
  const encryptionSecret = process.env.AADHAAR_ENCRYPTION_KEY || process.env.JWT_SECRET;
  const salt = process.env.ENCRYPTION_SALT || "aadhaar_qms_salt_v1";
  const key = crypto.scryptSync(encryptionSecret, salt, 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(aadhaar, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

// Decrypt Aadhaar Number
exports.decryptAadhaar = (encryptedAadhaar) => {
  if (!encryptedAadhaar) return null;

  const algorithm = "aes-256-cbc";
  const encryptionSecret = process.env.AADHAAR_ENCRYPTION_KEY || process.env.JWT_SECRET;
  const salt = process.env.ENCRYPTION_SALT || "aadhaar_qms_salt_v1";
  const key = crypto.scryptSync(encryptionSecret, salt, 32);

  const [ivHex, encrypted] = encryptedAadhaar.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// Mask Aadhaar Number (show only last 4 digits)
exports.maskAadhaar = (aadhaar) => {
  if (!aadhaar || aadhaar.length !== 12) return null;
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
};

// Calculate slot availability
exports.getSlotAvailability = async (centerId, date, timeSlot) => {
  const { CAPACITY } = require("./constants");

  // Count ACTUAL active operators for this center
  const operatorsResult = await docClient
    .query({
      TableName: process.env.OPERATORS_TABLE,
      IndexName: "center-index",
      KeyConditionExpression: "centerId = :centerId",
      FilterExpression: "isActive = :isActive",
      ExpressionAttributeValues: {
        ":centerId": centerId,
        ":isActive": true,
      },
    })
    .promise();

  const activeOperatorCount = operatorsResult.Items.length;

  if (activeOperatorCount === 0) {
    return {
      total: 0,
      booked: 0,
      available: 0,
      isFull: true,
    };
  }

  // Get existing appointments for this slot
  const appointmentParams = {
    TableName: process.env.APPOINTMENTS_TABLE,
    IndexName: "center-date-slot-index",
    KeyConditionExpression: "centerId = :centerId AND timeSlot = :timeSlot",
    FilterExpression:
      "#date = :date AND #status IN (:pending, :checkedIn, :inProgress)",
    ExpressionAttributeNames: {
      "#date": "date",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":centerId": centerId,
      ":timeSlot": timeSlot,
      ":date": date,
      ":pending": "Pending",
      ":checkedIn": "Checked In",
      ":inProgress": "In Progress",
    },
  };

  const appointmentResult = await docClient.query(appointmentParams).promise();
  const bookedCount = appointmentResult.Items.length;

  const slotCapacity = activeOperatorCount * CAPACITY.APPOINTMENTS_PER_SLOT;

  return {
    total: slotCapacity,
    booked: bookedCount,
    available: slotCapacity - bookedCount,
    isFull: bookedCount >= slotCapacity,
  };
};

// Format date to YYYY-MM-DD
exports.formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Check if user is blocked
exports.isUserBlocked = async (userId) => {
  const params = {
    TableName: process.env.USERS_TABLE,
    Key: { userId },
  };

  const result = await docClient.get(params).promise();
  const user = result.Item;

  if (!user) return false;

  if (user.blockedUntil && new Date(user.blockedUntil) > new Date()) {
    return {
      blocked: true,
      blockedUntil: user.blockedUntil,
      reason: "Multiple no-shows",
    };
  }

  return { blocked: false };
};

// Sanitize input
exports.sanitize = (str) => {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
};
