
const express = require('express');
const router = express.Router();

const TriageLog = require('../models/TriageLog');
const { protect } = require('../middleware/authMiddleware');

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.post('/analyze', protect, async (req, res) => {
  try {
    const query = typeof req.body?.query === 'string'
      ? req.body.query.trim()
      : '';

    if (!query) {
      return res.status(400).json({
        message: 'Symptom query is required'
      });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    const promptText = `You are a medical information assistant, not a doctor.
Patient symptoms: "${query}"

In exactly 3 short sentences explain:
1. Possible common causes, without claiming a diagnosis.
2. Safe general care advice.
3. Warning signs requiring urgent medical care.
Do not prescribe medicines. Be clear and empathetic.`;

    let guidance = '';
    let source = 'Fallback Clinical Guidance';

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        try {
          const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' +
              encodeURIComponent(apiKey),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 250
                }
              }),
              signal: controller.signal
            }
          );

          const data = await response.json();

          if (response.ok) {
            guidance =
              data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || '')
                .join(' ')
                .trim() || '';

            if (guidance) source = 'Gemini AI via Backend';
          } else {
            console.warn('Gemini API error:', data?.error?.message);
          }
        } finally {
          clearTimeout(timeout);
        }
      } catch (error) {
        console.warn('Gemini request failed:', error.message);
      }
    }

    if (!guidance) {
      const q = query.toLowerCase();

      if (/chest pain|difficulty breathing|can't breathe|cannot breathe/.test(q)) {
        guidance =
          'Chest pain or difficulty breathing can have serious causes and cannot be safely diagnosed by chat. Stop exertion and seek emergency medical care now if these symptoms are happening, severe, or new. In India, call 112 or your local emergency service if urgent help is needed.';
      } else {
        guidance =
          'These symptoms can have several causes, and this tool cannot determine the exact diagnosis. Rest, drink fluids if appropriate, and avoid starting medicines without suitable medical advice. Seek urgent medical attention for severe or worsening symptoms, confusion, fainting, difficulty breathing, or other alarming changes.';
      }
    }

    const user = req.user;

    const savedLog = await TriageLog.create({
      patientEmail: user.email || '',
      patientName: user.name || 'Patient',
      query,
      condition: '',
      guidance,
      source
    });

    return res.status(200).json({
      analysis: guidance,
      log: savedLog
    });
  } catch (error) {
    console.error('Triage analysis error:', error);
    return res.status(500).json({
      message: 'Could not analyze or save symptoms'
    });
  }
});

// Patient: own history. Admin: all patient history.
router.get('/history', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { patientEmail: (req.user.email || '').toLowerCase() };

    const logs = await TriageLog.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(logs);
  } catch (error) {
    return res.status(500).json({
      message: 'Could not load triage history'
    });
  }
});

// Admin-only delete
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const deleted = await TriageLog.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Triage log not found' });
    }

    return res.json({ message: 'Triage log deleted' });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid triage log ID' });
  }
});

module.exports = router;
