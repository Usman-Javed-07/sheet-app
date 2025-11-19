const { DataTypes } = require("sequelize");
const sequelize = require("../config/database-connection");

const SheetShare = sequelize.define(
  "SheetShare",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sheet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sheets",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    shared_with_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    permission_level: {
      type: DataTypes.STRING(50),
      defaultValue: "view",
      validate: {
        isIn: [["view", "edit"]],
      },
    },
    shared_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    expires_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "sheet_shares",
    timestamps: true,
    createdAt: "shared_at",
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["sheet_id", "shared_with_user_id"],
      },
      {
        fields: ["sheet_id"],
      },
      {
        fields: ["shared_with_user_id"],
      },
    ],
  }
);

module.exports = SheetShare;
