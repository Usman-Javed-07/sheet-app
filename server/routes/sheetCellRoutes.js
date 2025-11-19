const express = require("express");
const router = express.Router();
const sheetCellController = require("../controllers/sheetCellController");
const { verifyToken } = require("../middleware/authMiddleware");

// All cell routes are protected
router.use(verifyToken);

// Get all cells for a sheet
router.get("/:sheetId/cells", sheetCellController.getSheetCells);

// Save or update cell
router.post("/:sheetId/cells", sheetCellController.saveCell);

// Delete cell
router.delete("/:sheetId/cells/:row/:col", sheetCellController.deleteCell);

module.exports = router;
