import { runGuardrails } from '../middlewares/guardrails.js';
import { AIProvider } from '../services/aiProvider.js';
import fs from 'fs';

export const handleReport = async (req, res) => {
  try {
    let base64 = null;
    const text = req.body.text;

    if (req.file) {
      base64 = fs.readFileSync(req.file.path).toString("base64");
      fs.unlinkSync(req.file.path);
    }

    if (!base64 && !text) {
      return res.status(400).json({ status: "error", message: "No input provided" });
    }

    // Phase 1
    const phase1Data = await AIProvider.extractRawData(base64, text);

    // Phase 2
    const phase2Data = await AIProvider.simplifyData(phase1Data);

    // Guardrails
    const guard = runGuardrails(phase1Data, phase2Data);
    if (!guard.valid) {
      return res.status(422).json({
        status: "unprocessed",
        reason: guard.reason,
      });
    }

    // FINAL OUTPUT
    res.json({
      tests: phase1Data.tests,
      summary: phase2Data.summary,
      status: "ok",
    });

  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
