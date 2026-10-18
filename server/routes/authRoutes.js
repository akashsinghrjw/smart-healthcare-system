const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Medication = require('../models/Medication');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretKey', {
    expiresIn: '30d',
  });
};

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name ? name.trim() : cleanEmail.split('@')[0],
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'patient',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Current User Profile (Protected)
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// Delete Account Route (MongoDB Se Delete Karega)
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    // 1. Delete user from MongoDB users collection
    await User.findByIdAndDelete(userId);

    // 2. Delete user's associated medical records and medicines
    if (MedicalRecord) {
      await MedicalRecord.deleteMany({ patientEmail: userEmail });
    }
    if (Medication) {
      await Medication.deleteMany({ patientEmail: userEmail });
    }

    res.json({ message: 'Account and all health data deleted successfully from MongoDB' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;