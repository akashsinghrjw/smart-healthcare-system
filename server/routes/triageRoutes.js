
const express = require('express');
const router = express.Router();

const TriageLog = require('../models/TriageLog');
const { protect } = require('../middleware/authMiddleware');

// POST /api/triage/analyze
// Analyze symptoms and save the result in MongoDB.
router.post('/analyze', protect, async (req, res) => {
  try {
    const { query } = req.body || {};

    if (typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        message: 'Please enter your symptoms.',
      });
    }

    const symptoms = query.trim();
    const apiKey = process.env.GEMINI_API_KEY;
    let guidance = '';
    let source = 'Fallback Guidance';

    if (apiKey) {
      try {
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            signal: AbortSignal.timeout(15000),
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text:
                        'Provide cautious general health information about these symptoms. ' +
                        'Explain possible causes, basic self-care and warning signs. ' +
                        'Do not claim a definitive diagnosis or prescribe medication. ' +
                        'Advise professional medical care when appropriate.\n\nSymptoms: ' +
                        symptoms,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          guidance =
            data.candidates?.[0]?.content?.parts
              ?.map((part) => part.text || '')
              .join('\n')
              .trim() || '';

          if (guidance) {
            source = 'Gemini AI via Backend';
          }
        } else {
          console.error('Gemini API response:', data.error?.message);
        }
      } catch (error) {
        console.error('Gemini request failed:', error.message);
      }
    }

    if (!guidance) {
      guidance =
        'AI analysis is temporarily unavailable. Please consult a qualified healthcare professional. Seek urgent medical attention for severe or rapidly worsening symptoms.';
    }

    const log = await TriageLog.create({
      patientEmail: req.user.email || '',
      patientName: req.user.name || 'Patient',
      query: symptoms,
      condition: 'Symptom Analysis',
      guidance,
      source,
    });

    return res.status(201).json({
      analysis: guidance,
      logId: log._id,
    });
  } catch (error) {
    console.error('Triage analysis error:', error);

    return res.status(500).json({
      message: 'Unable to analyze symptoms or save the result.',
    });
  }
});

// GET /api/triage/history
// Admin sees all logs; patients see only their own.
router.get('/history', protect, async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
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
// Only admins can delete AI history.
router.delete('/history/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
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
