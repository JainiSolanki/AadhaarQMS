// const nodemailer = require("nodemailer");

// // Create transporter (Gmail free SMTP)
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false, // Use TLS
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD, // Use Gmail App Password
//   },
// });

// // Verify connection
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("❌ Email service error:", error);
//   } else {
//     console.log("✅ Email service ready");
//   }
// });

// // Send booking confirmation email
// exports.sendBookingConfirmation = async ({
//   email,
//   name,
//   appointment,
//   qrCode,
// }) => {
//   const mailOptions = {
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject: "Appointment Confirmation - AadhaarQMS",
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: #0055A4; color: white; padding: 20px; text-align: center; }
//           .content { background: #f9f9f9; padding: 20px; }
//           .appointment-details { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #FF9933; }
//           .qr-code { text-align: center; margin: 20px 0; }
//           .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
//           .token { font-size: 24px; font-weight: bold; color: #FF9933; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>🎫 Appointment Confirmed</h1>
//           </div>
//           <div class="content">
//             <p>Dear ${name},</p>
//             <p>Your Aadhaar appointment has been successfully booked.</p>
            
//             <div class="appointment-details">
//               <p><strong>Token Number:</strong> <span class="token">${appointment.tokenNumber}</span></p>
//               <p><strong>Date:</strong> ${appointment.date}</p>
//               <p><strong>Time Slot:</strong> ${appointment.timeSlot}</p>
//               <p><strong>Service:</strong> ${appointment.serviceName}</p>
//               <p><strong>Center:</strong> ${appointment.centerName}</p>
//               <p><strong>Address:</strong> ${appointment.centerAddress}</p>
//             </div>
            
//             <div class="qr-code">
//               <p><strong>Show this QR code at the center:</strong></p>
//               <img src="${qrCode}" alt="QR Code" style="max-width: 200px;" />
//             </div>
            
//             <p><strong>Important Instructions:</strong></p>
//             <ul>
//               <li>Arrive 15 minutes before your slot</li>
//               <li>Carry original documents</li>
//               <li>Show this QR code at the reception</li>
//               <li>Wear a mask and maintain social distancing</li>
//             </ul>
            
//             <p>You can track your queue position in real-time on our website.</p>
//           </div>
//           <div class="footer">
//             <p>AadhaarQMS - Simplified Appointment Management</p>
//             <p>This is an automated email. Please do not reply.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("✅ Booking confirmation email sent to:", email);
//   } catch (error) {
//     console.error("❌ Error sending email:", error);
//     throw error;
//   }
// };

// // Send appointment reminder
// exports.sendAppointmentReminder = async ({ email, name, appointment }) => {
//   const mailOptions = {
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject: "Reminder: Your Appointment Tomorrow - AadhaarQMS",
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background: #FF9933; color: white; padding: 20px; text-align: center; }
//           .content { padding: 20px; }
//           .reminder { background: #FFF3CD; padding: 15px; border-left: 4px solid #FF9933; margin: 20px 0; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>⏰ Appointment Reminder</h1>
//           </div>
//           <div class="content">
//             <p>Dear ${name},</p>
//             <p>This is a reminder for your appointment tomorrow.</p>
            
//             <div class="reminder">
//               <p><strong>Token:</strong> ${appointment.tokenNumber}</p>
//               <p><strong>Date:</strong> ${appointment.date}</p>
//               <p><strong>Time:</strong> ${appointment.timeSlot}</p>
//               <p><strong>Center:</strong> ${appointment.centerName}</p>
//             </div>
            
//             <p>Don't forget to carry your documents!</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("✅ Reminder email sent to:", email);
//   } catch (error) {
//     console.error("❌ Error sending reminder:", error);
//   }
// };

// // Send status update notification
// exports.sendStatusUpdate = async ({ email, name, tokenNumber, status }) => {
//   const mailOptions = {
//     from: process.env.EMAIL_FROM,
//     to: email,
//     subject: `Appointment Status Updated - ${tokenNumber}`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <body style="font-family: Arial, sans-serif;">
//         <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
//           <h2>Appointment Status Update</h2>
//           <p>Dear ${name},</p>
//           <p>Your appointment status has been updated to: <strong>${status}</strong></p>
//           <p>Token Number: <strong>${tokenNumber}</strong></p>
//         </div>
//       </body>
//       </html>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     console.error("Error sending status update email:", error);
//   }
// };
