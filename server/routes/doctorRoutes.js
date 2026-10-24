const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

// Get all doctors list
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;