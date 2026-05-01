/**
 * AadhaarQMS — No-Show Detector Lambda
 * ─────────────────────────────────────────────────────────
 * Triggered by EventBridge every 5 minutes (08:00–20:00 IST).
 *
 * Strategy (cost-optimised, NO full table scan):
 *  1. Query AadhaarQMS_Centers for all active centers (small table).
 *  2. For each center, query AadhaarQMS_Appointments using
 *     "center-date-index" GSI (centerId + date = today IST).
 *  3. Filter items where status = "Pending" and slot end-time
 *     has passed the grace period.
 *  4. UpdateItem each overdue appointment → "No Show".
 *  5. UpdateItem the user's noShowCount; block if threshold exceeded.
 *
 * Environment variables required (set in Lambda console):
 *   AWS_REGION_OVERRIDE  – e.g. ap-south-1  (use this if Lambda's
 *                          built-in AWS_REGION is read-only)
 *   APPOINTMENTS_TABLE   – AadhaarQMS_Appointments
 *   CENTERS_TABLE        – AadhaarQMS_Centers
 *   USERS_TABLE          – AadhaarQMS_Users
 *   NO_SHOW_GRACE_MINUTES– default 15
 *   MAX_NO_SHOWS_BEFORE_BLOCK – default 3
 *   BLOCK_DURATION_DAYS  – default 30
 */

const AWS = require("aws-sdk");

const region =
  process.env.AWS_REGION_OVERRIDE ||
  process.env.AWS_REGION ||
  "ap-south-1";

const docClient = new AWS.DynamoDB.DocumentClient({ region });

// ─── Constants ────────────────────────────────────────────
const APPOINTMENTS_TABLE =
  process.env.APPOINTMENTS_TABLE || "AadhaarQMS_Appointments";
const CENTERS_TABLE =
  process.env.CENTERS_TABLE || "AadhaarQMS_Centers";
const USERS_TABLE =
  process.env.USERS_TABLE || "AadhaarQMS_Users";
const GRACE_MINUTES =
  parseInt(process.env.NO_SHOW_GRACE_MINUTES, 10) || 15;
const MAX_NO_SHOWS =
  parseInt(process.env.MAX_NO_SHOWS_BEFORE_BLOCK, 10) || 3;
const BLOCK_DURATION_DAYS =
  parseInt(process.env.BLOCK_DURATION_DAYS, 10) || 30;

// ─── Helpers ──────────────────────────────────────────────

