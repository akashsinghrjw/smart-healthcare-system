const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/authMiddleware');

// Book appointment route
router.post('/book', protect, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    
    const newAppointment = new Appointment({
      user: req.user.id,
      doctor: doctorId,
      date,
      time
    });

    const savedAppointment = await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully!", savedAppointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;