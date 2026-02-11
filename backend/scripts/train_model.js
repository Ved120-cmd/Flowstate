/**
 * ML Model Training Script
 * Train the velocity prediction model with synthetic dataset
 * Run this ONCE to initialize the model
 */

const fs = require('fs');
const path = require('path');
// Use the ML prediction model, NOT the Mongoose schema
const VelocityModel = require('../intelligence/VelocityPredictionModel');

async function trainModel() {
  console.log('🚀 Starting ML Model Training...\n');

  try {
    // Load training dataset
    const datasetPath = path.join(__dirname, 'training_dataset.json');
    console.log('📂 Loading dataset from:', datasetPath);
    
    const rawData = fs.readFileSync(datasetPath, 'utf8');
    const dataset = JSON.parse(rawData);
    
    console.log(`✅ Loaded ${dataset.samples.length} training samples\n`);

    // Initialize model
    console.log('🧠 Initializing Velocity Model...');
    const model = new VelocityModel();

    // Training loop
    console.log('🎓 Training model with samples...\n');
    let trainedCount = 0;

    for (const sample of dataset.samples) {
      // Prepare features
      const features = {
        hour: sample.hour,
        dayOfWeek: sample.dayOfWeek,
        clicks: sample.clicks,
        keystrokes: sample.keystrokes,
        mouseMoves: sample.mouseMoves,
        scrolls: sample.scrolls,
        taskComplexity: sample.taskComplexity,
        recentCompletions: sample.recentCompletions,
        avgTaskDuration: sample.avgTaskDuration
      };

      const targetVelocity = sample.velocity;

      // Train on this sample
      model.train(features, targetVelocity);
      trainedCount++;

      // Progress indicator
      if (trainedCount % 10 === 0) {
        console.log(`   Trained: ${trainedCount}/${dataset.samples.length} samples`);
      }
    }

    console.log(`\n✅ Training complete! Processed ${trainedCount} samples\n`);

    // Verify model
    console.log('🔍 Verifying model...');
    
    // Test prediction with first sample
    const testSample = dataset.samples[0];
    const testFeatures = {
      hour: testSample.hour,
      dayOfWeek: testSample.dayOfWeek,
      clicks: testSample.clicks,
      keystrokes: testSample.keystrokes,
      mouseMoves: testSample.mouseMoves,
      scrolls: testSample.scrolls,
      taskComplexity: testSample.taskComplexity,
      recentCompletions: testSample.recentCompletions,
      avgTaskDuration: testSample.avgTaskDuration
    };

    const prediction = model.predict(testFeatures);
    console.log('\n📊 Test Prediction:');
    console.log(`   Input features:`, testFeatures);
    console.log(`   Expected velocity: ${testSample.velocity}`);
    console.log(`   Predicted velocity: ${prediction.velocity}`);
    console.log(`   Confidence: ${prediction.confidence}`);

    // Get model stats
    const stats = model.getModelStats();
    console.log('\n📈 Model Statistics:');
    console.log(`   Initialized: ${stats.isInitialized}`);
    console.log(`   Data points: ${stats.dataPointsCollected}`);
    console.log(`   Baseline velocity: ${stats.userProfile.baselineVelocity}`);
    console.log(`   Peak hours:`, stats.userProfile.peakHours);
    console.log(`   Low energy hours:`, stats.userProfile.lowEnergyHours);

    console.log('\n✅ Model training successful!');
    console.log('💡 The model is now ready to make predictions');
    console.log('🔄 It will continue to learn from real user activity\n');

    return {
      success: true,
      trainedSamples: trainedCount,
      modelStats: stats,
      testPrediction: prediction
    };

  } catch (error) {
    console.error('❌ Training failed:', error);
    throw error;
  }
}

// Run training if called directly
if (require.main === module) {
  trainModel()
    .then(result => {
      console.log('🎉 Training script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Training script failed:', error);
      process.exit(1);
    });
}

module.exports = trainModel;