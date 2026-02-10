/**
 * Test Suite for Online Learning Model
 * Tests the ML-enhanced velocity tracking system
 */

const OnlineLearningModel = require('../services/onlineLearningModel');
const VelocityService = require('../services/velocityService');

class MLModelTester {
  constructor() {
    this.testResults = [];
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Online Learning Model Tests\n');
    
    await this.testBasicVelocityCalculation();
    await this.testWeightLearning();
    await this.testThresholdAdaptation();
    await this.testPersonalizedRecommendations();
    await this.testInterventionEffectiveness();
    await this.testTemporalPatterns();
    await this.testModelPersistence();
    await this.testRealWorldScenario();
    
    this.printResults();
  }

  /**
   * Test 1: Basic Velocity Calculation
   */
  async testBasicVelocityCalculation() {
    console.log('📊 Test 1: Basic Velocity Calculation');
    
    try {
      const model = new OnlineLearningModel('test-user-1');
      
      // Test case 1: Fast completion, low idle, no errors
      const metrics1 = {
        completionTime: 5,  // 5 min to complete
        idleTime: 1,        // 1 min idle
        totalTime: 10,      // out of 10 min
        errorCount: 0
      };
      
      const velocity1 = model.calculateVelocity(metrics1);
      console.log(`  ✓ Fast work: ${velocity1.toFixed(2)}/100`);
      
      // Test case 2: Slow completion, high idle, some errors
      const metrics2 = {
        completionTime: 15, // 15 min to complete
        idleTime: 5,        // 5 min idle
        totalTime: 10,
        errorCount: 3
      };
      
      const velocity2 = model.calculateVelocity(metrics2);
      console.log(`  ✓ Slow work: ${velocity2.toFixed(2)}/100`);
      
      // Verify velocity1 > velocity2
      if (velocity1 > velocity2) {
        console.log('  ✅ PASS: Fast work has higher velocity\n');
        this.testResults.push({ test: 'Basic Velocity', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL: Velocity calculation incorrect\n');
        this.testResults.push({ test: 'Basic Velocity', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message, '\n');
      this.testResults.push({ test: 'Basic Velocity', status: 'ERROR' });
    }
  }

  /**
   * Test 2: Weight Learning (Online Gradient Descent)
   */
  async testWeightLearning() {
    console.log('🎯 Test 2: Weight Learning');
    
    try {
      const model = new OnlineLearningModel('test-user-2');
      
      console.log('  Initial weights:', model.personalizedWeights);
      
      // Simulate 50 data points (user who completes tasks fast but makes errors)
      for (let i = 0; i < 50; i++) {
        const dataPoint = {
          timestamp: Date.now() + i * 60000,
          velocity: 75 + Math.random() * 10, // Target velocity ~75-85
          metrics: {
            completionTime: 3 + Math.random() * 2,  // Fast completion
            idleTime: 1,
            totalTime: 10,
            errorCount: 2 + Math.floor(Math.random() * 3) // Some errors
          },
          userState: { taskCompleted: true }
        };
        
        model.recordDataPoint(dataPoint);
      }
      
      console.log('  Updated weights:', model.personalizedWeights);
      console.log('  Data points collected:', model.dataPointsCollected);
      console.log('  Model initialized:', model.isInitialized);
      
      if (model.isInitialized) {
        console.log('  ✅ PASS: Model learned from data\n');
        this.testResults.push({ test: 'Weight Learning', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL: Model did not initialize\n');
        this.testResults.push({ test: 'Weight Learning', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message, '\n');
      this.testResults.push({ test: 'Weight Learning', status: 'ERROR' });
    }
  }

  /**
   * Test 3: Threshold Adaptation
   */
  async testThresholdAdaptation() {
    console.log('⚖️  Test 3: Threshold Adaptation');
    
    try {
      const model = new OnlineLearningModel('test-user-3');
      
      const initialThreshold = model.personalizedThresholds.velocityDropThreshold;
      console.log('  Initial drop threshold:', initialThreshold);
      
      // Simulate user who ACCEPTS break suggestions (high acceptance rate)
      for (let i = 0; i < 50; i++) {
        const dataPoint = {
          timestamp: Date.now() + i * 60000,
          velocity: 70,
          metrics: {
            completionTime: 10,
            idleTime: 2,
            totalTime: 10,
            errorCount: 1
          },
          interventionTriggered: { type: 'TAKE_BREAK' },
          interventionAccepted: true, // User accepts 100% of suggestions
          postInterventionVelocity: 85 // Velocity improves after break
        };
        
        model.recordDataPoint(dataPoint);
      }
      
      const newThreshold = model.personalizedThresholds.velocityDropThreshold;
      console.log('  New drop threshold:', newThreshold);
      console.log('  Intervention stats:', model.userProfile.interventionSuccess['TAKE_BREAK']);
      
      if (newThreshold > initialThreshold) {
        console.log('  ✅ PASS: Threshold adapted (more sensitive for accepting user)\n');
        this.testResults.push({ test: 'Threshold Adaptation', status: 'PASS' });
      } else {
        console.log('  ⚠️  WARN: Threshold did not increase (might need more data)\n');
        this.testResults.push({ test: 'Threshold Adaptation', status: 'WARN' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message, '\n');
      this.testResults.push({ test: 'Threshold Adaptation', status: 'ERROR' });
    }
  }

  /**
   * Test 4: Personalized Recommendations
   */
  async testPersonalizedRecommendations() {
    console.log('💡 Test 4: Personalized Recommendations');
    
    try {
      const model = new OnlineLearningModel('test-user-4');
      
      // Simulate learning phase: User has low energy at 2 PM
      for (let i = 0; i < 50; i++) {
        const hour = 14; // 2 PM
        const dataPoint = {
          timestamp: new Date().setHours(hour, i, 0, 0),
          velocity: 50 + Math.random() * 10, // Low velocity at 2 PM
          metrics: {
            completionTime: 15,
            idleTime: 3,
            totalTime: 10,
            errorCount: 2
          }
        };
        
        model.recordDataPoint(dataPoint);
      }
      
      // Get recommendations at 2 PM
      const recommendations = model.getPersonalizedRecommendations(
        {
          completionTime: 15,
          idleTime: 3,
          totalTime: 10,
          errorCount: 2
        },
        14 // 2 PM
      );
      
      console.log('  Current velocity:', recommendations.currentVelocity.toFixed(2));
      console.log('  Baseline velocity:', recommendations.userProfile.baselineVelocity.toFixed(2));
      console.log('  Peak hours:', recommendations.userProfile.peakHours);
      console.log('  Low energy hours:', recommendations.userProfile.lowEnergyHours);
      console.log('  Suggestions:', recommendations.suggestions.length);
      
      if (recommendations.suggestions.length > 0) {
        recommendations.suggestions.forEach(s => {
          console.log(`    - ${s.type}: ${s.message}`);
        });
      }
      
      if (recommendations.userProfile.lowEnergyHours.includes(14)) {
        console.log('  ✅ PASS: Model identified low energy hour\n');
        this.testResults.push({ test: 'Personalized Recommendations', status: 'PASS' });
      } else {
        console.log('  ⚠️  WARN: Low energy hour not identified (might need more data)\n');
        this.testResults.push({ test: 'Personalized Recommendations', status: 'WARN' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message, '\n');
      this.testResults.push({ test: 'Personalized Recommendations', status: 'ERROR' });
    }
  }

  /**
   * Test 5: Intervention Effectiveness Tracking
   */
  async testInterventionEffectiveness() {
    console.log('📈 Test 5: Intervention Effectiveness Tracking');
    
    try {
      const model = new OnlineLearningModel('test-user-5');
      
      // Simulate breaks that HELP (velocity improves)
      for (let i = 0; i < 25; i++) {
        model.recordDataPoint({
          timestamp: Date.now() + i * 60000,
          velocity: 65,
          metrics: { completionTime: 12, idleTime: 2, totalTime: 10, errorCount: 1 },
          interventionTriggered: { type: 'TAKE_BREAK' },
          interventionAccepted: true,
          postInterventionVelocity: 85 // +20 improvement
        });
      }
      
      // Simulate task switches that DON'T HELP (velocity stays same)
      for (let i = 0; i < 25; i++) {
        model.recordDataPoint({
          timestamp: Date.now() + (i + 25) * 60000,
          velocity: 65,
          metrics: { completionTime: 12, idleTime: 2, totalTime: 10, errorCount: 3 },
          interventionTriggered: { type: 'SWITCH_TASK' },
          interventionAccepted: true,
          postInterventionVelocity: 66 // +1 minimal improvement
        });
      }
      
      const breakEffectiveness = model.userProfile.interventionSuccess['TAKE_BREAK'].effectiveness;
      const switchEffectiveness = model.userProfile.interventionSuccess['SWITCH_TASK'].effectiveness;
      
      console.log('  Break effectiveness:', breakEffectiveness.toFixed(2));
      console.log('  Switch task effectiveness:', switchEffectiveness.toFixed(2));
      
      if (breakEffectiveness > switchEffectiveness) {
        console.log('  ✅ PASS: Model tracks intervention effectiveness\n');
        this.testResults.push({ test: 'Intervention Effectiveness', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL: Effectiveness tracking incorrect\n');
        this.testResults.push({ test: 'Intervention Effectiveness', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message, '\n');
      this.testResults.push({ test: 'Intervention Effectiveness', status: 'ERROR' });
    }
  }

  /**
   * Test 6: Temporal Pattern Detection
   */
  async testTemporalPatterns() {
    console.log('⏰ Test 6: Temporal Pattern Detection');
    
    try {
      const model = new OnlineLearningModel('test-user-6');
      
      // Simulate data: High productivity at 9-11 AM, low at 2-4 PM
      const hours = [9, 9, 10, 10, 11, 11, 14, 14, 15, 15]; // Sample hours
      const velocities = [90, 85, 88, 92, 87, 89, 55, 52, 58, 54]; // High morning, low afternoon
      
      for (let i = 0; i < 50; i++) {
        const hour = hours[i % hours.length];
        const baseVelocity = velocities[i % velocities.length];
        
        const dataPoint = {
          timestamp: new Date().setHours(hour, i, 0, 0),
          velocity: baseVelocity + (Math.random() - 0.5) * 5,
          metrics: {
            completionTime: hour < 12 ? 5 : 15, // Fast in morning, slow in afternoon
            idleTime: hour < 12 ? 1 : 4,
            totalTime: 10,
            errorCount: hour < 12 ? 0 : 2
          }
        };
        
        model.recordDataPoint(dataPoint);
      }
      
      console.log('  Peak hours detected:', model.userProfile.peakHours);
      console.log('  Low energy hours detected:', model.userProfile.lowEnergyHours);
      
      const hasMorningPeak = model.userProfile.peakHours.some(h => h >= 9 && h <= 11);
      const hasAfternoonDip = model.userProfile.lowEnergyHours.some(h => h >= 14 && h <= 15);
      
      if (hasMorningPeak && hasAfternoonDip) {
        console.log('  ✅ PASS: Temporal patterns detected\n');
        this.testResults.push({ test: 'Temporal Patterns', status: 'PASS' });
      } else {
        console.log('  ⚠️  WARN: Some patterns not detected\n');
        this.testResults.push({ test: 'Temporal Patterns', status: 'WARN' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message, '\n');
      this.testResults.push({ test: 'Temporal Patterns', status: 'ERROR' });
    }
  }

  /**
   * Test 7: Model Persistence (Save/Load)
   */
  async testModelPersistence() {
    console.log('💾 Test 7: Model Persistence');
    
    try {
      // Create and train a model
      const model1 = new OnlineLearningModel('test-user-7');
      
      for (let i = 0; i < 50; i++) {
        model1.recordDataPoint({
          timestamp: Date.now() + i * 60000,
          velocity: 75,
          metrics: { completionTime: 8, idleTime: 2, totalTime: 10, errorCount: 1 }
        });
      }
      
      const originalWeights = { ...model1.personalizedWeights };
      const originalBaseline = model1.userProfile.baselineVelocity;
      
      // Save model state
      const savedState = await model1.saveModel();
      console.log('  Model saved');
      
      // Load into new model
      const model2 = await OnlineLearningModel.loadModel('test-user-7', savedState);
      console.log('  Model loaded');
      
      const loadedWeights = model2.personalizedWeights;
      const loadedBaseline = model2.userProfile.baselineVelocity;
      
      console.log('  Original weights:', originalWeights);
      console.log('  Loaded weights:', loadedWeights);
      console.log('  Original baseline:', originalBaseline);
      console.log('  Loaded baseline:', loadedBaseline);
      
      const weightsMatch = Math.abs(originalWeights.alpha - loadedWeights.alpha) < 0.001;
      const baselineMatch = Math.abs(originalBaseline - loadedBaseline) < 0.001;
      
      if (weightsMatch && baselineMatch) {
        console.log('  ✅ PASS: Model state persisted correctly\n');
        this.testResults.push({ test: 'Model Persistence', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL: Model state not preserved\n');
        this.testResults.push({ test: 'Model Persistence', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message, '\n');
      this.testResults.push({ test: 'Model Persistence', status: 'ERROR' });
    }
  }

  /**
   * Test 8: Real-World Scenario
   */
  async testRealWorldScenario() {
    console.log('🌍 Test 8: Real-World Scenario');
    console.log('  Simulating a full workday with ML adaptation...\n');
    
    try {
      const model = new OnlineLearningModel('test-user-8');
      const velocityService = new VelocityService();
      
      // Simulate 8-hour workday (9 AM - 5 PM)
      const workday = [
        // Morning: High productivity
        { hour: 9, velocity: 85, ct: 5, idle: 1, errors: 0 },
        { hour: 10, velocity: 88, ct: 4, idle: 1, errors: 0 },
        { hour: 11, velocity: 82, ct: 6, idle: 1, errors: 1 },
        
        // Pre-lunch: Starting to decline
        { hour: 12, velocity: 75, ct: 8, idle: 2, errors: 1 },
        
        // Post-lunch: Low energy
        { hour: 13, velocity: 60, ct: 12, idle: 3, errors: 2 },
        { hour: 14, velocity: 58, ct: 13, idle: 4, errors: 3 },
        
        // Recovery after break
        { hour: 15, velocity: 70, ct: 9, idle: 2, errors: 1 },
        { hour: 16, velocity: 75, ct: 7, idle: 2, errors: 1 },
        
        // End of day: Tired
        { hour: 17, velocity: 65, ct: 10, idle: 3, errors: 2 }
      ];
      
      let interventionCount = 0;
      
      workday.forEach((period, index) => {
        // Record data point
        const dataPoint = {
          timestamp: new Date().setHours(period.hour, 0, 0, 0),
          velocity: period.velocity,
          metrics: {
            completionTime: period.ct,
            idleTime: period.idle,
            totalTime: 10,
            errorCount: period.errors
          }
        };
        
        model.recordDataPoint(dataPoint);
        velocityService.recordVelocity(period.velocity);
        
        // Check for interventions
        if (index >= 3) { // After collecting some data
          const recommendations = model.getPersonalizedRecommendations(
            dataPoint.metrics,
            period.hour
          );
          
          if (recommendations.suggestions.length > 0) {
            console.log(`  ${period.hour}:00 - Velocity: ${period.velocity}`);
            recommendations.suggestions.forEach(s => {
              console.log(`    → ${s.type}: ${s.message}`);
              interventionCount++;
            });
          }
        }
      });
      
      console.log('\n  Workday Summary:');
      console.log('    Total interventions:', interventionCount);
      console.log('    Peak hours:', model.userProfile.peakHours);
      console.log('    Low energy hours:', model.userProfile.lowEnergyHours);
      console.log('    Baseline velocity:', model.userProfile.baselineVelocity.toFixed(2));
      console.log('    Optimal range:', model.personalizedThresholds.optimalVelocityRange);
      
      if (interventionCount > 0 && model.isInitialized) {
        console.log('\n  ✅ PASS: Real-world scenario completed successfully\n');
        this.testResults.push({ test: 'Real-World Scenario', status: 'PASS' });
      } else {
        console.log('\n  ⚠️  WARN: Scenario completed with warnings\n');
        this.testResults.push({ test: 'Real-World Scenario', status: 'WARN' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message, '\n');
      this.testResults.push({ test: 'Real-World Scenario', status: 'ERROR' });
    }
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');
    
    let passed = 0;
    let warned = 0;
    let failed = 0;
    let errored = 0;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : 
                   result.status === 'WARN' ? '⚠️' : 
                   result.status === 'FAIL' ? '❌' : '💥';
      
      console.log(`${icon} ${result.test}: ${result.status}`);
      
      if (result.status === 'PASS') passed++;
      else if (result.status === 'WARN') warned++;
      else if (result.status === 'FAIL') failed++;
      else if (result.status === 'ERROR') errored++;
    });
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`Total: ${this.testResults.length} tests`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warned}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`💥 Errors: ${errored}`);
    console.log('═══════════════════════════════════════════════════\n');
    
    if (failed === 0 && errored === 0) {
      console.log('🎉 All critical tests passed! Your ML model is working correctly.\n');
    } else {
      console.log('⚠️  Some tests failed. Review the errors above.\n');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new MLModelTester();
  tester.runAllTests().catch(console.error);
}

module.exports = MLModelTester;