// backend/intelligence/interpretML.js

function interpretML(mlOutput) {
  const { suggestions, currentVelocity, userProfile } = mlOutput;

  if (!suggestions || suggestions.length === 0) {
    return {
      intent: "NO_ACTION",
      urgency: "LOW",
      basis: "stable_performance"
    };
  }

  const primary = suggestions[0];

  let urgency = "MEDIUM";
  if (primary.priority === "high") urgency = "HIGH";
  if (primary.priority === "low") urgency = "LOW";

  return {
    intent: primary.type, // TAKE_BREAK, LOW_ENERGY_HOUR, PEAK_HOUR
    urgency,
    basis: primary.reason,
    velocity: currentVelocity,
    baselineVelocity: userProfile.baselineVelocity,
    optimalRange: userProfile.optimalRange
  };
}

module.exports = { interpretML };