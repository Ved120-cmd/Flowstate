// backend/intelligence/explanationEngine.js

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateExplanation(intent, tone, context) {
  const openers = {
    soft_suggestion: [
      "Just a quick nudge —",
      "You might want to consider this —",
      "No pressure, but noticing that"
    ],
    gentle_warning: [
      "A gentle heads-up —",
      "Just looking out for you —",
      "This might help long-term —"
    ],
    direct: [
      "To maintain performance —",
      "Based on your current output —",
      "From an efficiency standpoint —"
    ],
    firm_supportive: [
      "Here’s what stands out —",
      "Worth addressing now —",
      "This could improve your flow —"
    ],
    neutral: [
      "Observation —",
      "Quick insight —",
      "Current status —"
    ],
    efficient: [
      "Efficiency tip —",
      "Optimization insight —",
      "Performance note —"
    ]
  };

  const reasons = {
    TAKE_BREAK: [
      `your velocity has dipped below your usual baseline`,
      `sustained effort is starting to affect momentum`,
      `your pace is outside your optimal range`
    ],
    LOW_ENERGY_HOUR: [
      `this time of day is usually lower-energy for you`,
      `historically, focus tends to dip around now`
    ],
    PEAK_HOUR: [
      `this is typically one of your strongest work hours`,
      `you tend to perform best around this time`
    ],
    NO_ACTION: [
      `your performance is stable`,
      `everything looks within your normal range`
    ]
  };

  const details = [
    `current velocity is ${Math.round(context.velocity)}`,
    `baseline velocity is ${Math.round(context.baselineVelocity)}`,
    `optimal range is ${context.optimalRange?.join("–")}`
  ];

  return `${pick(openers[tone])} ${pick(reasons[intent])}, and ${pick(details)}.`;
}

module.exports = { generateExplanation };