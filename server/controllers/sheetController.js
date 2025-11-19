// /mnt/data/sheetController.js
const {
  Sheet,
  SheetCell,
  SheetShare,
  User,
  Branch,
  Team,
} = require("../models");
const { logActivity } = require("../utils/activityLogger");
const {
  createNotification,
  createBulkNotifications,
} = require("../utils/notificationService");
const { sendSheetSharedEmail } = require("../utils/emailService");
const { Op } = require("sequelize");

// ---------- Helper functions (local) ----------

async function checkSheetAccess(userId, sheetId, userRole) {
  const user = await User.findByPk(userId);
  const sheet = await Sheet.findByPk(sheetId);

  if (!sheet || !user) return false;

  if (userRole === "admin") return true;
  if (userRole === "manager") return sheet.branch_id === user.branch_id;
  if (userRole === "team_lead") return sheet.team_id === user.team_id;

  // User or Agent - check if shared
  const share = await SheetShare.findOne({
    where: { sheet_id: sheetId, shared_with_user_id: userId },
  });

  return !!share;
}

async function checkSheetEditAccess(userId, sheetId, userRole) {
  const user = await User.findByPk(userId);
  const sheet = await Sheet.findByPk(sheetId);

  if (!sheet || !user) return false;

  if (userRole === "admin") return true;
  if (userRole === "manager") return sheet.branch_id === user.branch_id;
  if (userRole === "team_lead") return sheet.team_id === user.team_id;
  if (userRole === "user") {
    const share = await SheetShare.findOne({
      where: {
        sheet_id: sheetId,
        shared_with_user_id: userId,
        permission_level: "edit",
      },
    });
    return !!share;
  }

  return false;
}

// ---------- Controllers ----------

// Get all sheets (with role-based filtering)
async function getAllSheets(req, res) {
  try {
    const { page = 1, limit = 20, search, archived } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (archived === "false") {
      where.is_archived = false;
    }

    let include = [
      { model: User, as: "creator" },
      { model: Branch, as: "branch" },
    ];

    // Role-based filtering
    if (req.userRole === "admin") {
      // Admin sees all sheets
    } else if (req.userRole === "manager") {
      where.branch_id = req.user.branch_id;
    } else if (req.userRole === "team_lead") {
      where.team_id = req.user.team_id;
    } else {
      // User and Agent only see shared sheets
      include.push({
        model: SheetShare,
        as: "shares",
        where: { shared_with_user_id: req.user.id },
        required: true,
      });
    }

    // Search
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Sheet.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      distinct: true,
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
    console.error("Error fetching sheets:", error);
    res.status(500).json({ success: false, message: "Failed to fetch sheets" });
  }
}

// Get sheet by ID with cells
async function getSheetById(req, res) {
  try {
    const { id } = req.params;

    const sheet = await Sheet.findByPk(id, {
      include: [
        { model: User, as: "creator" },
        { model: Branch, as: "branch" },
        { model: Team, as: "team" },
      ],
    });

    if (!sheet) {
      return res
        .status(404)
        .json({ success: false, message: "Sheet not found" });
    }

    // Permission check
    const hasAccess = await checkSheetAccess(req.user.id, id, req.userRole);
    if (!hasAccess) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    // Get cells
    const cells = await SheetCell.findAll({
      where: { sheet_id: id },
    });

    res.json({
      success: true,
      data: {
        sheet,
        cells,
      },
    });
  } catch (error) {
    console.error("Error fetching sheet:", error);
    res.status(500).json({ success: false, message: "Failed to fetch sheet" });
  }
}

