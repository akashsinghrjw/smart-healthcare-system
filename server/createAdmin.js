
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function replaceAdminCredentials() {
  try {
    const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD are required."
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const oldEmail = "admin@hospital.com";
    const newEmail = ADMIN_EMAIL.trim().toLowerCase();

    if (newEmail === oldEmail) {
      throw new Error("New email must differ from the old admin email.");
    }

    const oldAdmin = await User.findOne({
      email: oldEmail,
      role: "admin",
    });

    if (!oldAdmin) {
      throw new Error(
        "Old admin account not found. No changes made."
      );
    }

    const existingAccount = await User.findOne({
      email: newEmail,
    });

    if (existingAccount) {
      throw new Error(
        "New email already belongs to another account. No changes made."
      );
    }

    oldAdmin.email = newEmail;
    oldAdmin.password = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await oldAdmin.save();

    console.log("Existing admin credentials updated.");
    console.log("Admin email:", newEmail);
    console.log("Admin ID and existing linked data preserved.");
  } catch (error) {
    console.error("Admin update failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

replaceAdminCredentials();
