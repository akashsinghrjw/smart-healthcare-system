const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const { protect } = require('../middleware/authMiddleware');

// Get user medications
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const meds = await Medication.find(filter).sort({ createdAt: -1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new medication schedule
router.post('/', protect, async (req, res) => {
  try {
    const { name, exactTime, days, dose } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Medication name is required' });
    }

    const med = await Medication.create({
      user: req.user._id,
      patientEmail: req.user.email,
      patientName: req.user.name,
      patientPhone: req.user.phone || '',
      name,
      exactTime,
      days,
      dose
    });

    res.status(201).json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete medication
router.delete('/:id', protect, async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    if (med.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await med.deleteOne();
    res.json({ message: 'Medication removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;