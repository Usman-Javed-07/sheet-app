const { DataTypes } = require("sequelize");
const sequelize = require("../config/database-connection");

const SheetCell = sequelize.define(
  "SheetCell",
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
    row: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    col: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
    },
    data_type: {
      type: DataTypes.STRING(50),
      defaultValue: "text",
    },
    last_modified_by: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "sheet_cells",
    timestamps: false,
    createdAt: false,
    updatedAt: "last_modified_at",
    indexes: [
      {
        unique: true,
        fields: ["sheet_id", "row", "col"],
      },
      {
        fields: ["sheet_id"],
      },
      {
        fields: ["last_modified_by"],
      },
    ],
  }
);

module.exports = SheetCell;
