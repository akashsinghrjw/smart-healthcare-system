const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const { protect } = require('../middleware/authMiddleware');

// GET: Admin gets all medications; patient gets only own medications
router.get('/', protect, async (req, res) => {
  try {
    const isAdmin = String(req.user.role || '').toLowerCase() === 'admin';
    const filter = isAdmin ? {} : { user: req.user._id };

    const meds = await Medication.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(
      meds.map((med) => ({
        ...med,
        id: String(med._id),
        patientName: med.patientName || 'Patient',
        patientEmail: med.patientEmail || '',
        exactTime: med.exactTime || med.time || '08:00',
        days: Array.isArray(med.days) ? med.days.join(', ') : (med.days || 'Daily'),
      }))
    );
  } catch (err) {
    console.error('Get medications error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST: Add new medication schedule in MongoDB
router.post('/', protect, async (req, res) => {
  try {
    const { name, exactTime, time, days, startDate, endDate, dose } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Medication name is required' });
    }

    const formattedTime = exactTime || time || '08:00';
    const formattedDays = Array.isArray(days) && days.length > 0
      ? days.join(', ')
      : (typeof days === 'string' && days.trim() ? days : (startDate ? `${startDate} to ${endDate || startDate}` : 'Daily'));

    const med = await Medication.create({
      user: req.user._id,
      patientEmail: req.user.email,
      patientName: req.user.name || 'Patient',
      patientPhone: req.user.phone || '',
      name: String(name).trim(),
      exactTime: formattedTime,
      days: formattedDays,
      dose: dose || '1 Dose',
    });

    res.status(201).json({
      ...med.toObject(),
      id: String(med._id),
    });
  } catch (err) {
    console.error('Save medication error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE: Admin can delete any medication; patient only own medication
router.delete('/:id', protect, async (req, res) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    const isAdmin = String(req.user.role || '').toLowerCase() === 'admin';
    const isOwner = String(med.user) === String(req.user._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await med.deleteOne();
    res.json({ message: 'Medication removed successfully' });
  } catch (err) {
    console.error('Delete medication error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;