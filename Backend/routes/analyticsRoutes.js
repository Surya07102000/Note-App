const express = require('express');
const router = express.Router();
const { 
  getMostActiveUsers, 
  getMostUsedTags, 
  getNotesPerDay, 
  getAnalyticsSummary 
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// All analytics routes require authentication and admin privileges
router.use(auth);
router.use(admin);

router.get('/active-users', getMostActiveUsers);
router.get('/popular-tags', getMostUsedTags);
router.get('/notes-per-day', getNotesPerDay);
router.get('/summary', getAnalyticsSummary);

module.exports = router; 