/**
 * API Endpoint Tests for ML Velocity System
 * Tests the REST API endpoints
 */

const axios = require('axios');

class APITester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.testUserId = `test-user-${Date.now()}`;
    this.testResults = [];
  }

  /**
   * Run all API tests
   */
  async runAllTests() {
    console.log('🧪 Starting API Endpoint Tests\n');
    console.log(`Base URL: ${this.baseURL}`);
    console.log(`Test User ID: ${this.testUserId}\n`);
    
    await this.testRecordActivity();
    await this.testRecordTaskCompletion();
    await this.testRecordError();
    await this.testGetPersonalizedVelocity();
    await this.testInterventionFeedback();
    await this.testGetModelState();
    await this.testGetCurrentVelocity();
    await this.testResetSession();
    
    this.printResults();
  }

  /**
   * Test 1: POST /api/activity
   */
  async testRecordActivity() {
    console.log('📝 Test 1: Record Activity');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/activity`, {
        userId: this.testUserId,
        activityType: 'typing',
        data: { keystrokes: 150 }
      });
      
      console.log('  Status:', response.status);
      console.log('  Response:', response.data);
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ PASS\n');
        this.testResults.push({ test: 'Record Activity', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL\n');
        this.testResults.push({ test: 'Record Activity', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('  Response:', error.response?.data, '\n');
      this.testResults.push({ test: 'Record Activity', status: 'ERROR' });
    }
  }

  /**
   * Test 2: POST /api/task/complete
   */
  async testRecordTaskCompletion() {
    console.log('✅ Test 2: Record Task Completion');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/task/complete`, {
        userId: this.testUserId,
        taskId: 'task-123',
        duration: 15,
        complexity: 'medium'
      });
      
      console.log('  Status:', response.status);
      console.log('  Velocity:', response.data.velocity);
      console.log('  ML Status:', response.data.mlModelStatus);
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ PASS\n');
        this.testResults.push({ test: 'Task Completion', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL\n');
        this.testResults.push({ test: 'Task Completion', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('  Response:', error.response?.data, '\n');
      this.testResults.push({ test: 'Task Completion', status: 'ERROR' });
    }
  }

  /**
   * Test 3: POST /api/error
   */
  async testRecordError() {
    console.log('⚠️  Test 3: Record Error Event');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/error`, {
        userId: this.testUserId,
        errorType: 'undo_redo',
        errorData: { count: 1 }
      });
      
      console.log('  Status:', response.status);
      console.log('  Response:', response.data);
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ PASS\n');
        this.testResults.push({ test: 'Record Error', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL\n');
        this.testResults.push({ test: 'Record Error', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('  Response:', error.response?.data, '\n');
      this.testResults.push({ test: 'Record Error', status: 'ERROR' });
    }
  }

  /**
   * Test 4: GET /api/velocity/personalized
   */
  async testGetPersonalizedVelocity() {
    console.log('🎯 Test 4: Get Personalized Velocity');
    
    try {
      // First, generate some data
      for (let i = 0; i < 10; i++) {
        await axios.post(`${this.baseURL}/api/task/complete`, {
          userId: this.testUserId,
          taskId: `task-${i}`,
          duration: 10 + Math.random() * 10,
          complexity: 'medium'
        });
        
        // Small delay to simulate real work
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Now get personalized recommendations
      const response = await axios.get(`${this.baseURL}/api/velocity/personalized`, {
        params: { userId: this.testUserId }
      });
      
      console.log('  Status:', response.status);
      console.log('  Current Velocity:', response.data.currentVelocity);
      console.log('  Personalized Weights:', response.data.personalizedWeights);
      console.log('  Suggestions:', response.data.suggestions?.length || 0);
      
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        console.log('  Recommendations:');
        response.data.suggestions.forEach(s => {
          console.log(`    - ${s.type}: ${s.message}`);
        });
      }
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ PASS\n');
        this.testResults.push({ test: 'Personalized Velocity', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL\n');
        this.testResults.push({ test: 'Personalized Velocity', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('  Response:', error.response?.data, '\n');
      this.testResults.push({ test: 'Personalized Velocity', status: 'ERROR' });
    }
  }

  /**
   * Test 5: POST /api/intervention/feedback
   */
  async testInterventionFeedback() {
    console.log('💬 Test 5: Record Intervention Feedback');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/intervention/feedback`, {
        userId: this.testUserId,
        interventionType: 'TAKE_BREAK',
        accepted: true,
        velocityBefore: 65,
        velocityAfter: 80
      });
      
      console.log('  Status:', response.status);
      console.log('  Message:', response.data.message);
      console.log('  Model State:', response.data.modelState);
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ PASS\n');
        this.testResults.push({ test: 'Intervention Feedback', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL\n');
        this.testResults.push({ test: 'Intervention Feedback', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('  Response:', error.response?.data, '\n');
      this.testResults.push({ test: 'Intervention Feedback', status: 'ERROR' });
    }
  }

  /**
   * Test 6: GET /api/ml/model/state
   */
  async testGetModelState() {
    console.log('🔍 Test 6: Get ML Model State');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/ml/model/state`, {
        params: { userId: this.testUserId }
      });
      
      console.log('  Status:', response.status);
      console.log('  Model State:');
      console.log('    - Initialized:', response.data.modelState.isInitialized);
      console.log('    - Data Points:', response.data.modelState.dataPointsCollected);
      console.log('    - Peak Hours:', response.data.modelState.userProfile.peakHours);
      console.log('    - Baseline:', response.data.modelState.userProfile.baselineVelocity);
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ PASS\n');
        this.testResults.push({ test: 'Get Model State', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL\n');
        this.testResults.push({ test: 'Get Model State', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('  Response:', error.response?.data, '\n');
      this.testResults.push({ test: 'Get Model State', status: 'ERROR' });
    }
  }

  /**
   * Test 7: GET /api/velocity/current (backwards compatible)
   */
  async testGetCurrentVelocity() {
    console.log('📊 Test 7: Get Current Velocity (Legacy)');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/velocity/current`, {
        params: { userId: this.testUserId }
      });
      
      console.log('  Status:', response.status);
      console.log('  Current Velocity:', response.data.currentVelocity);
      console.log('  Intervention:', response.data.intervention?.type || 'None');
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ PASS\n');
        this.testResults.push({ test: 'Current Velocity', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL\n');
        this.testResults.push({ test: 'Current Velocity', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('  Response:', error.response?.data, '\n');
      this.testResults.push({ test: 'Current Velocity', status: 'ERROR' });
    }
  }

  /**
   * Test 8: POST /api/session/reset
   */
  async testResetSession() {
    console.log('🔄 Test 8: Reset Session');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/session/reset`, {
        userId: this.testUserId
      });
      
      console.log('  Status:', response.status);
      console.log('  Message:', response.data.message);
      
      if (response.status === 200 && response.data.success) {
        console.log('  ✅ PASS\n');
        this.testResults.push({ test: 'Reset Session', status: 'PASS' });
      } else {
        console.log('  ❌ FAIL\n');
        this.testResults.push({ test: 'Reset Session', status: 'FAIL' });
      }
    } catch (error) {
      console.log('  ❌ ERROR:', error.message);
      console.log('  Response:', error.response?.data, '\n');
      this.testResults.push({ test: 'Reset Session', status: 'ERROR' });
    }
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('═══════════════════════════════════════════════════');
    console.log('📊 API TEST RESULTS');
    console.log('═══════════════════════════════════════════════════\n');
    
    let passed = 0;
    let failed = 0;
    let errored = 0;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : 
                   result.status === 'FAIL' ? '❌' : '💥';
      
      console.log(`${icon} ${result.test}: ${result.status}`);
      
      if (result.status === 'PASS') passed++;
      else if (result.status === 'FAIL') failed++;
      else if (result.status === 'ERROR') errored++;
    });
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`Total: ${this.testResults.length} tests`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`💥 Errors: ${errored}`);
    console.log('═══════════════════════════════════════════════════\n');
    
    if (failed === 0 && errored === 0) {
      console.log('🎉 All API tests passed!\n');
    } else {
      console.log('⚠️  Some tests failed. Make sure backend is running.\n');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const baseURL = process.argv[2] || 'http://localhost:5000';
  const tester = new APITester(baseURL);
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;