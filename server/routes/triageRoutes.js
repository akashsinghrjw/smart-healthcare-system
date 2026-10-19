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
        message: 'GEMINI_API_KEY is not defined in Render environment.' 
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

    // Try available model aliases in order to bypass 404
    const modelCandidates = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash-latest'];
    let generatedText = null;
    let lastError = null;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptText);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) {
          generatedText = text.trim();
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} call failed, trying next alias:`, err.message);
      }
    }

    if (generatedText) {
      return res.status(200).json({ analysis: generatedText });
    }

    throw lastError || new Error('No available Gemini model responded');

  } catch (err) {
    console.error('Gemini Execution Error:', err.message);
    return res.status(500).json({ 
      message: `Gemini API Error: ${err.message || 'Failed to generate response'}` 
    });
  }
});

module.exports = router;