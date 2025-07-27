const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Generate access token
const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Generate refresh token
const generateRefreshToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'MISSING_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify token type
    if (decoded.type !== 'access') {
      return res.status(403).json({ 
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Verify user still exists in database and is active
    const result = await db.query(
      'SELECT id, email, first_name, last_name, username, is_active FROM users WHERE id = $1 AND is_active = true', 
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user info to request
    req.user = result.rows[0];
    req.token = decoded;
    
    // Log successful authentication
    console.log(`User ${req.user.email} authenticated successfully at ${new Date().toISOString()}`);
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(403).json({ 
      error: 'Token verification failed',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'access') {
      req.user = null;
      return next();
    }
    
    const result = await db.query(
      'SELECT id, email, first_name, last_name, username, is_active FROM users WHERE id = $1 AND is_active = true', 
      [decoded.userId]
    );
    
    if (result.rows.length > 0) {
      req.user = result.rows[0];
      req.token = decoded;
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }
  
  next();
};

// Refresh token middleware
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ 
      error: 'Refresh token required',
      code: 'MISSING_REFRESH_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(403).json({ 
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    // Verify user still exists and is active
    const result = await db.query(
      'SELECT id, email, is_active FROM users WHERE id = $1 AND is_active = true', 
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found or inactive',
        code: 'USER_NOT_FOUND'
      });
    }

    const user = result.rows[0];
    
    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id, user.email);
    const newRefreshToken = generateRefreshToken(user.id, user.email);
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }
    
    // For now, all authenticated users have access
    // You can implement role-based access control here
    // if (!roles.includes(req.user.role)) {
    //   return res.status(403).json({ 
    //     error: 'Insufficient permissions',
    //     code: 'INSUFFICIENT_PERMISSIONS'
    //   });
    // }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  refreshToken,
  requireRole,
  generateAccessToken,
  generateRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
}; 