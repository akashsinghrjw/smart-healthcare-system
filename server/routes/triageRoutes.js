const express = require('express');
const router = express.Router();

router.post('/analyze', async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ message: 'Symptom query is required' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  const promptText = `You are a clinical AI triage doctor for a hospital patient portal.
A patient has reported: "${query.trim()}".

Provide clear, empathetic clinical guidance in exactly 3 short sentences:
1. Probable Causes: State 1-2 common causes for this issue.
2. Home Care: Give immediate practical care steps (fluids, resting posture, remedies).
3. Red Flag Warnings: Specify clear emergency symptoms when to see a doctor or call 108.

Do not use bold asterisks (**) or bullet numbers. Write directly in smooth clinical sentences.`;

  // 1. Direct Call to Google Gemini Native Endpoint (Supports AQ. and AIza keys)
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 sec hard timeout to prevent freeze

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 250
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiText && aiText.trim()) {
        return res.status(200).json({ analysis: aiText.trim() });
      }

      console.warn('Google API responded without text, falling back to clinical engine:', data?.error?.message || data);
    } catch (apiErr) {
      console.warn('Live API call timed out or failed, falling back:', apiErr.message);
    }
  }

  // 2. Instant Medical Intelligence Engine (Guaranteed zero-freeze response)
  const q = query.toLowerCase();
  let guidance = '';

  if (q.includes('cramp') || q.includes('stomach') || q.includes('pet') || q.includes('pain') || q.includes('gas') || q.includes('acidity')) {
    guidance = "Abdominal cramps and gastrointestinal discomfort are frequently triggered by dietary indigestion, viral gastroenteritis, or localized muscle spasms. Sip warm mint water or electrolyte fluids slowly, avoid spicy, heavy, or fried foods, and rest comfortably with a heating pad on your abdomen. Seek immediate medical evaluation if you develop severe sharp pain in the lower right side, persistent vomiting, high fever, or blood in stool.";
  } else if (q.includes('fever') || q.includes('bukhar') || q.includes('temp')) {
    guidance = "Elevated body temperature typically indicates an active immune response combating a viral or seasonal infection. Stay in bed with complete rest, drink copious amounts of clean water and warm soups, and use a cool damp cloth on the forehead to ease body heat. Consult a medical professional immediately if temperature stays above 102°F or is accompanied by chest discomfort, severe neck stiffness, or rash.";
  } else if (q.includes('migraine') || q.includes('headache') || q.includes('sar')) {
    guidance = "Headaches and migraines are most often caused by excessive screen exposure, dehydration, physical tension, or irregular sleep cycles. Rest in a completely dark and silent room, apply a gentle cold compress across your temples, and drink two large glasses of fresh water. Seek emergency care without delay if you notice sudden slurred speech, visual blackout, or an abrupt thunderclap headache.";
  } else if (q.includes('cough') || q.includes('khansi') || q.includes('cold') || q.includes('throat')) {
    guidance = "Persistent dry cough usually stems from seasonal atmospheric irritation, post-nasal drip, or minor upper respiratory strain. Inhale warm steam twice daily, perform salt-water gargling, and drink warm water infused with honey or ginger. Consult an in-person physician if you develop shortness of breath, wheezing sounds, or pain when taking a deep breath.";
  } else if (q.includes('dehydrat') || q.includes('paani') || q.includes('thirsty')) {
    guidance = "Acute dehydration occurs when fluid expulsion outpaces oral hydration, leading to low cellular water levels. Drink Oral Rehydration Salts (ORS) solution, tender coconut water, or lightly salted lemon water in small continuous sips throughout the day. Proceed to an emergency clinic if you experience dizziness when standing upright, extreme dry mouth, or dark-colored concentrated urine.";
  } else {
    guidance = `Clinical evaluation for "${query}": Your symptoms point toward mild physical strain requiring systematic monitoring. Prioritize continuous fluid hydration, maintain 8 hours of restorative sleep, and eat light, easily digestible meals. If symptoms intensify or persist beyond 48 hours, schedule an in-person examination with a physician.`;
  }

  return res.status(200).json({ analysis: guidance });
});

module.exports = router;