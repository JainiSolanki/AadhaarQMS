/**
 * AadhaarQMS — SMS Service (Twilio)
 * ─────────────────────────────────────────────────────────
 * Uses Twilio API (trial account - works with verified numbers only).
 * Sends a short deep-link to the /qr page.
 *
 * Environment variables required:
 *   TWILIO_ACCOUNT_SID   – from twilio.com console
 *   TWILIO_AUTH_TOKEN    – from twilio.com console
 *   TWILIO_PHONE_NUMBER  – your Twilio phone number (e.g. +16066605563)
 *   FRONTEND_URL         – e.g. http://localhost:5173 (used for CORS / app)
 *   SMS_PUBLIC_URL       – Public URL for SMS links (e.g. ngrok or deployed URL).
 *                          If not set, falls back to FRONTEND_URL.
 *                          Example: https://xxxx-xxxx.ngrok-free.app
 */

const https = require("https");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// SMS_PUBLIC_URL is specifically for the link sent in SMS messages.
// Use your ngrok URL or deployed frontend URL here so the link works on a real phone.
// Falls back to FRONTEND_URL if not set.
const SMS_PUBLIC_URL = (
  process.env.SMS_PUBLIC_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
).replace(/\/$/, "");

// Warn at startup if SMS links will point to localhost (won't work on a real phone)
if (SMS_PUBLIC_URL.includes("localhost")) {
  console.warn(
    "⚠️  SMS_PUBLIC_URL is set to localhost — SMS QR links will NOT work on a real " +
    "phone. Set SMS_PUBLIC_URL=https://your-ngrok-url in .env to fix this."
  );
}

// ─── Core SMS sender ──────────────────────────────────────

/**
 * Send an SMS via Twilio API.
 * @param {string} phoneNumber - Phone number with country code (e.g. +919876543210)
 * @param {string} message     - Plain text message
 * @returns {Promise<object>}  - Twilio API response
 */
async function sendSMS(phoneNumber, message) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn(
      "⚠️  Twilio credentials not set — SMS skipped (silent fail)"
    );
    return { skipped: true, reason: "Twilio credentials not configured" };
  }

  // Ensure phone number has country code (add +91 for India if missing)
  let cleanPhone = String(phoneNumber).replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "+91" + cleanPhone; // Add India country code
  } else if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+" + cleanPhone;
  } else {
    cleanPhone = "+" + cleanPhone;
  }

  // Twilio API payload
  const payload = new URLSearchParams({
    To: cleanPhone,
    From: TWILIO_PHONE_NUMBER,
    Body: message,
  }).toString();

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.twilio.com",
      path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 201) {
            console.log(`✅ SMS sent to ${cleanPhone} via Twilio:`, parsed.sid);
            resolve(parsed);
          } else {
            console.warn(
              `⚠️  Twilio warning for ${cleanPhone}:`,
              parsed.message || data
            );
            resolve(parsed); // resolve so booking still succeeds
          }
        } catch {
          console.warn("⚠️  Twilio response parse error:", data);
          resolve({ raw: data }); // resolve so booking still succeeds
        }
      });
    });

    req.on("error", (err) => {
      // Log but don't reject — SMS failure must NOT block booking
      console.error("❌ Twilio request error:", err.message);
      resolve({ error: err.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.warn("⚠️  Twilio request timed out — SMS skipped");
      resolve({ skipped: true, reason: "timeout" });
    });

    req.write(payload);
    req.end();
  });
}

// ─── Message Templates ────────────────────────────────────

/**
 * Send booking confirmation SMS with a QR deep-link.
 * @param {object} params
 * @param {string} params.phone         - Phone number (10-digit or with country code)
 * @param {string} params.name          - Citizen name
 * @param {string} params.appointmentId - e.g. APPT-abc123
 * @param {string} params.tokenNumber   - e.g. TKN-001
 * @param {string} params.date          - YYYY-MM-DD
 * @param {string} params.timeSlot      - HH:MM - HH:MM
 * @param {string} params.centerName    - Name of the Aadhaar center
 */
async function sendBookingConfirmation({
  phone,
  name,
  appointmentId,
  tokenNumber,
  date,
  timeSlot,
  centerName,
}) {
  const qrLink = `${SMS_PUBLIC_URL}/qr?id=${appointmentId}`;

  const message =
    `AadhaarQMS: Hi ${name.split(" ")[0]}, your appointment is confirmed!\n` +
    `Token: ${tokenNumber}\n` +
    `Date: ${date} | ${timeSlot}\n` +
    `Center: ${centerName}\n` +
    `Show this QR: ${qrLink}`;

  console.log(
    `📱 Sending booking SMS to ${phone} for appointment ${appointmentId}`
  );
  return sendSMS(phone, message);
}

/**
 * Send a no-show warning SMS (optional — can be used by Lambda or scheduler).
 * @param {object} params
 * @param {string} params.phone      - Phone number (10-digit or with country code)
 * @param {string} params.name       - Citizen name
 * @param {number} params.noShowCount- Current no-show count
 * @param {number} params.maxAllowed - Block threshold
 */
async function sendNoShowWarning({ phone, name, noShowCount, maxAllowed }) {
  const remaining = maxAllowed - noShowCount;
  const message =
    `AadhaarQMS: Hi ${name.split(" ")[0]}, you missed your appointment today ` +
    `(No-Show #${noShowCount}). ` +
    (remaining > 0
      ? `${remaining} more will result in a 30-day block.`
      : `Your account has been blocked for 30 days.`);

  console.log(`📱 Sending no-show warning SMS to ${phone}`);
  return sendSMS(phone, message);
}

// ─── Exports ──────────────────────────────────────────────

module.exports = {
  sendSMS,
  sendBookingConfirmation,
  sendNoShowWarning,
};
