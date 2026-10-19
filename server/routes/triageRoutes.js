const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Fallback rule-based dictionary if Gemini API limit/network fails
const getClinicalFallback = (symptom) => {
  const q = (symptom || '').toLowerCase();
  if (q.includes('fever') || q.includes('bukhar') || q.includes('temp')) {
    return "Clinical Advice: Elevated temperature detected. Stay well hydrated, rest in a cool environment, and take paracetamol if prescribed. If fever exceeds 102°F or persists beyond 3 days, consult a physician.";
  }
  if (q.includes('headache') || q.includes('migraine') || q.includes('sar')) {
    return "Clinical Advice: Headache detected. Rest in a dark, quiet room, drink plenty of water, and limit screen time. Consult a doctor immediately if accompanied by visual changes or stiff neck.";
  }
  if (q.includes('cough') || q.includes('khansi') || q.includes('cold') || q.includes('throat')) {
    return "Clinical Advice: Respiratory irritation noted. Drink warm fluids, try steam inhalation twice daily, and avoid cold items. If chest tightness or breathing difficulty occurs, seek clinical care.";
  }
  if (q.includes('stomach') || q.includes('pet') || q.includes('cramp') || q.includes('acidity')) {
    return "Clinical Advice: Gastrointestinal distress reported. Take a light, non-spicy diet (khichdi, curd, bananas) and sip warm water. Visit a clinic if pain is acute or localized on the lower right abdomen.";
  }
  return `Clinical Assessment for "${symptom}": Maintain hydration and adequate rest. Monitor your condition over the next 24 hours. If symptoms escalate or persist, visit a medical clinic.`;
};

router.post('/analyze', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: 'Symptom query is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an AI Clinical Triage Assistant for a hospital portal. A patient reports: "${query}".
        Provide a concise, professional assessment in 2 to 3 sentences:
        1. Common probable reasons.
        2. Safe primary self-care/hydration recommendations.
        3. Clear emergency red flags when to see an in-person doctor immediately.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (responseText && responseText.trim()) {
          return res.json({ analysis: responseText.trim() });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call error, switching to fallback:', geminiErr.message);
      }
    }

    // Resilient fallback (no 502 crash)
    const fallbackResponse = getClinicalFallback(query);
    return res.json({ analysis: fallbackResponse });
  } catch (error) {
    console.error('Server error on triage:', error);
    res.status(500).json({ message: error.message || 'Internal triage error' });
  }
});

module.exports = router;