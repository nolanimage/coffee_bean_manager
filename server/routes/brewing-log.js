const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const router = express.Router();

// Validation middleware
const validateBrewingLog = [
  body('coffee_bean_id').isInt({ min: 1 }).withMessage('Valid coffee bean ID is required'),
  body('brew_date').isISO8601().withMessage('Valid date is required'),
  body('grams_used').isInt({ min: 1 }).withMessage('Valid grams used is required'),
  body('cups_made').optional().isInt({ min: 1 }).withMessage('Valid cups made is required'),
  body('brew_method').optional(),
  body('notes').optional()
];

// POST new brewing log entry
router.post('/', validateBrewingLog, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { coffee_bean_id, brew_date, brew_method, grams_used, cups_made = 1, notes } = req.body;
    
    // Insert brewing log entry
    const brewResult = await db.query(`
      INSERT INTO brewing_log (coffee_bean_id, brew_date, brew_method, grams_used, cups_made, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [coffee_bean_id, brew_date, brew_method, grams_used, cups_made, notes]);
    
    // Update coffee bean cups brewed and cost per cup
    await db.query(`
      UPDATE coffee_beans 
      SET 
        cups_brewed = cups_brewed + $1,
        cost_per_cup = CASE 
          WHEN (cups_brewed + $1) > 0 THEN total_cost / (cups_brewed + $1)
          ELSE 0 
        END
      WHERE id = $2
    `, [cups_made, coffee_bean_id]);
    
    res.status(201).json(brewResult.rows[0]);
  } catch (error) {
    console.error('Error creating brewing log:', error);
    res.status(500).json({ error: 'Failed to create brewing log' });
  }
});

// GET brewing logs
router.get('/', async (req, res) => {
  try {
    const { coffee_bean_id, start_date, end_date } = req.query;
    let query = `
      SELECT bl.*, cb.name as coffee_bean_name, cb.origin, cb.total_cost
      FROM brewing_log bl
      JOIN coffee_beans cb ON bl.coffee_bean_id = cb.id
    `;
    const params = [];
    let whereConditions = [];
    
    if (coffee_bean_id) {
      params.push(coffee_bean_id);
      whereConditions.push(`bl.coffee_bean_id = $${params.length}`);
    }
    
    if (start_date) {
      params.push(start_date);
      whereConditions.push(`bl.brew_date >= $${params.length}`);
    }
    
    if (end_date) {
      params.push(end_date);
      whereConditions.push(`bl.brew_date <= $${params.length}`);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY bl.brew_date DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching brewing logs:', error);
    res.status(500).json({ error: 'Failed to fetch brewing logs' });
  }
});

// GET brewing statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_brews,
        SUM(bl.cups_made) as total_cups,
        SUM(bl.grams_used) as total_grams_used,
        AVG(bl.grams_used) as avg_grams_per_brew,
        AVG(bl.cups_made) as avg_cups_per_brew,
        COUNT(DISTINCT bl.coffee_bean_id) as unique_beans_brewed,
        COUNT(DISTINCT bl.brew_method) as unique_methods_used
      FROM brewing_log bl
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching brewing stats:', error);
    res.status(500).json({ error: 'Failed to fetch brewing stats' });
  }
});

// GET brewing method breakdown
router.get('/methods', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        bl.brew_method,
        COUNT(*) as brew_count,
        SUM(bl.cups_made) as total_cups,
        AVG(bl.grams_used) as avg_grams_used
      FROM brewing_log bl
      WHERE bl.brew_method IS NOT NULL
      GROUP BY bl.brew_method
      ORDER BY brew_count DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching brewing methods:', error);
    res.status(500).json({ error: 'Failed to fetch brewing methods' });
  }
});

module.exports = router; 