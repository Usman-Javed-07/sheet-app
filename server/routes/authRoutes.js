const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", authController.login);

// Protected routes
router.get("/me", verifyToken, authController.getCurrentUser);
router.post("/refresh", verifyToken, authController.refreshToken);

module.exports = router;
