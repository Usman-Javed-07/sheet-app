const { Notification } = require("../models");

// Create notification
const createNotification = async (
  userId,
  actorId,
  type,
  title,
  message,
  entityType,
  entityId,
  metadata = {}
) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      actor_id: actorId,
      notification_type: type,
      title,
      message,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Create bulk notifications (for multiple users)
const createBulkNotifications = async (
  userIds,
  actorId,
  type,
  title,
  message,
  entityType,
  entityId,
  metadata = {}
) => {
  try {
    const notifications = userIds.map((userId) => ({
      user_id: userId,
      actor_id: actorId,
      notification_type: type,
      title,
      message,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    }));

    const created = await Notification.bulkCreate(notifications);
    return created;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    return [];
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
};
