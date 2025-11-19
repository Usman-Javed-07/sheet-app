require("dotenv").config();
const { sequelize, Role, User, Branch } = require("../models");
const crypto = require("crypto");

const seedDatabase = async () => {
  try {
    // Authenticate connection
    await sequelize.authenticate();
    console.log("Database connection established");

    // Sync database
    await sequelize.sync({ alter: true });
    console.log("Database synchronized");

    // Check if roles exist
    const roles = await Role.findAll();
    if (roles.length === 0) {
      console.log("Creating roles...");
      await Role.bulkCreate([
        { name: "admin", description: "Full system access" },
        { name: "manager", description: "Branch-level management" },
        { name: "team_lead", description: "Team-level management" },
        { name: "user", description: "Basic user with edit permissions" },
        { name: "agent", description: "View-only user" },
      ]);
      console.log("Roles created successfully");
    }

    // Check if admin exists
    const adminRole = await Role.findOne({ where: { name: "admin" } });
    const adminExists = await User.findOne({
      where: { role_id: adminRole.id },
    });

    if (!adminExists) {
      console.log("Creating default admin user...");

      // Generate temp password
      const tempPassword = crypto.randomBytes(8).toString("hex");

      const admin = await User.create({
        username: "admin",
        email: "admin@sheetapp.com",
        password_hash: tempPassword,
        first_name: "System",
        last_name: "Admin",
        role_id: adminRole.id,
      });

      console.log("\n========================================");
      console.log("✓ Admin user created successfully!");
      console.log("========================================");
      console.log(`Username: admin`);
      console.log(`Email: admin@sheetapp.com`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log("========================================\n");
    } else {
      console.log("Admin user already exists");
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
