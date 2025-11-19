require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const env = require("./config/env");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const sheetRoutes = require("./routes/sheetRoutes");
const sheetCellRoutes = require("./routes/sheetCellRoutes");
const sheetShareRoutes = require("./routes/sheetShareRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const branchRoutes = require("./routes/branchRoutes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sheets", sheetRoutes);
app.use("/api/sheets", sheetCellRoutes);
app.use("/api/sheets", sheetShareRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/branches", branchRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established");

    // Sync database
    await sequelize.sync({ alter: true });
    console.log("Database synchronized");

    // Start server
    const PORT = env.PORT;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
