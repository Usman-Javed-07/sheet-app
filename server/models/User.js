const { DataTypes } = require("sequelize");
const sequelize = require("../config/database-connection");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
    },
    last_name: {
      type: DataTypes.STRING(100),
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
    branch_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "branches",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    team_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "teams",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password_hash")) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;
