const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get freshness alerts for coffee beans
router.get('/alerts', async (req, res) => {
  try {
    // For now, return empty array to prevent dashboard errors
    // TODO: Implement proper freshness logic
    res.json([]);
  } catch (error) {
    console.error('Error fetching freshness alerts:', error);
    res.status(500).json({ error: 'Failed to fetch freshness alerts' });
  }
});

module.exports = router; 