const nodemailer = require("nodemailer");
const env = require("../config/env");

// Create transporter
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Send sheet shared notification email
const sendSheetSharedEmail = async (
  recipientEmail,
  recipientName,
  sheetName,
  senderName
) => {
  const subject = `Sheet "${sheetName}" has been shared with you`;
  const html = `
    <h2>Sheet Shared</h2>
    <p>Hi ${recipientName},</p>
    <p>${senderName} has shared a sheet with you:</p>
    <h3>${sheetName}</h3>
    <p>Log in to your account to view the sheet.</p>
    <a href="${env.FRONTEND_URL}/login">Open App</a>
  `;

  return sendEmail(recipientEmail, subject, html);
};

// Send user creation notification email
const sendUserCreatedEmail = async (email, username, password, createdBy) => {
  const subject = "Account Created - Sheet Management App";
  const html = `
    <h2>Welcome to Sheet Management App</h2>
    <p>Hi ${username},</p>
    <p>Your account has been created by ${createdBy}.</p>
    <p><strong>Username:</strong> ${username}</p>
    <p><strong>Temporary Password:</strong> ${password}</p>
    <p>Please log in and change your password immediately.</p>
    <a href="${env.FRONTEND_URL}/login">Log In</a>
  `;

  return sendEmail(email, subject, html);
};

module.exports = {
  sendEmail,
  sendSheetSharedEmail,
  sendUserCreatedEmail,
};
