const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

// All notification routes are protected
router.use(verifyToken);

// Get notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark as read
router.put("/:id/read", notificationController.markAsRead);

// Mark all as read
router.put("/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
