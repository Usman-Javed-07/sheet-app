const { ActivityLog, User } = require("../models");
const { Op } = require("sequelize");

// Get activity logs (Admin/Manager only)
exports.getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      entity_type,
      user_id,
      startDate,
      endDate,
    } = req.query;
    const offset = (page - 1) * limit;

    // Permission check
    if (req.userRole !== "admin" && req.userRole !== "manager") {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    let where = {};

    // Manager can only see logs for their branch users
    if (req.userRole === "manager") {
      const branchUsers = await User.findAll({
        where: { branch_id: req.user.branch_id },
        attributes: ["id"],
      });
      const userIds = branchUsers.map((u) => u.id);
      where.user_id = { [Op.in]: userIds };
    }

    if (action) {
      where.action = action;
    }

    if (entity_type) {
      where.entity_type = entity_type;
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.created_at[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
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
    console.error("Error fetching activity logs:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch activity logs" });
  }
};

// Get user's activity logs
exports.getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Permission check
    if (req.userRole !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only admin can view specific user logs",
        });
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where: { user_id: userId },
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
    console.error("Error fetching user activity logs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};

module.exports = exports;
