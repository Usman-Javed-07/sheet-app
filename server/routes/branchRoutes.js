const express = require("express");
const router = express.Router();
const branchController = require("../controllers/branchController");
const { verifyToken } = require("../middleware/authMiddleware");

// All branch routes are protected
router.use(verifyToken);

// Get all branches
router.get("/", branchController.getAllBranches);

// Create branch (Admin only)
router.post("/", branchController.createBranch);

// Get branch by ID
router.get("/:id", branchController.getBranchById);

// Update branch
router.put("/:id", branchController.updateBranch);

// Delete branch
router.delete("/:id", branchController.deleteBranch);

// Get branch users
router.get("/:id/users", branchController.getBranchUsers);

module.exports = router;
