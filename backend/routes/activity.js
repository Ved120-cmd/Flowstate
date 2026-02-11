/**
 * Activity tracking routes (legacy - now handled by mlvelocity.js)
 */

const express = require('express');
const router = express.Router();

console.log('⚠️  Legacy activity routes loaded (use mlvelocity.js instead)');

// Placeholder routes - actual activity tracking is in mlvelocity.js
router.get('/session', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Use /api/velocity/personalized for ML-powered metrics' 
  });
});

router.post('/reset', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Session management endpoint' 
  });
});

module.exports = router;