/** Returns today's date in IST as "YYYY-MM-DD" */
function getTodayIST() {
  return new Date()
    .toLocaleString("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split(",")[0]
    .trim(); // "YYYY-MM-DD"
}

/** Returns current IST hour and minute as { hour, minute } */
function getCurrentISTTime() {
  const istString = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [hour, minute] = istString.split(":").map(Number);
  return { hour, minute };
}

/**
 * Returns true if the appointment slot is overdue (past end time + grace).
 * timeSlot format: "HH:MM - HH:MM"
 */
function isSlotOverdue(timeSlot, { hour: nowHour, minute: nowMinute }) {
  const endStr = timeSlot.split(" - ")[1];
  if (!endStr) return false;

  const [endHour, endMinute] = endStr.split(":").map(Number);

  // Add grace period to slot end
  let graceHour = endHour;
  let graceMinute = endMinute + GRACE_MINUTES;
  if (graceMinute >= 60) {
    graceHour += Math.floor(graceMinute / 60);
    graceMinute = graceMinute % 60;
  }

  // Current time (in minutes) vs grace deadline (in minutes)
  const nowTotal = nowHour * 60 + nowMinute;
  const graceTotal = graceHour * 60 + graceMinute;

  return nowTotal >= graceTotal;
}

// ─── DynamoDB Operations ───────────────────────────────────

/** Fetch all active centers (small table — cheap scan) */
async function getActiveCenters() {
  const params = {
    TableName: CENTERS_TABLE,
    FilterExpression: "isActive = :active",
    ExpressionAttributeValues: { ":active": true },
    ProjectionExpression: "centerId",
  };

  const items = [];
  let lastKey;
  do {
    if (lastKey) params.ExclusiveStartKey = lastKey;
    const result = await docClient.scan(params).promise();
    items.push(...result.Items);
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

/**
 * Query all Pending appointments for a center on today's date
 * using center-date-index GSI — NO full table scan.
 */
async function getPendingForCenter(centerId, today) {
  const params = {
    TableName: APPOINTMENTS_TABLE,
    IndexName: "center-date-index",
    KeyConditionExpression: "centerId = :centerId AND #date = :date",
    FilterExpression: "#status = :pending",
    ExpressionAttributeNames: {
      "#date": "date",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":centerId": centerId,
      ":date": today,
      ":pending": "Pending",
    },
    ProjectionExpression:
      "appointmentId, userId, timeSlot, #status",
  };

  const items = [];
  let lastKey;
  do {
    if (lastKey) params.ExclusiveStartKey = lastKey;
    const result = await docClient.query(params).promise();
    items.push(...result.Items);
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

/** Mark a single appointment as No Show */
async function markNoShow(appointmentId) {
  await docClient
    .update({
      TableName: APPOINTMENTS_TABLE,
      Key: { appointmentId },
      UpdateExpression:
        "SET #status = :noshow, updatedAt = :now",
      ConditionExpression: "#status = :pending", // safe guard — only update if still Pending
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":noshow": "No Show",
        ":pending": "Pending",
        ":now": new Date().toISOString(),
      },
    })
    .promise();
}

/** Increment user's no-show count; block if threshold reached */
async function handleUserNoShow(userId) {
  // Fetch current user state
  const result = await docClient
    .get({ TableName: USERS_TABLE, Key: { userId } })
    .promise();

  if (!result.Item) return;

  const currentCount = result.Item.noShowCount || 0;
  const newCount = currentCount + 1;

  let blockedUntil = result.Item.blockedUntil || null;
  if (newCount >= MAX_NO_SHOWS) {
    const blockDate = new Date();
    blockDate.setDate(blockDate.getDate() + BLOCK_DURATION_DAYS);
    blockedUntil = blockDate.toISOString();
  }

  await docClient
    .update({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression:
        "SET noShowCount = :count, blockedUntil = :blockedUntil, updatedAt = :now",
      ExpressionAttributeValues: {
        ":count": newCount,
        ":blockedUntil": blockedUntil,
        ":now": new Date().toISOString(),
      },
    })
    .promise();

  console.log(
    `  ↳ User ${userId} — noShowCount: ${newCount}${blockedUntil ? " [BLOCKED until " + blockedUntil + "]" : ""}`
  );
}

// ─── Lambda Handler ────────────────────────────────────────

exports.handler = async (event) => {
  console.log("🕐 No-Show Detector Lambda started", {
    time: new Date().toISOString(),
    event,
  });

  const today = getTodayIST();
  const nowIST = getCurrentISTTime();

  console.log(
    `📅 Today (IST): ${today}  |  Current IST: ${nowIST.hour}:${String(nowIST.minute).padStart(2, "0")}  |  Grace: ${GRACE_MINUTES} min`
  );

  // 1. Get all active centers
  let centers;
  try {
    centers = await getActiveCenters();
    console.log(`🏢 Active centers found: ${centers.length}`);
  } catch (err) {
    console.error("❌ Failed to fetch centers:", err);
    throw err;
  }

  if (centers.length === 0) {
    console.log("ℹ️  No active centers — nothing to process.");
    return { statusCode: 200, body: "No active centers." };
  }

  let totalMarked = 0;
  const errors = [];

  // 2. Process each center
  for (const { centerId } of centers) {
    try {
      const pending = await getPendingForCenter(centerId, today);

      for (const appt of pending) {
        if (!isSlotOverdue(appt.timeSlot, nowIST)) continue;

        try {
          await markNoShow(appt.appointmentId);
          await handleUserNoShow(appt.userId);
          totalMarked++;
          console.log(
            `  ✅ Marked NO_SHOW: ${appt.appointmentId} (slot: ${appt.timeSlot})`
          );
        } catch (updateErr) {
          // ConditionalCheckFailedException means status already changed — safe to skip
          if (
            updateErr.code === "ConditionalCheckFailedException"
          ) {
            console.log(
              `  ⏭  Skipped ${appt.appointmentId} — status already changed`
            );
          } else {
            console.error(
              `  ❌ Failed to update ${appt.appointmentId}:`,
              updateErr.message
            );
            errors.push(appt.appointmentId);
          }
        }
      }
    } catch (centerErr) {
      console.error(
        `❌ Error processing center ${centerId}:`,
        centerErr.message
      );
      errors.push(`center:${centerId}`);
    }
  }

  const summary = {
    today,
    centersProcessed: centers.length,
    totalNoShowsMarked: totalMarked,
    errors: errors.length > 0 ? errors : undefined,
  };

  console.log("✅ Lambda complete:", summary);

  return {
    statusCode: 200,
    body: JSON.stringify(summary),
  };
};
