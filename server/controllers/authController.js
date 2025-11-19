const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
const env = require("../config/env");
const { logActivity } = require("../utils/activityLogger");

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: "role" }],
    });

    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY }
    );

    // Log login activity
    await logActivity(
      user.id,
      "login",
      "User",
      user.id,
      null,
      { email: user.email },
      req.ip,
      req.get("user-agent")
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role.name,
        branch_id: user.branch_id,
        team_id: user.team_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: "role" },
        { model: "Branch", as: "branch" },
        { model: "Team", as: "team" },
      ],
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role.name,
        branch_id: user.branch_id,
        team_id: user.team_id,
      },
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, as: "role" }],
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRY }
    );

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to refresh token" });
  }
};

module.exports = exports;
