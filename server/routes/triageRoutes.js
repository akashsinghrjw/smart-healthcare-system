const express = require('express');
const router = express.Router();
const TriageLog = require('../models/TriageLog');

// Analyze symptom via Gemini API
router.post('/analyze', async (req, res) => {
  const query = String(req.body?.query || '').trim();
  if (!query) {
    return res.status(400).json({ message: 'Symptom query is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'GEMINI_API_KEY is not configured in .env' });
  }

  try {
    const prompt = `You are a helpful healthcare triage assistant. Provide cautious, non-diagnostic guidance for this symptom: "${query}". Mention possible general care tips, red-flag emergency symptoms, and advise seeking professional doctor consultation.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();
    const guidance = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!guidance) {
      return res.status(502).json({ message: 'AI provider returned empty response' });
    }

    const condition = `Clinical Assessment for: "${query}"`;

    // Log query into Database
    await TriageLog.create({
      patientEmail: req.body.email || 'guest@healthcare.local',
      patientName: req.body.name || 'Patient',
      query,
      condition,
      guidance,
      source: 'Gemini 1.5 Flash via Backend'
    });

    res.json({ condition, guidance, source: 'Gemini via Backend' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get triage history
router.get('/history', async (req, res) => {
  try {
    const logs = await TriageLog.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;