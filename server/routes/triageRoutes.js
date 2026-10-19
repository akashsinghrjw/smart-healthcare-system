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
      console.error('GEMINI_API_KEY is not defined in server environment');
      return res.status(500).json({ message: 'GEMINI_API_KEY missing on server' });
    }

    const promptText = `You are a clinical AI triage assistant for a hospital patient portal.
A patient asks about the following health condition or symptoms: "${query.trim()}".

Provide a direct, dynamic, and customized clinical guidance in 3 concise sentences:
1. Probable Causes: Specifically explain why "${query.trim()}" happens.
2. Home Care & Hydration: Immediate actionable steps (what to drink/eat, remedies, rest).
3. Red Flags: Urgent warning signs when they must visit an emergency clinic or call 108.

Do not use markdown bold asterisks (**). Be professional, helpful, and reassuring.`;

    // Direct Google Generative Language v1beta Endpoint with both header and query key support
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const googleRes = await fetch(apiUrl, {
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
          maxOutputTokens: 350
        }
      })
    });

    const data = await googleRes.json();

    if (!googleRes.ok) {
      console.error('Google Gemini API Error:', JSON.stringify(data));
      return res.status(200).json({
        analysis: `AI Clinical Notice: ${data?.error?.message || 'Unable to connect to Google Gemini service. Please verify API key.'}`
      });
    }

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (generatedText && generatedText.trim()) {
      return res.status(200).json({ analysis: generatedText.trim() });
    }

    return res.status(200).json({
      analysis: `Clinical Advice for "${query}": Maintain high fluid intake, rest in a comfortable room, and observe your symptoms. If discomfort escalates, seek medical consultation.`
    });

  } catch (err) {
    console.error('Triage route execution error:', err.message);
    return res.status(200).json({
      analysis: `Clinical Guidance for "${req.body?.query || 'symptoms'}": Take adequate rest, hydrate with clean water or electrolyte fluids, and consult a physician if condition persists.`
    });
  }
});

module.exports = router;