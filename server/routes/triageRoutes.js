const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/analyze', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Symptom query is required' });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY environment variable is missing on server.');
      return res.status(500).json({ 
        message: 'Server configuration error: GEMINI_API_KEY is not defined in Render environment.' 
      });
    }

    // Initialize Official Google Gemini Client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const promptText = `You are a clinical AI triage doctor assistant for an official hospital patient portal.
A patient has reported the following health concern or symptoms: "${query.trim()}".

Provide concise, practical, and customized clinical guidance in 3 clear sentences:
1. Probable Causes: Specifically explain why "${query.trim()}" occurs.
2. Immediate Home Care & Relief: Actionable steps (fluids to drink, dietary care, remedies, rest).
3. Red Flag Warnings: Concrete danger symptoms when they must visit a doctor or emergency room immediately.

Do not use markdown bold asterisks (**) or bullet points. Keep it professional, empathetic, and in natural readable clinical sentences.`;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = response.text();

    if (!text || !text.trim()) {
      return res.status(502).json({ message: 'Gemini service returned empty text response.' });
    }

    // SUCCESS: Return actual live Gemini analysis
    return res.status(200).json({ analysis: text.trim() });

  } catch (err) {
    console.error('Gemini Execution Error:', err.message);
    return res.status(500).json({ 
      message: `Gemini API Error: ${err.message || 'Failed to generate clinical guidance'}` 
    });
  }
});

module.exports = router;