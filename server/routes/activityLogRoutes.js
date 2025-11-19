const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLogController");
const { verifyToken } = require("../middleware/authMiddleware");

// All activity log routes are protected
router.use(verifyToken);

// Get activity logs
router.get("/", activityLogController.getActivityLogs);

// Get user activity logs
router.get("/user/:userId", activityLogController.getUserActivityLogs);

module.exports = router;
