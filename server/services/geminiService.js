
const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing in server .env file");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
});

const MODEL_NAME = "gemini-3.8-flash";

async function callGeminiAI(promptText) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing in server .env file."
    );
  }

  if (typeof promptText !== "string" || !promptText.trim()) {
    throw new Error("Prompt must be a non-empty string.");
  }

  const startTime = Date.now();

  try {
    console.log(
      `🚀 [TIMING] Calling Gemini model: ${MODEL_NAME}`
    );

    console.log(
      `📏 [TIMING] Prompt length: ${promptText.length} characters`
    );

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: promptText,
      config: {
        thinkingConfig: {
          thinkingLevel: "LOW",
        },
        maxOutputTokens: 700,
      },
    });

    const elapsedSeconds = (
      (Date.now() - startTime) / 1000
    ).toFixed(2);

    console.log(
      `⏱️ [TIMING] Gemini response time: ${elapsedSeconds} seconds`
    );

    // In @google/genai, response.text is a property.
    // Do not call response.text().
    const text = response.text;

    if (typeof text !== "string" || !text.trim()) {
      console.error(
        "❌ Gemini returned an empty response."
      );

      throw new Error(
        "Received empty response from Gemini."
      );
    }

    return text.trim();

  } catch (error) {
    console.error(
      "❌ Gemini API Error:",
      error.message || error
    );

    throw new Error(
      `Gemini API Error: ${error.message || "Unknown error"}`
    );
  }
}

module.exports = { callGeminiAI };
