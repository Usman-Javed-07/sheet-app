const express = require("express");
const router = express.Router();
const sheetShareController = require("../controllers/sheetShareController");
const { verifyToken } = require("../middleware/authMiddleware");

// All sharing routes are protected
router.use(verifyToken);

// Get sheet shares
router.get("/:sheetId/shares", sheetShareController.getSheetShares);

// Share sheet
router.post("/:sheetId/share", sheetShareController.shareSheet);

// Update share permission
router.put(
  "/:sheetId/shares/:userId",
  sheetShareController.updateSharePermission
);

// Remove share
router.delete("/:sheetId/shares/:userId", sheetShareController.removeShare);

module.exports = router;
