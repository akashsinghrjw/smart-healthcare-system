const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const TriageLog = require('../models/TriageLog');
const { protect } = require('../middleware/authMiddleware');

// Initialize Gemini SDK safely
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using official SDK model reference
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

// POST /api/triage/analyze
router.post('/analyze', protect, async (req, res) => {
  try {
    const { query } = req.body || {};

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        message: 'Please enter your symptoms.',
      });
    }

    const symptoms = query.trim();
    let guidance = '';
    let source = 'Gemini AI via Backend';

    const model = getGeminiModel();
    if (model) {
      try {
        const prompt =
          'Provide cautious general health information about these symptoms. ' +
          'Explain possible causes, basic self-care and warning signs. ' +
          'Do not claim a definitive diagnosis or prescribe medication. ' +
          'Advise professional medical care when appropriate.\n\nSymptoms: ' +
          symptoms;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        guidance = response.text().trim();
      } catch (aiError) {
        console.error('Gemini SDK generation failed:', aiError.message);
      }
    }

    // Fallback if AI fails or key is missing
    if (!guidance) {
      guidance =
        'Clinical Triage Summary: Based on the symptoms described ("' + symptoms + '"), please monitor your condition closely. Ensure adequate rest and hydration. If symptoms persist or worsen significantly, consult a qualified healthcare professional immediately.';
      source = 'Fallback Clinical Guidance';
    }

    // Save to Database safely
    const newLog = new TriageLog({
      patientEmail: req.user.email || '',
      patientName: req.user.name || 'Patient',
      query: symptoms,
      condition: 'Symptom Analysis',
      guidance,
      source,
    });

    const savedLog = await newLog.save();

    return res.status(201).json({
      analysis: guidance,
      logId: savedLog._id,
    });
  } catch (error) {
    console.error('Triage analysis route error:', error);
    return res.status(500).json({
      message: 'Unable to analyze symptoms or save the result.',
    });
  }
});

// GET /api/triage/history
router.get('/history', protect, async (req, res) => {
  try {
    const filter =
      String(req.user.role || '').toLowerCase() === 'admin'
        ? {}
        : { patientEmail: req.user.email };

    const logs = await TriageLog.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(logs);
  } catch (error) {
    console.error('Triage history error:', error);
    return res.status(500).json({
      message: 'Unable to load AI history.',
    });
  }
});

// DELETE /api/triage/history/:id
router.delete('/history/:id', protect, async (req, res) => {
  try {
    if (String(req.user.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required.',
      });
    }

    const log = await TriageLog.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({
        message: 'AI log not found.',
      });
    }

    return res.status(200).json({
      message: 'AI log deleted successfully.',
    });
  } catch (error) {
    console.error('Delete triage log error:', error);
    return res.status(500).json({
      message: 'Unable to delete AI log.',
    });
  }
});

module.exports = router;