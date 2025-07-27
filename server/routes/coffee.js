const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Validation middleware
const validateCoffeeBean = [
  body('name').notEmpty().withMessage('Name is required'),
  body('origin').optional(),
  body('roast_level').optional().isIn(['Light', 'Medium', 'Medium-Dark', 'Dark']).withMessage('Invalid roast level'),
  body('description').optional(),
  body('buying_date').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return require('validator').isISO8601(value);
  }).withMessage('Invalid date format'),
  body('buying_place').optional(),
  body('buying_price').optional().isFloat({ min: 0 }).withMessage('Buying price must be a positive number'),
  body('buying_price_currency').optional().isIn(['USD', 'HKD', 'JPY']).withMessage('Invalid currency code'),
  body('amount_grams').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('roast_date').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return require('validator').isISO8601(value);
  }).withMessage('Invalid roast date format'),
  body('best_by_date').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return require('validator').isISO8601(value);
  }).withMessage('Invalid best by date format'),
  body('photo_url').optional()
];

// GET all coffee beans
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT cb.*, 
             COALESCE(SUM(i.quantity_grams), 0) as total_inventory,
             COUNT(t.id) as tasting_count,
             AVG(t.overall_rating) as avg_rating
      FROM coffee_beans cb
      LEFT JOIN inventory i ON cb.id = i.coffee_bean_id
      LEFT JOIN tasting_notes t ON cb.id = t.coffee_bean_id
      GROUP BY cb.id
      ORDER BY cb.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching coffee beans:', error);
    res.status(500).json({ error: 'Failed to fetch coffee beans' });
  }
});

// GET single coffee bean by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM coffee_beans WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coffee bean not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching coffee bean:', error);
    res.status(500).json({ error: 'Failed to fetch coffee bean' });
  }
});