// Create sheet
async function createSheet(req, res) {
  try {
    const {
      name,
      description,
      branch_id,
      team_id,
      rows = 100,
      columns = 26,
    } = req.body;

    // Validate input
    if (!name || !branch_id) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Permission check
    if (req.userRole === "user" || req.userRole === "agent") {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    // For manager, check branch
    if (req.userRole === "manager" && branch_id !== req.user.branch_id) {
      return res.status(403).json({
        success: false,
        message: "Can only create sheets in your branch",
      });
    }

    const sheet = await Sheet.create({
      name,
      description,
      branch_id,
      team_id: team_id || null,
      created_by: req.user.id,
      rows,
      columns,
    });

    // Log activity
    await logActivity(
      req.user.id,
      "sheet_created",
      "Sheet",
      sheet.id,
      null,
      { name, branch_id, team_id },
      req.ip,
      req.get("user-agent")
    );

    // Create notification for managers/admins
    const notifyUsers = await User.findAll({
      where: {
        branch_id,
        role_id: { [Op.in]: [1, 2] }, // Admin and Manager
      },
    });

    const userIds = notifyUsers
      .map((u) => u.id)
      .filter((id) => id !== req.user.id);
    if (userIds.length > 0) {
      await createBulkNotifications(
        userIds,
        req.user.id,
        "sheet_created",
        `Sheet "${name}" created`,
        `${req.user.username} created a new sheet`,
        "Sheet",
        sheet.id
      );
    }

    res.status(201).json({
      success: true,
      message: "Sheet created successfully",
      data: sheet,
    });
  } catch (error) {
    console.error("Error creating sheet:", error);
    res.status(500).json({ success: false, message: "Failed to create sheet" });
  }
}

// Update sheet
async function updateSheet(req, res) {
  try {
    const { id } = req.params;
    const { name, description, is_archived } = req.body;

    const sheet = await Sheet.findByPk(id);
    if (!sheet) {
      return res
        .status(404)
        .json({ success: false, message: "Sheet not found" });
    }

    // Permission check
    const canEdit = await checkSheetEditAccess(req.user.id, id, req.userRole);
    if (!canEdit) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    const oldValues = {
      name: sheet.name,
      description: sheet.description,
      is_archived: sheet.is_archived,
    };

    await sheet.update({
      name: name || sheet.name,
      description: description !== undefined ? description : sheet.description,
      is_archived: is_archived !== undefined ? is_archived : sheet.is_archived,
    });

    // Log activity
    await logActivity(
      req.user.id,
      "sheet_updated",
      "Sheet",
      sheet.id,
      oldValues,
      { name, description, is_archived },
      req.ip,
      req.get("user-agent")
    );

    // Create notification
    await createNotification(
      sheet.created_by,
      req.user.id,
      "sheet_updated",
      `Sheet "${sheet.name}" updated`,
      `${req.user.username} updated the sheet`,
      "Sheet",
      sheet.id
    );

    res.json({
      success: true,
      message: "Sheet updated successfully",
      data: sheet,
    });
  } catch (error) {
    console.error("Error updating sheet:", error);
    res.status(500).json({ success: false, message: "Failed to update sheet" });
  }
}

// Delete sheet
async function deleteSheet(req, res) {
  try {
    const { id } = req.params;

    const sheet = await Sheet.findByPk(id);
    if (!sheet) {
      return res
        .status(404)
        .json({ success: false, message: "Sheet not found" });
    }

    // Permission check
    const canEdit = await checkSheetEditAccess(req.user.id, id, req.userRole);
    if (!canEdit) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    const sheetName = sheet.name;
    await sheet.destroy();

    // Log activity
    await logActivity(
      req.user.id,
      "sheet_deleted",
      "Sheet",
      id,
      { name: sheetName },
      null,
      req.ip,
      req.get("user-agent")
    );

    res.json({ success: true, message: "Sheet deleted successfully" });
  } catch (error) {
    console.error("Error deleting sheet:", error);
    res.status(500).json({ success: false, message: "Failed to delete sheet" });
  }
}

module.exports = {
  getAllSheets,
  getSheetById,
  createSheet,
  updateSheet,
  deleteSheet,
  checkSheetAccess,
  checkSheetEditAccess,
};
