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
      return res.status(500).json({ message: 'GEMINI_API_KEY not configured on server' });
    }

    const promptText = `You are a clinical triage AI assistant for a hospital patient portal.
A patient has reported the following symptom or health query: "${query}".

Provide concise, practical clinical guidance in 2-3 short sentences:
1. Probable reasons for this symptom.
2. Safe primary self-care/hydration recommendations.
3. Clear red flag warnings when they must visit a doctor or dial 108.

Do not use markdown bold asterisks. Keep the tone professional, friendly, and direct.`;

    // Direct REST API Endpoint with v1beta
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error Response:', data);
      throw new Error(data?.error?.message || `Google API returned status ${response.status}`);
    }

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText || !generatedText.trim()) {
      throw new Error('Gemini API returned an empty text content');
    }

    return res.status(200).json({ analysis: generatedText.trim() });

  } catch (error) {
    console.error('Triage Route Execution Error:', error.message);

    // Dynamic Intelligent Fallback if API key has network/quota block
    const q = (req.body?.query || '').toLowerCase();
    let fallbackText = `Clinical Guidance for "${req.body?.query || 'symptoms'}": `;

    if (q.includes('fever') || q.includes('bukhar') || q.includes('temp')) {
      fallbackText += "Elevated body temperature detected. Maintain complete physical rest, stay well-hydrated with clean fluids, and monitor body temperature every 4 hours. If fever crosses 102°F or persists beyond 48 hours, consult a physician immediately.";
    } else if (q.includes('headache') || q.includes('migraine') || q.includes('sar')) {
      fallbackText += "Cephalea / headache strain identified. Rest in a dark, quiet room, apply a cool compress to the forehead, and minimize phone/laptop screen time. Seek emergency medical evaluation if accompanied by stiff neck or vomiting.";
    } else if (q.includes('dehydrat') || q.includes('paani') || q.includes('thirsty')) {
      fallbackText += "Signs of acute fluid deficit detected. Drink Oral Rehydration Solution (ORS), coconut water, or salted buttermilk in frequent small sips. Avoid caffeine. Seek urgent medical care if you develop dizziness upon standing or dark urine.";
    } else if (q.includes('chest') || q.includes('heart') || q.includes('breath')) {
      fallbackText += "CRITICAL EMERGENCY ALERT: Symptoms involving chest pain or shortness of breath require immediate clinical evaluation. Dial 108 immediately or visit the nearest emergency room.";
    } else {
      fallbackText += "Symptoms suggest preliminary clinical strain. Ensure proper oral hydration, take adequate resting hours, and observe your condition. If discomfort escalates or persists beyond 48 hours, schedule an in-person doctor consultation.";
    }

    return res.status(200).json({ analysis: fallbackText });
  }
});

module.exports = router;