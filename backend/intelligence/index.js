// backend/intelligence/index.js

const { interpretML } = require("./interpretML");
const { selectTone } = require("./toneEngine");
const { generateExplanation } = require("./explanationEngine");
const { generateCounterfactual } = require("./counterFactualEngine");

function runIntelligence({ mlOutput, workdayPreference }) {
  const interpretation = interpretML(mlOutput);
  const tone = selectTone(workdayPreference, interpretation.urgency);

  const explanation = generateExplanation(
    interpretation.intent,
    tone,
    interpretation
  );

  const counterfactual = generateCounterfactual(
    interpretation.intent,
    interpretation
  );

  return {
    type: interpretation.intent,
    urgency: interpretation.urgency,
    tone,
    explanation,
    counterfactual
  };
}

module.exports = { runIntelligence };