// backend/intelligence/counterfactualEngine.js

function generateCounterfactual(intent, context) {
  if (intent === "TAKE_BREAK") {
    return `If you continue without a pause, recovery may take longer later in the session.`;
  }

  if (intent === "LOW_ENERGY_HOUR") {
    return `Pushing hard right now may increase fatigue faster than usual.`;
  }

  if (intent === "PEAK_HOUR") {
    return `This is a good window to make progress on demanding tasks.`;
  }

  return `No immediate action is needed right now.`;
}

module.exports = { generateCounterfactual };
