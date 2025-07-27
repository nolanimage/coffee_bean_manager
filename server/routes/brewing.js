const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Validation middleware
const validateBrewingSchedule = [
  body('coffee_bean_id').isInt({ min: 1 }).withMessage('Valid coffee bean ID is required'),
  body('scheduled_date').isISO8601().withMessage('Valid date is required'),
  body('scheduled_time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format (HH:MM) is required'),
  body('brew_method').optional(),
  body('grind_size').optional(),
  body('water_temp').optional().isInt({ min: 1, max: 212 }).withMessage('Water temperature must be between 1-212°F'),
  body('brew_time').optional().isInt({ min: 1 }).withMessage('Brew time must be a positive number'),
  body('notes').optional(),
  body('status').optional().isIn(['planned', 'completed', 'cancelled', 'skipped']).withMessage('Invalid status')
];

// GET all brewing schedules
router.get('/', async (req, res) => {
  try {
    const { date, status, coffee_bean_id } = req.query;
    let query = `
      SELECT bs.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM brewing_schedule bs
      JOIN coffee_beans cb ON bs.coffee_bean_id = cb.id
    `;
    const params = [];
    let whereConditions = [];

    if (date) {
      params.push(date);
      whereConditions.push(`bs.scheduled_date = $${params.length}`);
    }

    if (status) {
      params.push(status);
      whereConditions.push(`bs.status = $${params.length}`);
    }

    if (coffee_bean_id) {
      params.push(coffee_bean_id);
      whereConditions.push(`bs.coffee_bean_id = $${params.length}`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY bs.scheduled_date ASC, bs.scheduled_time ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching brewing schedules:', error);
    res.status(500).json({ error: 'Failed to fetch brewing schedules' });
  }
});

// GET brewing schedule by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT bs.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM brewing_schedule bs
      JOIN coffee_beans cb ON bs.coffee_bean_id = cb.id
      WHERE bs.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brewing schedule not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching brewing schedule:', error);
    res.status(500).json({ error: 'Failed to fetch brewing schedule' });
  }
});

// POST new brewing schedule
router.post('/', validateBrewingSchedule, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      coffee_bean_id, scheduled_date, scheduled_time, brew_method,
      grind_size, water_temp, brew_time, notes, status
    } = req.body;

    // Check if coffee bean exists
    const coffeeBean = await db.query('SELECT id FROM coffee_beans WHERE id = $1', [coffee_bean_id]);
    if (coffeeBean.rows.length === 0) {
      return res.status(404).json({ error: 'Coffee bean not found' });
    }

    const result = await db.query(`
      INSERT INTO brewing_schedule (coffee_bean_id, scheduled_date, scheduled_time, brew_method, grind_size, water_temp, brew_time, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [coffee_bean_id, scheduled_date, scheduled_time, brew_method, grind_size, water_temp, brew_time, notes, status || 'planned']);

    const newSchedule = await db.query(`
      SELECT bs.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM brewing_schedule bs
      JOIN coffee_beans cb ON bs.coffee_bean_id = cb.id
      WHERE bs.id = $1
    `, [result.rows[0].id]);

    res.status(201).json(newSchedule.rows[0]);
  } catch (error) {
    console.error('Error creating brewing schedule:', error);
    res.status(500).json({ error: 'Failed to create brewing schedule' });
  }
});

// PUT update brewing schedule
router.put('/:id', validateBrewingSchedule, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      coffee_bean_id, scheduled_date, scheduled_time, brew_method,
      grind_size, water_temp, brew_time, notes, status
    } = req.body;

    const result = await db.query(`
      UPDATE brewing_schedule 
      SET coffee_bean_id = $1, scheduled_date = $2, scheduled_time = $3, brew_method = $4,
          grind_size = $5, water_temp = $6, brew_time = $7, notes = $8, status = $9,
          completed_at = CASE WHEN $9 = 'completed' AND completed_at IS NULL THEN NOW() ELSE completed_at END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [coffee_bean_id, scheduled_date, scheduled_time, brew_method, grind_size, water_temp, brew_time, notes, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brewing schedule not found' });
    }

    const updatedSchedule = await db.query(`
      SELECT bs.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM brewing_schedule bs
      JOIN coffee_beans cb ON bs.coffee_bean_id = cb.id
      WHERE bs.id = $1
    `, [id]);

    res.json(updatedSchedule.rows[0]);
  } catch (error) {
    console.error('Error updating brewing schedule:', error);
    res.status(500).json({ error: 'Failed to update brewing schedule' });
  }
});

// DELETE brewing schedule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM brewing_schedule WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Brewing schedule not found' });
    }

    res.json({ message: 'Brewing schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting brewing schedule:', error);
    res.status(500).json({ error: 'Failed to delete brewing schedule' });
  }
});

// GET upcoming brewing schedules
router.get('/upcoming/limit/:limit', async (req, res) => {
  try {
    const { limit = 5 } = req.params;
    const result = await db.query(`
      SELECT bs.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM brewing_schedule bs
      JOIN coffee_beans cb ON bs.coffee_bean_id = cb.id
      WHERE bs.scheduled_date >= CURRENT_DATE AND bs.status = 'planned'
      ORDER BY bs.scheduled_date ASC, bs.scheduled_time ASC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming brewing schedules:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming brewing schedules' });
  }
});

// GET brewing schedule statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_schedules,
        COUNT(CASE WHEN status = 'planned' THEN 1 END) as planned_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
        COUNT(CASE WHEN status = 'skipped' THEN 1 END) as skipped_count,
        COUNT(CASE WHEN scheduled_date = CURRENT_DATE THEN 1 END) as today_count
      FROM brewing_schedule
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching brewing schedule stats:', error);
    res.status(500).json({ error: 'Failed to fetch brewing schedule stats' });
  }
});

module.exports = router; 