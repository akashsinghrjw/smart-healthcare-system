const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const { protect } = require('../middleware/authMiddleware');

// Get all medications
router.get('/', protect, async (req, res) => {
  try {
    const meds = await Medication.find({ patient: req.user._id });
    res.json(meds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new medication
router.post('/', protect, async (req, res) => {
  try {
    const med = await Medication.create({
      ...req.body,
      patient: req.user._id,
    });
    res.status(201).json(med);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;