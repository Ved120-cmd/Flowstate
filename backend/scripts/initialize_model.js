/**
 * Initialize ML Model Script
 * Run this to set up the velocity prediction model
 * 
 * Usage:
 *   node initialize_model.js
 * 
 * Or add to package.json:
 *   "scripts": {
 *     "init-model": "node backend/scripts/initialize_model.js"
 *   }
 */

const path = require('path');
const fs = require('fs');

// Check if we're in the correct directory
const scriptsDir = __dirname;
const backendDir = path.join(scriptsDir, '..');
const trainDatasetPath = path.join(scriptsDir, 'training_dataset.json');
const trainScriptPath = path.join(scriptsDir, 'train_model.js');

console.log('🔧 ML Model Initialization\n');
console.log('📁 Scripts directory:', scriptsDir);
console.log('📁 Backend directory:', backendDir);
console.log('📁 Training dataset:', trainDatasetPath);
console.log('📁 Training script:', trainScriptPath);
console.log('');

// Verify files exist
if (!fs.existsSync(trainDatasetPath)) {
  console.error('❌ Training dataset not found!');
  console.error('   Expected:', trainDatasetPath);
  console.error('   Please ensure training_dataset.json is in the scripts directory');
  process.exit(1);
}

if (!fs.existsSync(trainScriptPath)) {
  console.error('❌ Training script not found!');
  console.error('   Expected:', trainScriptPath);
  console.error('   Please ensure train_model.js is in the scripts directory');
  process.exit(1);
}

console.log('✅ All required files found\n');

// Run the training script
console.log('🚀 Starting model training...\n');

try {
  // Import and run training
  const trainModel = require(trainScriptPath);
  
  trainModel()
    .then(result => {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 MODEL INITIALIZATION COMPLETE!');
      console.log('='.repeat(60));
      console.log('');
      console.log('✅ Training successful');
      console.log(`📊 Samples processed: ${result.trainedSamples}`);
      console.log(`🧠 Data points collected: ${result.modelStats.dataPointsCollected}`);
      console.log(`📈 Baseline velocity: ${result.modelStats.userProfile.baselineVelocity}`);
      console.log('');
      console.log('🔄 The model will continue learning from real user activity');
      console.log('💡 Start your application and begin using the activity tracking features');
      console.log('');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n' + '='.repeat(60));
      console.error('❌ MODEL INITIALIZATION FAILED');
      console.error('='.repeat(60));
      console.error('');
      console.error('Error:', error.message);
      console.error('');
      console.error('Stack trace:');
      console.error(error.stack);
      console.error('');
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Failed to load training script:', error);
  process.exit(1);
}