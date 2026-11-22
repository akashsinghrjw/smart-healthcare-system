const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all doctors list (Existing - untouched and safe)
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logged-in doctor's own profile
router.get('/me', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    console.error('Fetch doctor profile error:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Create or update doctor profile (Image, Name, Qualification, Fees, etc.)
router.post('/profile', protect, async (req, res) => {
  try {
    if (String(req.user.role || '').toLowerCase() !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor role required.' });
    }

    const {
      name,
      qualification,
      specialization,
      hospitalName,
      location,
      fees,
      phone,
      profileImage,
      bio
    } = req.body;

    let doctor = await Doctor.findOne({ userId: req.user._id });

    if (doctor) {
      doctor.name = name || doctor.name;
      doctor.qualification = qualification || doctor.qualification;
      doctor.specialization = specialization || doctor.specialization;
      doctor.hospitalName = hospitalName || doctor.hospitalName;
      doctor.location = location || doctor.location;
      doctor.fees = fees !== undefined ? fees : doctor.fees;
      doctor.phone = phone !== undefined ? phone : doctor.phone;
      doctor.profileImage = profileImage !== undefined ? profileImage : doctor.profileImage;
      doctor.bio = bio !== undefined ? bio : doctor.bio;

      await doctor.save();
    } else {
      doctor = new Doctor({
        userId: req.user._id,
        name: name || req.user.name,
        qualification: qualification || 'MBBS',
        specialization: specialization || 'General Physician',
        hospitalName: hospitalName || 'Smart Healthcare Hospital',
        location: location || 'Main City',
        fees: fees || 500,
        phone: phone || req.user.phone || '',
        profileImage: profileImage || '',
        bio: bio || ''
      });
      await doctor.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Doctor profile saved successfully!',
      doctor
    });
  } catch (error) {
    console.error('Save doctor profile error:', error);
    return res.status(500).json({ message: error.message || 'Server error while saving profile.' });
  }
});

// ✅ ADMIN ONLY: Create a new Doctor account securely
router.post('/admin/create-doctor', protect, async (req, res) => {
  try {
    if (String(req.user.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const {
      name,
      email,
      password,
      qualification,
      specialization,
      hospitalName,
      location,
      fees,
      phone,
      bio
    } = req.body;

    if (!name || !email || !password || !qualification || !specialization) {
      return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password, Qualification, Specialization).' });
    }

    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'doctor'
    });
    await newUser.save();

    const newDoctor = new Doctor({
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      qualification: qualification.trim(),
      specialization: specialization.trim(),
      hospitalName: hospitalName ? hospitalName.trim() : 'Smart Healthcare Hospital',
      location: location ? location.trim() : 'Main City',
      fees: fees !== undefined ? Number(fees) : 500,
      phone: newUser.phone,
      bio: bio ? bio.trim() : ''
    });
    await newDoctor.save();

    return res.status(201).json({
      success: true,
      message: 'Doctor account created successfully by Admin!',
      doctor: newDoctor
    });
  } catch (error) {
    console.error('Admin create doctor error:', error);
    return res.status(500).json({ message: error.message || 'Server error while creating doctor.' });
  }
});

module.exports = router;