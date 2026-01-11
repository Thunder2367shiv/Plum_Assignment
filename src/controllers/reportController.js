import { runGuardrails } from '../utils/guardrails.js';
import { AIProvider } from '../services/aiProvider.js';
import { performOCR } from '../utils/ocrService.js';
import fs from 'fs';

export const handleReport = async (req, res) => {
  try {
    let combinedText = req.body.text || "";

    // 1. Handle File Upload & OCR
    if (req.file) {
      const base64 = fs.readFileSync(req.file.path).toString("base64");
      
      // Use the new OCR Utility
      const ocrResult = await performOCR(base64);
      combinedText += `\n${ocrResult.text}`;
      
      // Clean up temp file
      fs.unlinkSync(req.file.path);
    }

    if (!combinedText.trim()) {
      return res.status(400).json({ status: "error", message: "No input provided" });
    }

    // 2. Phase 1: Extraction
    const phase1Data = await AIProvider.extractRawData(combinedText);

    // 3. Phase 2: Simplification
    const phase2Data = await AIProvider.simplifyData(phase1Data);

    // 4. Guardrails (Safety Check)
    const guard = runGuardrails(phase1Data, phase2Data);
    if (!guard.valid) {
      return res.status(422).json({
        status: "unprocessed",
        reason: guard.reason,
      });
    }

    // 5. Final Synthesis & Success Response
    res.json({
      tests: phase1Data.tests,      // From Phase 1
      summary: phase2Data.summary,  // From Phase 2
      status: "ok",
    });

  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};