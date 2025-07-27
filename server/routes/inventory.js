const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Validation middleware
const validateInventory = [
  body('coffee_bean_id').isInt({ min: 1 }).withMessage('Valid coffee bean ID is required'),
  body('quantity_grams').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('storage_location').optional(),
  body('purchase_date').optional().isISO8601().withMessage('Invalid purchase date'),
  body('roast_date').optional().isISO8601().withMessage('Invalid roast date'),
  body('expiry_date').optional().isISO8601().withMessage('Invalid expiry date')
];

// GET all inventory
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM inventory i
      JOIN coffee_beans cb ON i.coffee_bean_id = cb.id
      ORDER BY i.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET inventory grouped by country
router.get('/by-country', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        cb.origin,
        COUNT(DISTINCT i.coffee_bean_id) as unique_beans,
        COUNT(i.id) as total_items,
        SUM(i.quantity_grams) as total_quantity,
        AVG(i.quantity_grams) as avg_quantity,
        COUNT(CASE WHEN i.quantity_grams < 500 THEN 1 END) as low_stock_count,
        MIN(i.purchase_date) as earliest_purchase,
        MAX(i.purchase_date) as latest_purchase
      FROM inventory i
      JOIN coffee_beans cb ON i.coffee_bean_id = cb.id
      GROUP BY cb.origin
      ORDER BY total_quantity DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory by country:', error);
    res.status(500).json({ error: 'Failed to fetch inventory by country' });
  }
});

// GET inventory by coffee bean ID
router.get('/bean/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT i.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM inventory i
      JOIN coffee_beans cb ON i.coffee_bean_id = cb.id
      WHERE i.coffee_bean_id = $1
      ORDER BY i.purchase_date DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory for coffee bean:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// GET low stock inventory (less than 500g)
router.get('/low-stock', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM inventory i
      JOIN coffee_beans cb ON i.coffee_bean_id = cb.id
      WHERE i.quantity_grams < 500
      ORDER BY i.quantity_grams ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock inventory:', error);
    res.status(500).json({ error: 'Failed to fetch low stock inventory' });
  }
});

// GET inventory summary
router.get('/summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(DISTINCT i.coffee_bean_id) as total_beans,
        SUM(i.quantity_grams) as total_quantity,
        AVG(i.quantity_grams) as avg_quantity,
        COUNT(CASE WHEN i.quantity_grams < 500 THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN i.expiry_date < CURRENT_DATE THEN 1 END) as expired_count,
        COUNT(DISTINCT cb.origin) as unique_countries
      FROM inventory i
      JOIN coffee_beans cb ON i.coffee_bean_id = cb.id
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ error: 'Failed to fetch inventory summary' });
  }
});

// POST new inventory entry
router.post('/', validateInventory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      coffee_bean_id, quantity_grams, purchase_date, roast_date,
      expiry_date, storage_location
    } = req.body;

    const result = await db.query(`
      INSERT INTO inventory (coffee_bean_id, quantity_grams, purchase_date, roast_date, expiry_date, storage_location)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [coffee_bean_id, quantity_grams, purchase_date, roast_date, expiry_date, storage_location]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating inventory entry:', error);
    res.status(500).json({ error: 'Failed to create inventory entry' });
  }
});

// PUT update inventory entry
router.put('/:id', validateInventory, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      coffee_bean_id, quantity_grams, purchase_date, roast_date,
      expiry_date, storage_location
    } = req.body;

    const result = await db.query(`
      UPDATE inventory 
      SET coffee_bean_id = $1, quantity_grams = $2, purchase_date = $3, 
          roast_date = $4, expiry_date = $5, storage_location = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [coffee_bean_id, quantity_grams, purchase_date, roast_date, expiry_date, storage_location, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inventory entry:', error);
    res.status(500).json({ error: 'Failed to update inventory entry' });
  }
});

// DELETE inventory entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory entry not found' });
    }

    res.json({ message: 'Inventory entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory entry:', error);
    res.status(500).json({ error: 'Failed to delete inventory entry' });
  }
});

// POST adjust quantity
router.post('/:id/adjust', [
  body('adjustment').isFloat().withMessage('Adjustment must be a number'),
  body('reason').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { adjustment, reason } = req.body;

    // Get current quantity
    const currentResult = await db.query('SELECT quantity_grams FROM inventory WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory entry not found' });
    }

    const currentQuantity = parseFloat(currentResult.rows[0].quantity_grams) || 0;
    const newQuantity = Math.max(0, currentQuantity + parseFloat(adjustment));

    // Update quantity
    const result = await db.query(`
      UPDATE inventory 
      SET quantity_grams = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [newQuantity, id]);

    // Log the adjustment (you might want to create a separate table for this)
    console.log(`Inventory ${id} adjusted by ${adjustment}g. Reason: ${reason || 'No reason provided'}`);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adjusting inventory quantity:', error);
    res.status(500).json({ error: 'Failed to adjust inventory quantity' });
  }
});

module.exports = router; 