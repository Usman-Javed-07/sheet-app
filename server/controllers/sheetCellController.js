const { SheetCell, Sheet, SheetShare } = require("../models");
const { logActivity } = require("../utils/activityLogger");
const { createNotification } = require("../utils/notificationService");

// Get all cells for a sheet
exports.getSheetCells = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) {
      return res
        .status(404)
        .json({ success: false, message: "Sheet not found" });
    }

    const cells = await SheetCell.findAndCountAll({
      where: { sheet_id: sheetId },
      limit: parseInt(limit),
      offset,
      order: [
        ["row", "ASC"],
        ["col", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: cells.rows,
      pagination: {
        total: cells.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(cells.count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching cells:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cells" });
  }
};

// Save or update cell
exports.saveCell = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { row, col, value, data_type = "text" } = req.body;

    // Validate input
    if (row === undefined || col === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Row and column required" });
    }

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) {
      return res
        .status(404)
        .json({ success: false, message: "Sheet not found" });
    }

    // Permission check - user must have edit access
    const canEdit = await checkCellEditAccess(
      req.user.id,
      sheetId,
      req.userRole
    );
    if (!canEdit) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    // If value is empty, delete the cell
    if (!value || value.trim() === "") {
      await SheetCell.destroy({
        where: {
          sheet_id: sheetId,
          row: parseInt(row),
          col: parseInt(col),
        },
      });

      // Log activity
      await logActivity(
        req.user.id,
        "cell_deleted",
        "SheetCell",
        null,
        { sheet_id: sheetId, row, col },
        null,
        req.ip,
        req.get("user-agent")
      );

      res.json({ success: true, message: "Cell deleted successfully" });
    } else {
      // Save or update cell
      const [cell, created] = await SheetCell.findOrCreate({
        where: {
          sheet_id: sheetId,
          row: parseInt(row),
          col: parseInt(col),
        },
        defaults: {
          value,
          data_type,
          last_modified_by: req.user.id,
        },
      });

      if (!created) {
        const oldValue = cell.value;
        await cell.update({
          value,
          data_type,
          last_modified_by: req.user.id,
        });

        // Log activity
        await logActivity(
          req.user.id,
          "cell_updated",
          "SheetCell",
          cell.id,
          { value: oldValue },
          { value },
          req.ip,
          req.get("user-agent")
        );
      } else {
        // Log activity for new cell
        await logActivity(
          req.user.id,
          "cell_created",
          "SheetCell",
          cell.id,
          null,
          { value },
          req.ip,
          req.get("user-agent")
        );
      }

      res.json({
        success: true,
        message: "Cell saved successfully",
        data: cell,
      });
    }
  } catch (error) {
    console.error("Error saving cell:", error);
    res.status(500).json({ success: false, message: "Failed to save cell" });
  }
};

// Delete cell
exports.deleteCell = async (req, res) => {
  try {
    const { sheetId, row, col } = req.params;

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) {
      return res
        .status(404)
        .json({ success: false, message: "Sheet not found" });
    }

    // Permission check
    const canEdit = await checkCellEditAccess(
      req.user.id,
      sheetId,
      req.userRole
    );
    if (!canEdit) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    const cell = await SheetCell.findOne({
      where: {
        sheet_id: sheetId,
        row: parseInt(row),
        col: parseInt(col),
      },
    });

    if (!cell) {
      return res
        .status(404)
        .json({ success: false, message: "Cell not found" });
    }

    await cell.destroy();

    // Log activity
    await logActivity(
      req.user.id,
      "cell_deleted",
      "SheetCell",
      cell.id,
      { value: cell.value },
      null,
      req.ip,
      req.get("user-agent")
    );

    res.json({ success: true, message: "Cell deleted successfully" });
  } catch (error) {
    console.error("Error deleting cell:", error);
    res.status(500).json({ success: false, message: "Failed to delete cell" });
  }
};

// Helper function to check cell edit access
async function checkCellEditAccess(userId, sheetId, userRole) {
  // 1) Load the sheet (no includes with invalid aliases)
  const sheet = await Sheet.findByPk(sheetId);
  if (!sheet) return false;

  // 2) Admins can edit everything
  if (userRole === "admin") return true;

  // 3) Sheet creator always has edit access
  if (sheet.created_by === userId) return true;

  // 4) Load the user to check branch/team based permissions if needed
  const user = await User.findByPk(userId);
  if (!user) return false;

  // Managers: can edit sheets in their own branch
  if (userRole === "manager") {
    if (sheet.branch_id && user.branch_id && sheet.branch_id === user.branch_id) {
      return true;
    }
  }

  // 5) For shared sheets, check SheetShare with "edit" permission
  const share = await SheetShare.findOne({
    where: {
      sheet_id: sheetId,
      shared_with_user_id: userId,
      permission_level: "edit",
    },
  });

  return !!share;
}


module.exports = exports;
