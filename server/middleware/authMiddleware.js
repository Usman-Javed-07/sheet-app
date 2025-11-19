const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { User, Role } = require("../models");

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: "role" }],
    });

    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or inactive" });
    }

    req.user = user;
    req.userRole = user.role.name;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Check if user has specific role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(req.userRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = requireRole("admin");

// Check if user is admin or manager
const requireAdminOrManager = requireRole("admin", "manager");

module.exports = {
  verifyToken,
  requireRole,
  requireAdmin,
  requireAdminOrManager,
};
