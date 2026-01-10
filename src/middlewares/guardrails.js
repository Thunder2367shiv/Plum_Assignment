export const runGuardrails = (phase1, phase2) => {

  // Phase 1 Guardrail
  if (
    phase1.status !== "ok" ||
    !Array.isArray(phase1.tests) ||
    phase1.tests.length === 0
  ) {
    return {
      valid: false,
      reason: "hallucinated tests not present in input",
    };
  }

  // Phase 2 Guardrail
  if (
    phase2.status !== "ok" ||
    !phase2.summary ||
    !Array.isArray(phase2.explanations)
  ) {
    return {
      valid: false,
      reason: "failed to generate patient explanation",
    };
  }

  return { valid: true };
};
