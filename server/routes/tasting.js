const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

// Validation middleware
const validateTastingNote = [
  body('coffee_bean_id').isInt({ min: 1 }).withMessage('Valid coffee bean ID is required'),
  body('brew_method').optional(),
  body('overall_rating').isInt({ min: 1, max: 10 }).withMessage('Overall rating must be between 1-10'),
  body('notes').optional(),
  body('tasting_date').optional().custom((value) => {
    if (!value) return true;
    // Accept both ISO8601 full format and date-only format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    return dateRegex.test(value) || isoRegex.test(value);
  }).withMessage('Invalid tasting date format'),
  body('water_temp').optional().isFloat({ min: 0 }).withMessage('Water temperature must be a positive number'),
  body('brew_time').optional().isInt({ min: 0 }).withMessage('Brew time must be a positive integer')
];

// GET all tasting notes
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM tasting_notes t
      JOIN coffee_beans cb ON t.coffee_bean_id = cb.id
      ORDER BY t.tasting_date DESC, t.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasting notes:', error);
    res.status(500).json({ error: 'Failed to fetch tasting notes' });
  }
});

// GET tasting notes by coffee bean ID
router.get('/bean/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT t.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM tasting_notes t
      JOIN coffee_beans cb ON t.coffee_bean_id = cb.id
      WHERE t.coffee_bean_id = $1
      ORDER BY t.tasting_date DESC, t.created_at DESC
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasting notes for coffee bean:', error);
    res.status(500).json({ error: 'Failed to fetch tasting notes' });
  }
});

// GET tasting notes by date range
router.get('/date-range', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const result = await db.query(`
      SELECT t.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM tasting_notes t
      JOIN coffee_beans cb ON t.coffee_bean_id = cb.id
      WHERE t.tasting_date BETWEEN $1 AND $2
      ORDER BY t.tasting_date DESC, t.created_at DESC
    `, [start_date, end_date]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasting notes by date range:', error);
    res.status(500).json({ error: 'Failed to fetch tasting notes' });
  }
});

// GET top rated tastings
router.get('/top-rated', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const result = await db.query(`
      SELECT t.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM tasting_notes t
      JOIN coffee_beans cb ON t.coffee_bean_id = cb.id
      WHERE t.overall_rating IS NOT NULL
      ORDER BY t.overall_rating DESC, t.tasting_date DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top rated tastings:', error);
    res.status(500).json({ error: 'Failed to fetch top rated tastings' });
  }
});

// GET tasting statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_tastings,
        COUNT(DISTINCT coffee_bean_id) as unique_beans,
        AVG(overall_rating) as avg_overall_rating,
        AVG(aroma_rating) as avg_aroma_rating,
        AVG(acidity_rating) as avg_acidity_rating,
        AVG(body_rating) as avg_body_rating,
        AVG(flavor_rating) as avg_flavor_rating,
        AVG(aftertaste_rating) as avg_aftertaste_rating,
        COUNT(CASE WHEN overall_rating >= 8 THEN 1 END) as excellent_count,
        COUNT(CASE WHEN overall_rating >= 6 AND overall_rating < 8 THEN 1 END) as good_count,
        COUNT(CASE WHEN overall_rating < 6 THEN 1 END) as poor_count
      FROM tasting_notes
      WHERE overall_rating IS NOT NULL
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tasting statistics:', error);
    res.status(500).json({ error: 'Failed to fetch tasting statistics' });
  }
});

// POST create new tasting note
router.post('/', validateTastingNote, async (req, res) => {
  try {
    console.log('Received tasting note data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      coffee_bean_id, brew_method, overall_rating, notes, tasting_date, water_temp, brew_time
    } = req.body;

    const result = await db.query(`
      INSERT INTO tasting_notes (coffee_bean_id, brew_method, overall_rating, notes, tasting_date, water_temp, brew_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [coffee_bean_id, brew_method, overall_rating, notes, tasting_date || new Date().toISOString().split('T')[0], water_temp, brew_time]);

    const newTasting = await db.query(`
      SELECT t.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM tasting_notes t
      JOIN coffee_beans cb ON t.coffee_bean_id = cb.id
      WHERE t.id = $1
    `, [result.rows[0].id]);

    res.status(201).json(newTasting.rows[0]);
  } catch (error) {
    console.error('Error creating tasting note:', error);
    res.status(500).json({ error: 'Failed to create tasting note' });
  }
});

// PUT update tasting note
router.put('/:id', validateTastingNote, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      coffee_bean_id, brew_method, overall_rating, notes, tasting_date, water_temp, brew_time
    } = req.body;

    const result = await db.query(`
      UPDATE tasting_notes 
      SET coffee_bean_id = $1, brew_method = $2, overall_rating = $3, notes = $4, tasting_date = $5, water_temp = $6, brew_time = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [coffee_bean_id, brew_method, overall_rating, notes, tasting_date, water_temp, brew_time, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tasting note not found' });
    }

    const updatedTasting = await db.query(`
      SELECT t.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM tasting_notes t
      JOIN coffee_beans cb ON t.coffee_bean_id = cb.id
      WHERE t.id = $1
    `, [id]);

    res.json(updatedTasting.rows[0]);
  } catch (error) {
    console.error('Error updating tasting note:', error);
    res.status(500).json({ error: 'Failed to update tasting note' });
  }
});

// DELETE tasting note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM tasting_notes WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tasting note not found' });
    }

    res.json({ message: 'Tasting note deleted successfully' });
  } catch (error) {
    console.error('Error deleting tasting note:', error);
    res.status(500).json({ error: 'Failed to delete tasting note' });
  }
});

// GET tasting note by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT t.*, cb.name as coffee_bean_name, cb.origin, cb.roast_level
      FROM tasting_notes t
      JOIN coffee_beans cb ON t.coffee_bean_id = cb.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tasting note not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tasting note:', error);
    res.status(500).json({ error: 'Failed to fetch tasting note' });
  }
});

module.exports = router; 