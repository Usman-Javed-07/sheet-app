const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// All user routes are protected
router.use(verifyToken);

// Get all users
router.get("/", userController.getAllUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Create user (Admin/Manager)
router.post("/", userController.createUser);

// Update user (Admin/Manager)
router.put("/:id", userController.updateUser);

// Delete user (Admin only)
router.delete("/:id", userController.deleteUser);

module.exports = router;
