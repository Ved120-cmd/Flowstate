// backend/intelligence/toneEngine.js

function selectTone(workdayPreference, urgency) {
  if (workdayPreference === "CALM") {
    return urgency === "HIGH" ? "gentle_warning" : "soft_suggestion";
  }

  if (workdayPreference === "HIGH_OUTPUT") {
    return urgency === "HIGH" ? "direct" : "efficient";
  }

  // BALANCED
  return urgency === "HIGH" ? "firm_supportive" : "neutral";
}

module.exports = { selectTone };
