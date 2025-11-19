const { DataTypes } = require("sequelize");
const sequelize = require("../config/database-connection");

const ActivityLog = sequelize.define(
  "ActivityLog",
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
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.INTEGER,
    },
    old_values: {
      type: DataTypes.JSON,
    },
    new_values: {
      type: DataTypes.JSON,
    },
    ip_address: {
      type: DataTypes.STRING(45),
    },
    user_agent: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "activity_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["action"],
      },
      {
        fields: ["entity_type", "entity_id"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = ActivityLog;
