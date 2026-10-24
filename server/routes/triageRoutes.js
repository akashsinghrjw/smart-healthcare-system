const express = require('express');
const router = express.Router();
const TriageLog = require('../models/TriageLog');
const { protect } = require('../middleware/authMiddleware');
const { callGeminiAI } = require('../services/geminiService');

// 🩺 POST /api/triage/analyze - Real Gemini AI + MongoDB Connection
router.post('/analyze', protect, async (req, res) => {
  try {
    const { query } = req.body || {};

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ message: 'Please enter your symptoms.' });
    }

    const symptoms = query.trim();

    // 💡 Ultra-Fast & Short Prompt for Hinglish Triage
    const prompt = 
      `User Symptom: "${symptoms}". Give an ultra-short, crisp, point-wise triage response in simple Hinglish. Strict rule: Maximum 3 to 4 short lines or bullet points only. No long paragraphs.`;

    // Fetch REAL response directly from Gemini AI
    const realAiResponse = await callGeminiAI(prompt);

    // Save the real AI analysis and log securely into MongoDB
    const newLog = new TriageLog({
      patientEmail: req.user.email || '',
      patientName: req.user.name || 'Patient',
      query: symptoms,
      condition: 'Symptom Analysis',
      guidance: realAiResponse,
      source: 'Gemini AI via Backend',
    });

    const savedLog = await newLog.save();

    return res.status(201).json({
      analysis: realAiResponse,
      logId: savedLog._id,
    });

  } catch (error) {
    console.error('Gemini Triage Critical Error:', error.message);
    return res.status(500).json({
      message: error.message || 'Unable to connect with Gemini AI right now. Please try again.',
    });
  }
});

// GET /api/triage/history - Fetch past logs from MongoDB
router.get('/history', protect, async (req, res) => {
  try {
    const filter = String(req.user.role || '').toLowerCase() === 'admin' ? {} : { patientEmail: req.user.email };
    const logs = await TriageLog.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Triage history error:', error);
    return res.status(500).json({ message: 'Unable to load triage history from database.' });
  }
});

// DELETE /api/triage/history/:id - Delete specific log from MongoDB
router.delete('/history/:id', protect, async (req, res) => {
  try {
    if (String(req.user.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    const log = await TriageLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Triage log not found in database.' });
    }
    return res.status(200).json({ message: 'Triage log deleted successfully.' });
  } catch (error) {
    console.error('Delete triage log error:', error);
    return res.status(500).json({ message: 'Unable to delete triage log.' });
  }
});

module.exports = router;