// POST new coffee bean
router.post('/', validateCoffeeBean, async (req, res) => {
  try {
    console.log('Received coffee bean data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, origin, roast_level, description, buying_date,
      buying_place, buying_price, buying_price_currency, amount_grams, roast_date, best_by_date, photo_url
    } = req.body;

    // Calculate price per gram for display purposes (only if both values are provided)
    const price_per_gram = (amount_grams && buying_price && amount_grams > 0) ? (buying_price / amount_grams) : 0;

    const result = await db.query(`
      INSERT INTO coffee_beans (name, origin, roast_level, description, buying_date, buying_place, buying_price, buying_price_currency, amount_grams, roast_date, best_by_date, price_per_lb, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [name, origin || null, roast_level || null, description || null, buying_date || null, buying_place || null, buying_price || null, buying_price_currency || 'USD', amount_grams || null, roast_date || null, best_by_date || null, price_per_gram, photo_url || null]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating coffee bean:', error);
    res.status(500).json({ error: 'Failed to create coffee bean' });
  }
});

// PUT update coffee bean
router.put('/:id', validateCoffeeBean, async (req, res) => {
  try {
    console.log('Received update data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name, origin, roast_level, description, buying_date,
      buying_place, buying_price, buying_price_currency, amount_grams, roast_date, best_by_date, photo_url
    } = req.body;

    // Calculate price per gram for display purposes (only if both values are provided)
    const price_per_gram = (amount_grams && buying_price && amount_grams > 0) ? (buying_price / amount_grams) : 0;

    const result = await db.query(`
      UPDATE coffee_beans
      SET name = $1, origin = $2, roast_level = $3, description = $4, buying_date = $5,
          buying_place = $6, buying_price = $7, buying_price_currency = $8, amount_grams = $9, roast_date = $10, best_by_date = $11,
          price_per_lb = $12, photo_url = $13, updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
    `, [name, origin || null, roast_level || null, description || null, buying_date || null, buying_place || null, buying_price || null, buying_price_currency || 'USD', amount_grams || null, roast_date || null, best_by_date || null, price_per_gram, photo_url || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coffee bean not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating coffee bean:', error);
    res.status(500).json({ error: 'Failed to update coffee bean' });
  }
});

// DELETE coffee bean
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM coffee_beans WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coffee bean not found' });
    }

    res.json({ message: 'Coffee bean deleted successfully' });
  } catch (error) {
    console.error('Error deleting coffee bean:', error);
    res.status(500).json({ error: 'Failed to delete coffee bean' });
  }
});

// GET coffee beans by roast level
router.get('/roast/:level', async (req, res) => {
  try {
    const { level } = req.params;
    const result = await db.query(`
      SELECT cb.*, 
             COALESCE(SUM(i.quantity_grams), 0) as total_inventory
      FROM coffee_beans cb
      LEFT JOIN inventory i ON cb.id = i.coffee_bean_id
      WHERE cb.roast_level = $1
      GROUP BY cb.id
      ORDER BY cb.name
    `, [level]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching coffee beans by roast level:', error);
    res.status(500).json({ error: 'Failed to fetch coffee beans' });
  }
});

// GET coffee beans by origin
router.get('/origin/:origin', async (req, res) => {
  try {
    const { origin } = req.params;
    const result = await db.query(`
      SELECT cb.*, 
             COALESCE(SUM(i.quantity_grams), 0) as total_inventory
      FROM coffee_beans cb
      LEFT JOIN inventory i ON cb.id = i.coffee_bean_id
      WHERE cb.origin ILIKE $1
      GROUP BY cb.id
      ORDER BY cb.name
    `, [`%${origin}%`]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching coffee beans by origin:', error);
    res.status(500).json({ error: 'Failed to fetch coffee beans' });
  }
});

// GET freshness alerts
router.get('/freshness/alerts', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        cb.id,
        cb.name,
        cb.origin,
        cb.roast_date,
        cb.best_by_date,
        COALESCE(SUM(i.quantity_grams), 0) as total_inventory,
        CASE 
          WHEN cb.best_by_date IS NOT NULL THEN 
            CASE 
              WHEN cb.best_by_date < CURRENT_DATE THEN 'expired'
              WHEN cb.best_by_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
              WHEN cb.best_by_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_month'
              ELSE 'fresh'
            END
          WHEN cb.roast_date IS NOT NULL THEN
            CASE 
              WHEN cb.roast_date < CURRENT_DATE - INTERVAL '90 days' THEN 'old_roast'
              WHEN cb.roast_date < CURRENT_DATE - INTERVAL '60 days' THEN 'aging_roast'
              ELSE 'fresh_roast'
            END
          ELSE 'no_date'
        END as freshness_status,
        CASE 
          WHEN cb.best_by_date IS NOT NULL THEN 
            cb.best_by_date - CURRENT_DATE
          ELSE NULL
        END as days_until_expiry,
        CASE 
          WHEN cb.roast_date IS NOT NULL THEN 
            CURRENT_DATE - cb.roast_date
          ELSE NULL
        END as days_since_roast
      FROM coffee_beans cb
      LEFT JOIN inventory i ON cb.id = i.coffee_bean_id
      WHERE cb.best_by_date IS NOT NULL OR cb.roast_date IS NOT NULL
      GROUP BY cb.id, cb.name, cb.origin, cb.roast_date, cb.best_by_date
      HAVING COALESCE(SUM(i.quantity_grams), 0) > 0
      ORDER BY 
        CASE 
          WHEN cb.best_by_date < CURRENT_DATE THEN 0
          WHEN cb.best_by_date <= CURRENT_DATE + INTERVAL '7 days' THEN 1
          WHEN cb.best_by_date <= CURRENT_DATE + INTERVAL '30 days' THEN 2
          WHEN cb.roast_date < CURRENT_DATE - INTERVAL '90 days' THEN 3
          WHEN cb.roast_date < CURRENT_DATE - INTERVAL '60 days' THEN 4
          ELSE 5
        END,
        cb.best_by_date ASC NULLS LAST,
        cb.roast_date ASC NULLS LAST
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching freshness alerts:', error);
    res.status(500).json({ error: 'Failed to fetch freshness alerts' });
  }
});

// GET freshness summary
router.get('/freshness/summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_beans_with_dates,
        COUNT(CASE WHEN best_by_date < CURRENT_DATE THEN 1 END) as expired_count,
        COUNT(CASE WHEN best_by_date <= CURRENT_DATE + INTERVAL '7 days' AND best_by_date >= CURRENT_DATE THEN 1 END) as expiring_soon_count,
        COUNT(CASE WHEN best_by_date <= CURRENT_DATE + INTERVAL '30 days' AND best_by_date > CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as expiring_month_count,
        COUNT(CASE WHEN roast_date < CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as old_roast_count,
        COUNT(CASE WHEN roast_date < CURRENT_DATE - INTERVAL '60 days' AND roast_date >= CURRENT_DATE - INTERVAL '90 days' THEN 1 END) as aging_roast_count,
        COUNT(CASE WHEN (best_by_date IS NULL OR best_by_date > CURRENT_DATE + INTERVAL '30 days') 
                   AND (roast_date IS NULL OR roast_date >= CURRENT_DATE - INTERVAL '60 days') THEN 1 END) as fresh_count
      FROM coffee_beans cb
      WHERE (cb.best_by_date IS NOT NULL OR cb.roast_date IS NOT NULL)
    `);
    
    res.json(result.rows[0] || {
      total_beans_with_dates: 0,
      expired_count: 0,
      expiring_soon_count: 0,
      expiring_month_count: 0,
      old_roast_count: 0,
      aging_roast_count: 0,
      fresh_count: 0
    });
  } catch (error) {
    console.error('Error fetching freshness summary:', error);
    res.status(500).json({ error: 'Failed to fetch freshness summary' });
  }
});

module.exports = router; 