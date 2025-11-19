const { SheetShare, Sheet, User } = require("../models");
const { logActivity } = require("../utils/activityLogger");
const { createNotification } = require("../utils/notificationService");
const { sendSheetSharedEmail } = require("../utils/emailService");

// Get sheet shares
exports.getSheetShares = async (req, res) => {
  try {
    const { sheetId } = req.params;

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) {
      return res
        .status(404)
        .json({ success: false, message: "Sheet not found" });
    }

    // Permission check
    const canShare = await checkCanShare(req.user.id, sheetId, req.userRole);
    if (!canShare) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    const shares = await SheetShare.findAll({
      where: { sheet_id: sheetId },
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
    });

    res.json({ success: true, data: shares });
  } catch (error) {
    console.error("Error fetching sheet shares:", error);
    res.status(500).json({ success: false, message: "Failed to fetch shares" });
  }
};

// Share sheet with user
exports.shareSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const {
      shared_with_user_id,
      permission_level = "view",
      expires_at,
    } = req.body;

    // Validate input
    if (!shared_with_user_id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID required" });
    }

    if (!["view", "edit"].includes(permission_level)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid permission level" });
    }

    const sheet = await Sheet.findByPk(sheetId);
    if (!sheet) {
      return res
        .status(404)
        .json({ success: false, message: "Sheet not found" });
    }

    const sharedWithUser = await User.findByPk(shared_with_user_id);
    if (!sharedWithUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Permission check
    const canShare = await checkCanShare(req.user.id, sheetId, req.userRole);
    if (!canShare) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    // Check if already shared
    let share = await SheetShare.findOne({
      where: { sheet_id: sheetId, shared_with_user_id },
    });

    if (share) {
      // Update existing share
      await share.update({
        permission_level,
        expires_at: expires_at || null,
      });
    } else {
      // Create new share
      share = await SheetShare.create({
        sheet_id: sheetId,
        shared_with_user_id,
        permission_level,
        shared_by: req.user.id,
        expires_at: expires_at || null,
      });
    }

    // Log activity
    await logActivity(
      req.user.id,
      "sheet_shared",
      "Sheet",
      sheetId,
      null,
      { shared_with_user_id, permission_level },
      req.ip,
      req.get("user-agent")
    );

    // Create notification
    await createNotification(
      shared_with_user_id,
      req.user.id,
      "sheet_shared",
      `Sheet "${sheet.name}" shared with you`,
      `${req.user.username} shared a sheet with you`,
      "Sheet",
      sheetId
    );

    // Send email
    const sender = await User.findByPk(req.user.id);
    await sendSheetSharedEmail(
      sharedWithUser.email,
      sharedWithUser.first_name || sharedWithUser.username,
      sheet.name,
      sender.first_name || sender.username
    );

    res.json({
      success: true,
      message: "Sheet shared successfully",
      data: share,
    });
  } catch (error) {
    console.error("Error sharing sheet:", error);
    res.status(500).json({ success: false, message: "Failed to share sheet" });
  }
};

// Update share permission
exports.updateSharePermission = async (req, res) => {
  try {
    const { sheetId, userId } = req.params;
    const { permission_level } = req.body;

    if (!["view", "edit"].includes(permission_level)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid permission level" });
    }

    // Permission check
    const canShare = await checkCanShare(req.user.id, sheetId, req.userRole);
    if (!canShare) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    const share = await SheetShare.findOne({
      where: { sheet_id: sheetId, shared_with_user_id: userId },
    });

    if (!share) {
      return res
        .status(404)
        .json({ success: false, message: "Share not found" });
    }

    const oldPermission = share.permission_level;
    await share.update({ permission_level });

    // Log activity
    await logActivity(
      req.user.id,
      "share_updated",
      "SheetShare",
      share.id,
      { permission_level: oldPermission },
      { permission_level },
      req.ip,
      req.get("user-agent")
    );

    res.json({
      success: true,
      message: "Permission updated successfully",
      data: share,
    });
  } catch (error) {
    console.error("Error updating share:", error);
    res.status(500).json({ success: false, message: "Failed to update share" });
  }
};

// Remove sheet share
exports.removeShare = async (req, res) => {
  try {
    const { sheetId, userId } = req.params;

    // Permission check
    const canShare = await checkCanShare(req.user.id, sheetId, req.userRole);
    if (!canShare) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    const share = await SheetShare.findOne({
      where: { sheet_id: sheetId, shared_with_user_id: userId },
    });

    if (!share) {
      return res
        .status(404)
        .json({ success: false, message: "Share not found" });
    }

    await share.destroy();

    // Log activity
    await logActivity(
      req.user.id,
      "share_removed",
      "SheetShare",
      share.id,
      { user_id: userId, permission_level: share.permission_level },
      null,
      req.ip,
      req.get("user-agent")
    );

    res.json({ success: true, message: "Share removed successfully" });
  } catch (error) {
    console.error("Error removing share:", error);
    res.status(500).json({ success: false, message: "Failed to remove share" });
  }
};

// Helper function to check if user can share
async function checkCanShare(userId, sheetId, userRole) {
  const user = await User.findByPk(userId);
  const sheet = await Sheet.findByPk(sheetId);

  if (!sheet || !user) return false;

  if (userRole === "admin") return true;
  if (userRole === "manager") return sheet.branch_id === user.branch_id;
  if (userRole === "team_lead") return sheet.team_id === user.team_id;

  return false;
}

module.exports = exports;
