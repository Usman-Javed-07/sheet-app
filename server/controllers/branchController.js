const { Branch, User } = require("../models");
const { logActivity } = require("../utils/activityLogger");
const { createNotification } = require("../utils/notificationService");
const { Op } = require("sequelize");

// Get all branches
exports.getAllBranches = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let where = { is_active: true };

    // Non-admin users only see their branch
    if (req.userRole !== "admin") {
      where.id = req.user.branch_id;
    }

    // Search
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Branch.findAndCountAll({
      where,
      include: [{ model: User, as: "users" }],
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
    console.error("Error fetching branches:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch branches" });
  }
};

// Get branch by ID
exports.getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id, {
      include: [{ model: User, as: "users" }],
    });

    if (!branch) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    // Permission check
    if (req.userRole !== "admin" && branch.id !== req.user.branch_id) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    res.json({ success: true, data: branch });
  } catch (error) {
    console.error("Error fetching branch:", error);
    res.status(500).json({ success: false, message: "Failed to fetch branch" });
  }
};

// Create branch (Admin only)
exports.createBranch = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Permission check
    if (req.userRole !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can create branches" });
    }

    // Validate input
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Branch name required" });
    }

    const branch = await Branch.create({
      name,
      description,
      created_by: req.user.id,
    });

    // Log activity
    await logActivity(
      req.user.id,
      "branch_created",
      "Branch",
      branch.id,
      null,
      { name, description },
      req.ip,
      req.get("user-agent")
    );

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    console.error("Error creating branch:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create branch" });
  }
};

// Update branch
exports.updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Permission check
    if (req.userRole !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can update branches" });
    }

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    const oldValues = { name: branch.name, description: branch.description };

    await branch.update({
      name: name || branch.name,
      description: description !== undefined ? description : branch.description,
    });

    // Log activity
    await logActivity(
      req.user.id,
      "branch_updated",
      "Branch",
      branch.id,
      oldValues,
      { name, description },
      req.ip,
      req.get("user-agent")
    );

    res.json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    console.error("Error updating branch:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update branch" });
  }
};

// Delete branch (Admin only)
exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Permission check
    if (req.userRole !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can delete branches" });
    }

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res
        .status(404)
        .json({ success: false, message: "Branch not found" });
    }

    // Soft delete by marking inactive
    await branch.update({ is_active: false });

    // Log activity
    await logActivity(
      req.user.id,
      "branch_deleted",
      "Branch",
      id,
      { name: branch.name },
      null,
      req.ip,
      req.get("user-agent")
    );

    res.json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    console.error("Error deleting branch:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete branch" });
  }
};

// Get branch users
exports.getBranchUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Permission check
    if (req.userRole !== "admin" && req.user.branch_id !== parseInt(id)) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    const { count, rows } = await User.findAndCountAll({
      where: { branch_id: id, is_active: true },
      include: [{ model: "Role", as: "role" }],
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
    console.error("Error fetching branch users:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch branch users" });
  }
};

module.exports = exports;
