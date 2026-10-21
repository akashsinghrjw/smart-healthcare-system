
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Medication = require('../models/Medication');
const { protect } = require('../middleware/authMiddleware');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'secretKey',
    { expiresIn: '30d' }
  );
};

// 1. User Registration Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({
      email: cleanEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Public registration always creates a patient account.
    // Admin role cannot be assigned through public registration.
    const user = await User.create({
      name: name ? name.trim() : cleanEmail.split('@')[0],
      email: cleanEmail,
      password: hashedPassword,
      role: 'patient',
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      message: error.message || 'Registration failed',
    });
  }
});

// 2. User Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid email or password',
      });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: error.message || 'Login failed',
    });
  }
});

// 3. Get Current User Profile
router.get('/profile', protect, async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error('Profile error:', error);

    return res.status(500).json({
      message: 'Failed to fetch profile',
    });
  }
});

// 4. Get All Registered Patients (Admin Only)
router.get('/patients', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. Admin only.',
      });
    }

    const patients = await User.find({
      role: 'patient',
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(patients);
  } catch (error) {
    console.error('Fetch patients error:', error);

    return res.status(500).json({
      message: 'Failed to fetch patients',
    });
  }
});

// 5. Update Password Route
router.put('/update-password', protect, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user._id, {
      password: hashedPassword,
    });

    return res.status(200).json({
      message: 'Password successfully updated in MongoDB!',
    });
  } catch (error) {
    console.error('Update password error:', error);

    return res.status(500).json({
      message: error.message || 'Password update failed',
    });
  }
});

// 6. Delete Account and Associated Records
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    await User.findByIdAndDelete(userId);

    await MedicalRecord.deleteMany({
      patientEmail: userEmail,
    });

    await Medication.deleteMany({
      patientEmail: userEmail,
    });

    return res.status(200).json({
      message:
        'Account and associated records deleted permanently from MongoDB',
    });
  } catch (error) {
    console.error('Delete account error:', error);

    return res.status(500).json({
      message: error.message || 'Account deletion failed',
    });
  }
});

module.exports = router;
