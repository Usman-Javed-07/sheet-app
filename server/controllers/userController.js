const { User, Role, Branch, Team } = require("../models");
const { logActivity } = require("../utils/activityLogger");
const { createNotification } = require("../utils/notificationService");
const { sendUserCreatedEmail } = require("../utils/emailService");
const crypto = require("crypto");
const { Op } = require("sequelize");

// Get all users (with role-based filtering)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let where = { is_active: true };
    let include = [{ model: Role, as: "role" }];

    // Filter based on user role
    if (req.userRole === "manager") {
      where.branch_id = req.user.branch_id;
    } else if (req.userRole === "team_lead") {
      where.team_id = req.user.team_id;
    }

    // Search
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include,
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
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        { model: Role, as: "role" },
        { model: Branch, as: "branch" },
        { model: Team, as: "team" },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Permission check
    if (req.userRole === "manager" && user.branch_id !== req.user.branch_id) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    if (req.userRole === "team_lead" && user.team_id !== req.user.team_id) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

// Create user
// Create user (Admin/Manager)
exports.createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      first_name,
      last_name,
      role_id,
      branch_id,
      team_id,
      password,     // ✅ NEW optional password
    } = req.body;

    // Validate input
    if (!username || !email || !role_id) {
      return res
        .status(400)
        .json({ success: false, message: "Username, email and role are required" });
    }

    // Check for duplicates
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Find role object
    const roleToCreate = await Role.findByPk(role_id);
    if (!roleToCreate) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Role-based permissions (admin vs manager)
    if (req.userRole === "manager") {
      // Manager can only create limited roles
      if (!["user", "agent", "team_lead"].includes(roleToCreate.name)) {
        return res
          .status(403)
          .json({ success: false, message: "Cannot create this role" });
      }

      // Manager can only create in their own branch
      if (branch_id && branch_id !== req.user.branch_id) {
        return res.status(403).json({
          success: false,
          message: "Can only create users in your branch",
        });
      }
    }

    // ✅ Decide final password (user-specified or generated)
    let plainPassword = password;
    if (!plainPassword) {
      plainPassword = crypto.randomBytes(8).toString("hex"); // fallback temp password
    }

    // Create the user (hooks will hash password_hash)
    const user = await User.create({
      username,
      email,
      first_name,
      last_name,
      role_id,
      branch_id: branch_id || null,
      team_id: team_id || null,
      password_hash: plainPassword,
      is_active: true,
    });

    // Log activity
    await logActivity(
      req.user.id,
      "user_created",
      "User",
      user.id,
      null,
      { username, email, role_id, branch_id, team_id },
      req.ip,
      req.get("user-agent")
    );

    // Optional: create notification for the new user
    await createNotification(
      user.id,
      req.user.id,
      "user_created",
      "Your account has been created",
      `An account has been created for you with username ${username}`,
      "User",
      user.id
    );

    // Send email with credentials
    try {
      await sendUserCreatedEmail(user.email, {
        username: user.username,
        password: plainPassword, // ✅ Always send the actual password
      });
    } catch (emailErr) {
      console.error("Failed to send user created email:", emailErr);
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};


// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, branch_id, team_id, role_id } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Permission checks
    if (req.userRole === "manager" && user.branch_id !== req.user.branch_id) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    const oldValues = {
      first_name: user.first_name,
      last_name: user.last_name,
      branch_id: user.branch_id,
      team_id: user.team_id,
      role_id: user.role_id,
    };

    // Update user
    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      branch_id: branch_id !== undefined ? branch_id : user.branch_id,
      team_id: team_id !== undefined ? team_id : user.team_id,
      role_id: role_id || user.role_id,
    });

    // Log activity
    await logActivity(
      req.user.id,
      "user_updated",
      "User",
      user.id,
      oldValues,
      { first_name, last_name, branch_id, team_id, role_id },
      req.ip,
      req.get("user-agent")
    );

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.userRole !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can delete users" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.destroy();

    // Log activity
    await logActivity(
      req.user.id,
      "user_deleted",
      "User",
      id,
      { username: user.username, email: user.email },
      null,
      req.ip,
      req.get("user-agent")
    );

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

module.exports = exports;
