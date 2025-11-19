const { DataTypes } = require("sequelize");
const sequelize = require("../config/database-connection");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    actor_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    notification_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
    },
    entity_type: {
      type: DataTypes.STRING(50),
    },
    entity_id: {
      type: DataTypes.INTEGER,
    },
    metadata: {
      type: DataTypes.JSON,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["is_read"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = Notification;
