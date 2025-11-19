const { Notification, User } = require("../models");
const { Op } = require("sequelize");

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, is_read } = req.query;
    const offset = (page - 1) * limit;

    let where = { user_id: req.user.id };

    if (is_read !== undefined) {
      where.is_read = is_read === "true";
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["id", "username", "first_name"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await notification.update({
      is_read: true,
      read_at: new Date(),
    });

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: req.user.id, is_read: false } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark all as read" });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await notification.destroy();

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete notification" });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { user_id: req.user.id, is_read: false },
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, message: "Failed to get count" });
  }
};

module.exports = exports;
