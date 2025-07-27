const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const router = express.Router();

// Validation middleware
const validateCostEntry = [
  body('coffee_bean_id').isInt({ min: 1 }).withMessage('Valid coffee bean ID is required'),
  body('purchase_date').isISO8601().withMessage('Valid date is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('quantity_grams').isInt({ min: 1 }).withMessage('Valid quantity in grams is required'),
  body('notes').optional()
];

// GET monthly spending summary
router.get('/monthly/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const result = await db.query(`
      SELECT 
        ct.coffee_bean_id,
        cb.name as coffee_bean_name,
        cb.origin,
        SUM(ct.amount) as total_spent,
        SUM(ct.quantity_grams) as total_grams,
        AVG(ct.cost_per_gram) as avg_cost_per_gram,
        COUNT(*) as purchases
      FROM cost_tracking ct
      JOIN coffee_beans cb ON ct.coffee_bean_id = cb.id
      WHERE EXTRACT(YEAR FROM ct.purchase_date) = $1 
        AND EXTRACT(MONTH FROM ct.purchase_date) = $2
      GROUP BY ct.coffee_bean_id, cb.name, cb.origin
      ORDER BY total_spent DESC
    `, [year, month]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching monthly spending:', error);
    res.status(500).json({ error: 'Failed to fetch monthly spending' });
  }
});

// GET cost analysis summary
router.get('/analysis', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        cb.id,
        cb.name,
        cb.origin,
        cb.total_cost,
        cb.cups_brewed,
        cb.cost_per_cup,
        CASE 
          WHEN cb.cups_brewed > 0 THEN (cb.total_cost / cb.cups_brewed)
          ELSE 0 
        END as calculated_cost_per_cup,
        CASE 
          WHEN cb.cups_brewed > 0 THEN (cb.total_cost / cb.cups_brewed * 30)
          ELSE 0 
        END as monthly_cost_at_1_cup_per_day
      FROM coffee_beans cb
      WHERE cb.total_cost > 0
      ORDER BY cb.cost_per_cup DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cost analysis:', error);
    res.status(500).json({ error: 'Failed to fetch cost analysis' });
  }
});

// GET ROI analysis for expensive beans
router.get('/roi', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        cb.id,
        cb.name,
        cb.origin,
        cb.total_cost,
        cb.cups_brewed,
        cb.cost_per_cup,
        CASE 
          WHEN cb.cups_brewed > 0 THEN 
            ROUND((cb.total_cost / cb.cups_brewed) * 100, 2)
          ELSE 0 
        END as cost_percentage_of_total,
        CASE 
          WHEN cb.cups_brewed > 0 THEN 
            ROUND((cb.total_cost / cb.cups_brewed) / 0.50 * 100, 2)
          ELSE 0 
        END as premium_over_standard_cup
      FROM coffee_beans cb
      WHERE cb.total_cost > 0
      ORDER BY cb.cost_per_cup DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ROI analysis:', error);
    res.status(500).json({ error: 'Failed to fetch ROI analysis' });
  }
});

// POST new cost entry
router.post('/', validateCostEntry, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { coffee_bean_id, purchase_date, amount, quantity_grams, notes } = req.body;
    const cost_per_gram = amount / quantity_grams;
    
    // Insert cost tracking entry
    const costResult = await db.query(`
      INSERT INTO cost_tracking (coffee_bean_id, purchase_date, amount, quantity_grams, cost_per_gram, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [coffee_bean_id, purchase_date, amount, quantity_grams, cost_per_gram, notes]);
    
    // Update coffee bean total cost
    await db.query(`
      UPDATE coffee_beans 
      SET total_cost = total_cost + $1
      WHERE id = $2
    `, [amount, coffee_bean_id]);
    
    res.status(201).json(costResult.rows[0]);
  } catch (error) {
    console.error('Error creating cost entry:', error);
    res.status(500).json({ error: 'Failed to create cost entry' });
  }
});

// GET all cost entries
router.get('/', async (req, res) => {
  try {
    const { coffee_bean_id, start_date, end_date } = req.query;
    let query = `
      SELECT ct.*, cb.name as coffee_bean_name, cb.origin
      FROM cost_tracking ct
      JOIN coffee_beans cb ON ct.coffee_bean_id = cb.id
    `;
    const params = [];
    let whereConditions = [];
    
    if (coffee_bean_id) {
      params.push(coffee_bean_id);
      whereConditions.push(`ct.coffee_bean_id = $${params.length}`);
    }
    
    if (start_date) {
      params.push(start_date);
      whereConditions.push(`ct.purchase_date >= $${params.length}`);
    }
    
    if (end_date) {
      params.push(end_date);
      whereConditions.push(`ct.purchase_date <= $${params.length}`);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY ct.purchase_date DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cost entries:', error);
    res.status(500).json({ error: 'Failed to fetch cost entries' });
  }
});

module.exports = router; 