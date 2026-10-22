
const express = require('express');
const router = express.Router();

const Ticket = require('../models/Ticket');
const { protect } = require('../middleware/authMiddleware');

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Submit support ticket
router.post('/', async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string'
      ? req.body.name.trim()
      : '';
    const email = typeof req.body?.email === 'string'
      ? req.body.email.trim().toLowerCase()
      : '';
    const msg = typeof req.body?.msg === 'string'
      ? req.body.msg.trim()
      : '';

    if (!name || !email || !msg) {
      return res.status(400).json({
        message: 'Name, email, and message are required'
      });
    }

    // Retry in the unlikely event of a duplicate ID.
    let ticket;
    for (let attempt = 0; attempt < 3; attempt++) {
      const ticketId =
        'TKT-' + Math.floor(100000 + Math.random() * 900000);

      try {
        ticket = await Ticket.create({
          ticketId,
          name,
          email,
          msg,
          status: 'PENDING'
        });
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 2) throw error;
      }
    }

    return res.status(201).json(ticket);
  } catch (error) {
    console.error('Ticket creation error:', error);
    return res.status(500).json({
      message: 'Could not submit support ticket'
    });
  }
});

// Admin: list all tickets
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({
      message: 'Could not load support tickets'
    });
  }
});

// Track ticket by ID
router.get('/:ticketId', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      ticketId: req.params.ticketId.trim()
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({
      message: 'Could not track ticket'
    });
  }
});

// Admin: reply and resolve
router.patch('/:id/reply', protect, isAdmin, async (req, res) => {
  try {
    const adminReply = typeof req.body?.adminReply === 'string'
      ? req.body.adminReply.trim()
      : '';

    if (!adminReply) {
      return res.status(400).json({
        message: 'Admin reply is required'
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        adminReply,
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString()
      },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.json(ticket);
  } catch (error) {
    return res.status(400).json({
      message: 'Could not update ticket'
    });
  }
});

// Admin: delete ticket
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    return res.status(400).json({
      message: 'Could not delete ticket'
    });
  }
});

module.exports = router;
