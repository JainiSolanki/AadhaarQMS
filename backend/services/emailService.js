/**
 * AadhaarQMS — Email Service (Nodemailer)
 * ─────────────────────────────────────────────────────────
 * Sends appointment confirmation emails with QR code.
 * Uses Gmail SMTP with App Password (free tier).
 *
 * Environment variables required:
 *   EMAIL_HOST      – smtp.gmail.com
 *   EMAIL_PORT      – 587
 *   EMAIL_USER      – your-email@gmail.com
 *   EMAIL_PASS      – your-app-password (NOT regular password)
 *   EMAIL_FROM      – sender name/email
 *   SMS_PUBLIC_URL  – public URL for QR link
 */

const nodemailer = require("nodemailer");

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "AadhaarQMS <noreply@aadhaarqms.com>";

const SMS_PUBLIC_URL = (
  process.env.SMS_PUBLIC_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
).replace(/\/$/, "");

// Create transporter (reused for all emails)
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      "⚠️  Email credentials not configured — emails will be skipped"
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // Use TLS (not SSL)
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
}

// ─── Core Email Sender ────────────────────────────────────

/**
 * Send email with nodemailer
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @returns {Promise<object>} - Send result
 */
async function sendEmail({ to, subject, html }) {
  const transport = getTransporter();

  if (!transport) {
    console.warn(`⚠️  Email skipped (credentials not set): ${to}`);
    return { skipped: true, reason: "Email credentials not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send error for ${to}:`, error.message);
    // Return error but don't throw — email failure shouldn't block booking
    return { success: false, error: error.message };
  }
}

// ─── Email Templates ──────────────────────────────────────

/**
 * Send appointment confirmation email with QR link
 * @param {object} params
 * @param {string} params.email - Recipient email
 * @param {string} params.name - Citizen name
 * @param {string} params.appointmentId - Appointment ID
 * @param {string} params.tokenNumber - Token number
 * @param {string} params.date - Appointment date (YYYY-MM-DD)
 * @param {string} params.timeSlot - Time slot (HH:MM - HH:MM)
 * @param {string} params.centerName - Center name
 * @param {string} params.centerCity - Center city
 * @param {string} params.serviceName - Service name
 * @param {string} params.qrCode - QR code as base64 data URL (optional)
 */
async function sendBookingConfirmation({
  email,
  name,
  appointmentId,
  tokenNumber,
  date,
  timeSlot,
  centerName,
  centerCity,
  serviceName,
  qrCode,
}) {
  const qrLink = `${SMS_PUBLIC_URL}/qr?id=${appointmentId}`;

  // Format date for display
  const [year, month, day] = date.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const formattedDate = `${day} ${months[parseInt(month) - 1]} ${year}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #FF6B2B 0%, #FF9462 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 30px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
          }
          .confirmation-box {
            background: #f9f9f9;
            border-left: 4px solid #FF6B2B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #666;
            font-size: 14px;
          }
          .detail-value {
            color: #333;
            font-size: 14px;
          }
          .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
          }
          .qr-section h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
          }
          .qr-image {
            max-width: 200px;
            height: auto;
            margin: 0 auto;
            display: block;
          }
          .qr-link {
            display: inline-block;
            margin-top: 15px;
            padding: 12px 24px;
            background: #FF6B2B;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
          }
          .qr-link:hover {
            background: #E55A1A;
          }
          .instructions {
            background: #E3F2FD;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #1565C0;
          }
          .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
          }
          .footer a {
            color: #FF6B2B;
            text-decoration: none;
          }
          .token-badge {
            display: inline-block;
            background: #FF6B2B;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 16px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🎫 Appointment Confirmed!</h1>
            <p>Your Aadhaar appointment is ready</p>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Hi <strong>${name.split(" ")[0]}</strong>,
            </div>

            <p>Your appointment has been successfully booked. Here are your details:</p>

            <!-- Confirmation Box -->
            <div class="confirmation-box">
              <div class="detail-row">
                <span class="detail-label">Token Number</span>
                <span class="token-badge">${tokenNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${timeSlot}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service</span>
                <span class="detail-value">${serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Center</span>
                <span class="detail-value">${centerName}, ${centerCity}</span>
              </div>
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
              <h3>📱 Your QR Code</h3>
              ${
                qrCode
                  ? `<img src="${qrCode}" alt="Appointment QR Code" class="qr-image">`
                  : ""
              }
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                Show this QR code at the center for quick check-in
              </p>
              <a href="${qrLink}" class="qr-link">View QR Code Online</a>
            </div>

            <!-- Instructions -->
            <div class="instructions">
              <strong>📋 What to do next:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Save this email for your records</li>
                <li>Arrive 5-10 minutes before your appointment time</li>
                <li>Bring your Aadhaar card and valid ID</li>
                <li>Show the QR code at the center kiosk or to the operator</li>
              </ul>
            </div>

            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              If you need to cancel or reschedule, please visit your appointment dashboard at least 2 hours before your scheduled time.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              © 2026 AadhaarQMS - Appointment & Queue Management System
            </p>
            <p style="margin: 0;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  console.log(
    `📧 Sending booking confirmation email to ${email} for appointment ${appointmentId}`
  );

  return sendEmail({
    to: email,
    subject: `Appointment Confirmed - Token ${tokenNumber} - AadhaarQMS`,
    html,
  });
}

/**
 * Send no-show warning email
 * @param {object} params
 * @param {string} params.email - Recipient email
 * @param {string} params.name - Citizen name
 * @param {number} params.noShowCount - Current no-show count
 * @param {number} params.maxAllowed - Block threshold
 */
async function sendNoShowWarning({ email, name, noShowCount, maxAllowed }) {
  const remaining = maxAllowed - noShowCount;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 30px 20px;
          }
          .warning-box {
            background: #FEE2E2;
            border-left: 4px solid #EF4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #991B1B;
          }
          .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Appointment Missed</h1>
          </div>

          <div class="content">
            <p>Hi <strong>${name.split(" ")[0]}</strong>,</p>

            <div class="warning-box">
              <strong>You missed your appointment today (No-Show #${noShowCount})</strong>
              <p style="margin: 10px 0 0 0;">
                ${
                  remaining > 0
                    ? `You have <strong>${remaining} more no-show(s)</strong> before your account is blocked for 30 days.`
                    : `<strong>Your account has been blocked for 30 days.</strong> You cannot book new appointments during this period.`
                }
              </p>
            </div>

            <p>
              If you missed your appointment due to an emergency or technical issue, please contact the Aadhaar center directly to discuss your situation.
            </p>

            <p style="color: #666; font-size: 14px;">
              Please ensure you attend your future appointments on time to avoid further blocks.
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">© 2026 AadhaarQMS - Appointment & Queue Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;

  console.log(`📧 Sending no-show warning email to ${email}`);

  return sendEmail({
    to: email,
    subject: `Appointment Missed - No-Show Warning #${noShowCount} - AadhaarQMS`,
    html,
  });
}

// ─── Exports ──────────────────────────────────────────────

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendNoShowWarning,
};
