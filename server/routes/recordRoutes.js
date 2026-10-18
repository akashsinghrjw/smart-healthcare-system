const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { protect } = require('../middleware/authMiddleware');

// Get all records for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const records = await MedicalRecord.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload new medical record
router.post('/', protect, async (req, res) => {
  try {
    const { title, type, date, fileName, fileData } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Record title is required' });
    }

    const newRecord = await MedicalRecord.create({
      user: req.user._id,
      patientEmail: req.user.email,
      patientName: req.user.name,
      title,
      type,
      date,
      fileName,
      fileData
    });

    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a medical record
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (record.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await record.deleteOne();
    res.json({ message: 'Record removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;