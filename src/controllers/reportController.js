import { runGuardrails } from '../utils/guardrails.js';
import { AIProvider } from '../services/aiProvider.js';
import { performOCR } from '../utils/ocrService.js';

export const handleReport = async (req, res) => {
  try {
    let combinedText = req.body.text || "";

    // 1. Handle File Upload & OCR (Memory-First Approach)
    if (req.file) {
      // req.file.buffer is the raw image data in RAM
      const ocrResult = await performOCR(req.file.buffer);
      combinedText += `\n${ocrResult.text}`;
      
      // No fs.unlinkSync needed because nothing was written to disk!
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
      tests: phase1Data.tests,      // From Phase 1 technical data
      summary: phase2Data.summary,  // From Phase 2 narrative
      status: "ok",
    });

  } catch (err) {
    console.error("Controller Error:", err);
    // On Vercel, use 504 for timeouts if you want to be specific
    const statusCode = err.message.includes("timeout") ? 504 : 500;
    res.status(statusCode).json({ status: "error", message: err.message });
  }
};