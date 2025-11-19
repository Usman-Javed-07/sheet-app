require("dotenv").config();

module.exports = {
  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "sheet_app",
  DB_PORT: process.env.DB_PORT || 3306,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",

  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Email (Nodemailer)
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || "your-email@gmail.com",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "your-password",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@sheetapp.com",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Pagination
  PAGE_SIZE: 20,
};
