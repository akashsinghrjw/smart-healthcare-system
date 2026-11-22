const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get appointments for logged-in doctor
router.get('/doctor/appointments', protect, async (req, res) => {
  try {
    if (String(req.user.role || '').toLowerCase() !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor role required.' });
    }

    const docEmail = (req.user.email || '').toLowerCase().trim();
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });
    const doctorProfileEmail = doctorProfile && doctorProfile.email ? doctorProfile.email.toLowerCase().trim() : null;

    const query = {
      $or: [
        { doctorEmail: docEmail },
        ...(doctorProfileEmail ? [{ doctorEmail: doctorProfileEmail }] : []),
        { doctorId: req.user._id },
        ...(doctorProfile ? [{ doctorId: doctorProfile._id }] : [])
      ]
    };

    const appointments = await Appointment.find(query).sort({ createdAt: -1 });
    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Fetch doctor appointments error:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Patient books appointment with auto-email resolution & receipt generation (Default: Pending)
router.post('/book', protect, async (req, res) => {
  try {
    let { doctorEmail, doctorId, date, time, appDate, paymentMode, amount, patientName } = req.body;
    const appointmentDate = appDate || date;
    
    if (!doctorEmail && doctorId) {
      let doc = await Doctor.findById(doctorId);
      if (!doc) {
        doc = await Doctor.findOne({ userId: doctorId });
      }
      if (doc && doc.email) {
        doctorEmail = doc.email;
      } else if (doc && doc.userId) {
        const userDoc = await User.findById(doc.userId);
        if (userDoc) doctorEmail = userDoc.email;
      }
    }

    if (!doctorEmail) {
      doctorEmail = "doctor@hospital.com";
    }

    const receiptId = `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAppointment = new Appointment({
      doctorId: doctorId || null,
      doctorEmail: doctorEmail.toLowerCase().trim(),
      patientId: req.user._id,
      patientName: patientName || req.user.name,
      patientEmail: req.user.email,
      date: appointmentDate || new Date().toLocaleDateString(),
      time: time || '10:00 AM',
      receiptId: receiptId,
      status: 'Pending' // Initial status is Pending until doctor accepts
    });

    await newAppointment.save();
    return res.status(201).json({ 
      success: true, 
      message: 'Appointment booked successfully!', 
      receiptId: receiptId,
      appointment: newAppointment 
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Doctor completes consultation and saves prescription notes (Updates status to Completed)
router.put('/:id/complete', protect, async (req, res) => {
  try {
    if (String(req.user.role || '').toLowerCase() !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor role required.' });
    }

    const { prescription } = req.body;
    const appointmentId = req.params.id;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        status: 'Completed', 
        prescription: prescription || 'Consultation completed. Take care!' 
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Consultation completed and prescription saved successfully!',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Complete consultation error:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Patient gets their own booked appointments & prescriptions
router.get('/patient/my-appointments', protect, async (req, res) => {
  try {
    const userEmail = (req.user.email || '').toLowerCase().trim();
    const appointments = await Appointment.find({ 
      $or: [
        { patientEmail: userEmail },
        { patientId: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json(appointments);
  } catch (error) {
    console.error('Fetch patient appointments error:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Delete an appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    await Appointment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Appointment deleted successfully.' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;