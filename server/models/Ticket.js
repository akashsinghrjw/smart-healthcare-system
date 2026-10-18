const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    msg: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'RESOLVED'], default: 'PENDING' },
    adminReply: { type: String, default: '' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    time: { type: String, default: () => new Date().toLocaleTimeString() },
    resolvedAt: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', TicketSchema);