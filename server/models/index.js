const sequelize = require("../config/database-connection");
const Role = require("./Role");
const User = require("./User");
const Branch = require("./Branch");
const Team = require("./Team");
const Sheet = require("./Sheet");
const SheetCell = require("./SheetCell");
const SheetShare = require("./SheetShare");
const Notification = require("./Notification");
const ActivityLog = require("./ActivityLog");

// Define associations
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

User.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });
Branch.hasMany(User, { foreignKey: "branch_id", as: "users" });

User.belongsTo(Team, { foreignKey: "team_id", as: "team" });
Team.hasMany(User, { foreignKey: "team_id", as: "users" });

Branch.hasMany(Team, { foreignKey: "branch_id", as: "teams" });
Team.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Branch.hasMany(Sheet, { foreignKey: "branch_id", as: "sheets" });
Sheet.belongsTo(Branch, { foreignKey: "branch_id", as: "branch" });

Team.hasMany(Sheet, { foreignKey: "team_id", as: "sheets" });
Sheet.belongsTo(Team, { foreignKey: "team_id", as: "team" });

User.hasMany(Sheet, { foreignKey: "created_by", as: "createdSheets" });
Sheet.belongsTo(User, { foreignKey: "created_by", as: "creator" });

Sheet.hasMany(SheetCell, { foreignKey: "sheet_id", as: "cells" });
SheetCell.belongsTo(Sheet, { foreignKey: "sheet_id", as: "sheet" });

User.hasMany(SheetCell, {
  foreignKey: "last_modified_by",
  as: "modifiedCells",
});
SheetCell.belongsTo(User, { foreignKey: "last_modified_by", as: "modifier" });

Sheet.hasMany(SheetShare, { foreignKey: "sheet_id", as: "shares" });
SheetShare.belongsTo(Sheet, { foreignKey: "sheet_id", as: "sheet" });

User.hasMany(SheetShare, {
  foreignKey: "shared_with_user_id",
  as: "sharedSheets",
});
SheetShare.belongsTo(User, { foreignKey: "shared_with_user_id", as: "user" });

User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "recipient" });

User.hasMany(Notification, {
  foreignKey: "actor_id",
  as: "actorNotifications",
});
Notification.belongsTo(User, { foreignKey: "actor_id", as: "actor" });

User.hasMany(ActivityLog, { foreignKey: "user_id", as: "activityLogs" });
ActivityLog.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = {
  sequelize,
  Role,
  User,
  Branch,
  Team,
  Sheet,
  SheetCell,
  SheetShare,
  Notification,
  ActivityLog,
};
