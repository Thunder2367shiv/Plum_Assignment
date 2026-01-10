import Tesseract from "tesseract.js";
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

  // STEP 1 — OCR
  static async performOCR(base64Image) {
    try {
      const buffer = Buffer.from(base64Image, "base64");
      const { data } = await Tesseract.recognize(buffer, "eng");
      return {
        text: data.text,
        confidence: data.confidence / 100,
      };
    } catch (err) {
      return { text: "", confidence: 0 };
    }
  }

  // PHASE 1 — Extraction & Normalization
  static async extractRawData(base64Image, textInput) {
    let combinedText = textInput || "";
    let ocrConfidence = 1.0;

    if (base64Image) {
      const ocr = await this.performOCR(base64Image);
      combinedText += `\n${ocr.text}`;
      ocrConfidence = ocr.confidence;
    }

const prompt = `
Extract medical test data from the text below.

IMPORTANT INSTRUCTIONS:
- The report may contain one or many tests.
- Panels (CBC, LFT, KFT, Lipid Panel, etc.) are NOT tests themselves.
- Every individual measurement inside a panel MUST be extracted as a SEPARATE test.
- DO NOT group multiple measurements under one test.

DATA EXTRACTION RULES:
1. Extract the value of each test.
2. Extract the unit of each test if present (e.g., g/dL, /uL).
3. Extract the status of each test if present (e.g., Low, Normal, High).
4. Extract reference ranges if present (e.g., 12-15 g/dL).
5. Include any additional field explicitly present in the text.
6. Fix minor typos (e.g., Hemglobin -> Hemoglobin).
7. DO NOT infer missing values or units; only include what is clearly in the text.
8. If the text is NOT a medical report, return:
   { "status": "unprocessed", "reason": "not a medical report" }

INPUT TEXT:
"""
${combinedText}
"""

OUTPUT JSON FORMAT (dynamic: fileds can be more or less based on particular test):

SUCCESS:
{
  "tests_raw": [
    "Exact raw test strings from the report"
  ],
  "tests": [
    {
      "name": "string",
      "fields": {
        "value": number,
        "unit": "string if present",
        "status": "low | normal | high if present",
        "ref_range": { "low": number, "high": number if present },
        "...any_other_field_present_in_text": "value"
      },
    }
  ],
  "confidence": ${ocrConfidence.toFixed(2)},
  "normalization_confidence": 0.85,
  "status": "ok"
}

FAILURE:
{
  "status": "unprocessed",
  "reason": "not a medical report"
}

ABSOLUTELY FORBIDDEN:
- Grouping multiple tests under panel names
- Returning panel names as test names
- Combining multiple measurements into one test
- Returning null for fields that exist in the input

Return JSON ONLY. No markdown or explanations.
`;



    const completion = await openRouter.chat.send({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    return safeJSON(completion.choices[0].message.content);
  }

  // PHASE 2
  static async simplifyData(phase1Data) {
    const prompt = `
Explain medical test results in simple patient language.

RULES:
- Use ONLY provided test fields
- Explain each test separately
- DO NOT diagnose
- If explanation requires missing data → STOP

INPUT:
${JSON.stringify(phase1Data)}

### JSON OUTPUT FORMAT (STRICT):
{
  "status": "ok",
  "summary": "A 2-3 sentence overview of the entire report.",
  "explanations": [
    {
      "test": "Test Name",
      "explanation": "Simple explanation of what this test measures and what this specific result might indicate."
    }
  ]
}

OR

{ "status": "unprocessed", "reason": "hallucinated data" }
`;

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
