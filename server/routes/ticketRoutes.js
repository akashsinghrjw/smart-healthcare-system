const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Submit ticket
router.post('/', async (req, res) => {
  try {
    const { name, email, msg } = req.body;
    if (!name || !email || !msg) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);

    const ticket = await Ticket.create({
      ticketId,
      name,
      email,
      msg,
      status: 'PENDING'
    });

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Track ticket by ID
router.get('/:ticketId', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin reply / resolve ticket
router.patch('/:id/reply', async (req, res) => {
  try {
    const { adminReply } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        adminReply,
        status: 'RESOLVED',
        resolvedAt: new Date().toLocaleString()
      },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;