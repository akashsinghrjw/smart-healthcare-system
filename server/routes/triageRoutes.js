const express = require('express');
const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Symptom query is required' });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return res.status(500).json({ message: 'GEMINI_API_KEY environment variable missing' });
    }

    const promptText = `You are a clinical triage AI doctor assistant for an official hospital patient portal.
A patient has reported the following exact symptoms/problem: "${query.trim()}".

Provide a dedicated, custom, dynamic clinical guidance specifically for "${query.trim()}" in 3-4 clear sentences:
1. Probable Causes: State 1-2 most likely reasons causing this specific issue.
2. Immediate Home Care & Relief: Specific, practical steps (what to drink/eat/avoid, resting posture, remedies).
3. Red Flag Warnings: Concrete danger signs when they must immediately visit a hospital emergency room or dial 108.

Do not use markdown asterisks (**) or bullet points. Write in smooth, professional, empathetic clinical sentences.`;

    // Official native endpoint passing key in x-goog-api-key header (required for AQ. keys)
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini Google API Error details:', JSON.stringify(data));
      // Agar Google se specific error aaye toh exact reason client ko bhejo taaki pata chale
      const errMsg = data?.error?.message || `Google API HTTP ${response.status}`;
      return res.status(500).json({ message: errMsg });
    }

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText || !generatedText.trim()) {
      return res.status(500).json({ message: 'Gemini returned empty text' });
    }

    // SUCCESS: Return actual live Gemini response
    return res.status(200).json({ analysis: generatedText.trim() });

  } catch (error) {
    console.error('Triage Route Crash:', error.message);
    return res.status(500).json({ message: error.message || 'Internal server triage failure' });
  }
});

module.exports = router;