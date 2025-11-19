const express = require("express");
const router = express.Router();
const sheetController = require("../controllers/sheetController");
const { verifyToken } = require("../middleware/authMiddleware");

// All sheet routes are protected
router.use(verifyToken);

// Get all sheets
router.get("/", sheetController.getAllSheets);

// Create sheet
router.post("/", sheetController.createSheet);

// Get sheet by ID
router.get("/:id", sheetController.getSheetById);

// Update sheet
router.put("/:id", sheetController.updateSheet);

// Delete sheet
router.delete("/:id", sheetController.deleteSheet);

module.exports = router;
