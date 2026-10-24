const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ✅ Trust proxy for Render deployment (Resolves express-rate-limit proxy error)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());

// Rate Limiter: Max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', limiter);

// Standard Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/triage', require('./routes/triageRoutes'));
app.use('/api/medications', require('./routes/medicationRoutes'));

// ✅ Added Doctor & Appointment Routes for the new module
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Root / Test Route
app.get('/', (req, res) => {
  res.send('🚀 Smart Healthcare System API is running...');
});

// Global 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Port & Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Healthcare API Server running on port ${PORT}`);
});