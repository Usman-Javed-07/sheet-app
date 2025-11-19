const { DataTypes } = require("sequelize");
const sequelize = require("../config/database-connection");

const Sheet = sequelize.define(
  "Sheet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "branches",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    team_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "teams",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rows: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    columns: {
      type: DataTypes.INTEGER,
      defaultValue: 26,
    },
  },
  {
    tableName: "sheets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["branch_id"],
      },
      {
        fields: ["team_id"],
      },
      {
        fields: ["created_by"],
      },
    ],
  }
);

module.exports = Sheet;
