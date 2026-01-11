import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";

dotenv.config();

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL,
    "X-Title": process.env.SITE_NAME,
  },
});

export class AIProvider {
  // PHASE 1 — Extraction & Normalization
  static async extractRawData(combinedText) {
    const prompt = `
Extract medical test data from the text below.

IMPORTANT INSTRUCTIONS:
- The report may contain one or many tests.
- Panels (CBC, LFT, KFT, Lipid Panel, etc.) are NOT tests themselves.
- Every individual measurement inside a panel MUST be extracted as a SEPARATE test.

DATA EXTRACTION RULES:
1. Extract value, unit, status, and ref_range.
2. Fix minor typos (e.g., Hemglobin -> Hemoglobin).
3. If NOT a medical report, return: { "status": "unprocessed", "reason": "not a medical report" }

INPUT TEXT:
"""
${combinedText}
"""

OUTPUT JSON FORMAT:
{
  "tests": [
    {
      "name": "string",
      "fields": {
        "value": number,
        "unit": "string",
        "status": "string",
        "ref_range": { "low": number, "high": number }
      }
    }
  ],
  "status": "ok"
}

Return JSON ONLY. No markdown.`;

    const completion = await openRouter.chat.send({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    return safeJSON(completion.choices[0].message.content);
  }

  // PHASE 2 — Simplification
  static async simplifyData(phase1Data) {
    const prompt = `
Explain medical test results in simple patient language.

RULES:
- Use ONLY provided test fields.
- Explain each test separately.
- DO NOT diagnose.

INPUT:
${JSON.stringify(phase1Data)}

### JSON OUTPUT FORMAT (STRICT):
{
  "status": "ok",
  "summary": "A 2-3 sentence overview of the entire report.",
  "explanations": [
    {
      "test": "Test Name",
      "explanation": "Simple explanation of result."
    }
  ]
}

Return JSON ONLY.`;

    const completion = await openRouter.chat.send({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    return safeJSON(completion.choices[0].message.content);
  }
}

function safeJSON(text) {
  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { status: "error", raw: text };
  }
}