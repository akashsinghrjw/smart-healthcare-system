
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured on the server.");
  }

  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

// Register a patient account.
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || "",
      role: "patient",
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Unable to register account.",
    });
  }
});

// Log in patients and administrators using database credentials.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      createdAt: user.createdAt,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
});

// Get the authenticated user's profile.
router.get("/profile", protect, async (req, res) => {
  return res.json(req.user);
});

// Get patient accounts. Only administrators can access this route.
router.get("/patients", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    const patients = await User.find({ role: "patient" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(patients);
  } catch (error) {
    console.error("Fetch patients error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch patients.",
    });
  }
});

// Update the authenticated user's password.
router.put("/update-password", protect, async (req, res) => {
  try {
    const { newPassword } = req.body || {};

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Password update error:", error.message);
    return res.status(500).json({
      message: "Unable to update password.",
    });
  }
});

// Delete the currently authenticated user's account.
router.delete("/delete-account", protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    return res.status(204).send();
  } catch (error) {
    console.error("Account deletion error:", error.message);
    return res.status(500).json({
      message: "Unable to delete account.",
    });
  }
});

module.exports = router;
