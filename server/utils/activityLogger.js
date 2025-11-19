const { ActivityLog } = require("../models");

// Log activity
const logActivity = async (
  userId,
  action,
  entityType,
  entityId,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null
) => {
  try {
    const log = await ActivityLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
    return log;
  } catch (error) {
    console.error("Error logging activity:", error);
    return null;
  }
};

module.exports = {
  logActivity,
};
