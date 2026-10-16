const express = require('express');
const router = express.Router();
const TriageLog = require('../models/TriageLog');
const { protect } = require('../middleware/authMiddleware');

// Get triage logs
router.get('/', protect, async (req, res) => {
  try {
    const logs = await TriageLog.find({ user: req.user._id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create triage log
router.post('/', protect, async (req, res) => {
  try {
    const log = await TriageLog.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;