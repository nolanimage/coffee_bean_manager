const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { 
  authenticateToken, 
  generateAccessToken, 
  generateRefreshToken,
  refreshToken: refreshTokenHandler,
  JWT_SECRET 
} = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('first_name').optional().isLength({ min: 1 }).withMessage('First name is required'),
  body('last_name').optional().isLength({ min: 1 }).withMessage('Last name is required'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validatePasswordReset = [
  body('email').isEmail().withMessage('Valid email is required')
];

const validatePasswordResetConfirm = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// POST /api/auth/register
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, first_name, last_name, username } = req.body;

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    // Hash password with higher salt rounds for better security
    const saltRounds = 14;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with active status
    const result = await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, username, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, email, first_name, last_name, username, created_at
    `, [email, passwordHash, first_name, last_name, username]);

    const user = result.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Log successful registration
    console.log(`New user registered: ${user.email} at ${new Date().toISOString()}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      },
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      // Log failed login attempt
      console.log(`Failed login attempt for email: ${email} at ${new Date().toISOString()}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Log successful login
    console.log(`User logged in: ${user.email} at ${new Date().toISOString()}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      },
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', refreshTokenHandler);

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more advanced implementation, you could blacklist the refresh token
    // For now, we'll just return a success message
    console.log(`User logged out: ${req.user.email} at ${new Date().toISOString()}`);
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', validatePasswordReset, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user exists
    const userResult = await db.query('SELECT id, email, first_name FROM users WHERE email = $1 AND is_active = true', [email]);
    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await db.query(`
      UPDATE users 
      SET reset_token = $1, reset_token_expiry = $2 
      WHERE id = $3
    `, [resetTokenHash, resetTokenExpiry, user.id]);

    // Log password reset request
    console.log(`Password reset requested for: ${user.email} at ${new Date().toISOString()}`);

    // In a real application, you would send an email here
    // For now, we'll return the token in the response for testing
    res.json({ 
      message: 'Password reset link sent to your email',
      resetToken: resetToken, // Remove this in production
      resetUrl: `/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', validatePasswordResetConfirm, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Find user with valid reset token
    const userResult = await db.query(`
      SELECT id, reset_token, reset_token_expiry 
      FROM users 
      WHERE reset_token IS NOT NULL 
      AND reset_token_expiry > NOW()
      AND is_active = true
    `);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = userResult.rows[0];

    // Verify reset token
    const isValidToken = await bcrypt.compare(token, user.reset_token);
    if (!isValidToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password with higher salt rounds
    const saltRounds = 14;
    const newPasswordHash = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await db.query(`
      UPDATE users 
      SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW()
      WHERE id = $2
    `, [newPasswordHash, user.id]);

    // Log password reset
    console.log(`Password reset completed for user ID: ${user.id} at ${new Date().toISOString()}`);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        username: req.user.username
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, [
  body('first_name').optional().isLength({ min: 1 }).withMessage('First name cannot be empty'),
  body('last_name').optional().isLength({ min: 1 }).withMessage('Last name cannot be empty'),
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, username } = req.body;

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, req.user.id]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Update user profile
    const result = await db.query(`
      UPDATE users 
      SET first_name = COALESCE($1, first_name), 
          last_name = COALESCE($2, last_name), 
          username = COALESCE($3, username),
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, email, first_name, last_name, username
    `, [first_name, last_name, username, req.user.id]);

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password hash
    const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password with higher salt rounds
    const saltRounds = 14;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, req.user.id]);

    // Log password change
    console.log(`Password changed for user: ${req.user.email} at ${new Date().toISOString()}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router; 