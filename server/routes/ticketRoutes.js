const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/authMiddleware');

// Get all tickets/appointments for user
router.get('/', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new ticket/appointment
router.post('/', protect, async (req, res) => {
  try {
    const ticket = await Ticket.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;