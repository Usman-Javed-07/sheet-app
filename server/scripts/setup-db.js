require("dotenv").config();
const mysql = require("mysql2/promise");
const env = require("../config/env");

const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      port: env.DB_PORT,
    });

    console.log("Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${env.DB_NAME}`);
    console.log(`Database '${env.DB_NAME}' created or already exists`);

    await connection.end();
    console.log("Connection closed\n");

    // Now run the seed script
    const { sequelize, Role, User, Branch } = require("../models");
    const crypto = require("crypto");

    await sequelize.authenticate();
    console.log("Database connection established");

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
      console.log("✓ Roles created successfully");
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
      console.log("✓ DEFAULT ADMIN USER CREATED");
      console.log("========================================");
      console.log(`Email: admin@sheetapp.com`);
      console.log(`Temporary Password: ${tempPassword}`);
      console.log("========================================\n");
    }

    // Create default branch for admin
    const defaultBranch = await Branch.findOne({
      where: { name: "Default Branch" },
    });

    if (!defaultBranch) {
      console.log("Creating default branch...");
      await Branch.create({
        name: "Default Branch",
        description: "Default branch for initial setup",
        created_by: adminRole.id,
      });
      console.log("✓ Default branch created");
    }

    console.log("\n✓ Database seeding completed successfully!");
    console.log("✓ You can now start the server with: npm run dev\n");

    await sequelize.close();
  } catch (error) {
    console.error("Error during database setup:", error.message);
    process.exit(1);
  }
};

createDatabase();
