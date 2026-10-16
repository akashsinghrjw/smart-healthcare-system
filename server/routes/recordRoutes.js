const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { protect } = require('../middleware/authMiddleware');

// Get all records for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new record
router.post('/', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.create({
      ...req.body,
      patient: req.user._id,
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;