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
      return res.status(500).json({ 
        message: 'GEMINI_API_KEY environment variable missing on server.' 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const promptText = `You are a clinical AI triage assistant for a hospital patient portal.
A patient has reported the following symptom or health concern: "${query.trim()}".

Provide concise, practical clinical guidance in 2-3 short sentences:
1. Probable Causes: Specifically explain why this happens.
2. Home Care & Hydration: Immediate actionable steps (fluids, diet, rest).
3. Red Flag Warnings: Urgent signs when they must see an emergency doctor or dial 108.

Do not use markdown bold asterisks (**). Write in clean, professional, empathetic sentences.`;

    // Try current production models supported by Google
    const modelCandidates = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
    let generatedText = null;
    let lastError = null;

    for (const candidate of modelCandidates) {
      try {
        // Explicitly use v1 / current model without deprecated 1.5 alias
        const model = genAI.getGenerativeModel({ model: candidate });
        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) {
          generatedText = text.trim();
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model candidate ${candidate} failed:`, err.message);
      }
    }

    if (generatedText) {
      return res.status(200).json({ analysis: generatedText });
    }

    // Direct REST API Fallback if SDK has version pinning issues
    const directUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const directRes = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const directData = await directRes.json();
    const fallbackText = directData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (fallbackText && fallbackText.trim()) {
      return res.status(200).json({ analysis: fallbackText.trim() });
    }

    throw lastError || new Error(directData?.error?.message || 'Gemini models unavailable');

  } catch (err) {
    console.error('Final Triage Failure:', err.message);
    return res.status(500).json({ 
      message: `Gemini API Error: ${err.message || 'Failed to generate response'}` 
    });
  }
});

module.exports = router;