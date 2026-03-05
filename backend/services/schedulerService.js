/**
 * Auto No-Show Scheduler
 * Runs every 5 minutes to mark "Pending" appointments as "No Show"
 * when their time slot has fully passed.
 */

const { docClient } = require("../config/dynamodb");
const { STATUSES } = require("../utils/constants");

// Handle no-show: increment user count and optionally block
async function handleNoShow(userId) {
    try {
        const userResult = await docClient
            .get({
                TableName: process.env.USERS_TABLE,
                Key: { userId },
            })
            .promise();

        if (!userResult.Item) return;

        const user = userResult.Item;
        const newNoShowCount = (user.noShowCount || 0) + 1;
        const maxNoShows = parseInt(process.env.MAX_NO_SHOWS_BEFORE_BLOCK) || 3;
        const blockDurationDays = parseInt(process.env.BLOCK_DURATION_DAYS) || 30;

        let blockedUntil = null;

        if (newNoShowCount >= maxNoShows) {
            const blockDate = new Date();
            blockDate.setDate(blockDate.getDate() + blockDurationDays);
            blockedUntil = blockDate.toISOString();
        }

        await docClient
            .update({
                TableName: process.env.USERS_TABLE,
                Key: { userId },
                UpdateExpression:
                    "SET noShowCount = :count, blockedUntil = :blockedUntil, updatedAt = :updatedAt",
                ExpressionAttributeValues: {
                    ":count": newNoShowCount,
                    ":blockedUntil": blockedUntil,
                    ":updatedAt": new Date().toISOString(),
                },
            })
            .promise();

        console.log(
            `  ↳ User ${userId} no-show count: ${newNoShowCount}${blockedUntil ? " — BLOCKED" : ""}`,
        );
    } catch (error) {
        console.error("Error handling no-show for user:", userId, error);
    }
}

async function markNoShows() {
    try {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Scan for today's pending appointments
        const result = await docClient
            .scan({
                TableName: process.env.APPOINTMENTS_TABLE,
                FilterExpression: "#date = :date AND #status = :pending",
                ExpressionAttributeNames: {
                    "#date": "date",
                    "#status": "status",
                },
                ExpressionAttributeValues: {
                    ":date": today,
                    ":pending": STATUSES.PENDING,
                },
            })
            .promise();

        let markedCount = 0;

        for (const appointment of result.Items) {
            // Parse slot end time: "HH:MM - HH:MM" → take the end time
            const slotEndStr = appointment.timeSlot.split(" - ")[1];
            if (!slotEndStr) continue;

            const [endHour, endMinute] = slotEndStr.split(":").map(Number);

            // If current time is past the slot end time, mark as no-show
            if (
                currentHour > endHour ||
                (currentHour === endHour && currentMinute >= endMinute)
            ) {
                await docClient
                    .update({
                        TableName: process.env.APPOINTMENTS_TABLE,
                        Key: { appointmentId: appointment.appointmentId },
                        UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
                        ExpressionAttributeNames: { "#status": "status" },
                        ExpressionAttributeValues: {
                            ":status": STATUSES.NO_SHOW,
                            ":updatedAt": new Date().toISOString(),
                        },
                    })
                    .promise();

                await handleNoShow(appointment.userId);
                markedCount++;
            }
        }

        if (markedCount > 0) {
            console.log(`🕐 Auto No-Show: Marked ${markedCount} appointment(s)`);
        }
    } catch (error) {
        console.error("❌ Auto No-Show scheduler error:", error);
    }
}

// Start the scheduler (runs every 5 minutes)
function startScheduler() {
    console.log("⏰ Auto No-Show scheduler started (every 5 minutes)");

    // Run once immediately
    markNoShows();

    // Then every 5 minutes
    setInterval(markNoShows, 5 * 60 * 1000);
}

module.exports = { startScheduler, markNoShows };
