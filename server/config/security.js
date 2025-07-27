// Security Configuration
const securityConfig = {
  // JWT Configuration
  jwt: {
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'
  },

  // Password Configuration
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    saltRounds: 14
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    authMax: 5, // limit each IP to 5 auth requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    authMessage: 'Too many authentication attempts, please try again later.'
  },

  // CORS Configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'http://localhost:3000']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
  },

  // Request Size Limits
  requestLimits: {
    json: '10mb',
    urlencoded: '10mb'
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
    xssFilter: true,
    hidePoweredBy: true
  },

  // Account Lockout Configuration
  accountLockout: {
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    resetAfterSuccess: true
  },

  // Session Configuration
  session: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  },

  // Audit Logging
  audit: {
    enabled: true,
    retentionDays: 90,
    logLevel: process.env.AUDIT_LOG_LEVEL || 'info'
  },

  // Database Security
  database: {
    connectionLimit: 20,
    idleTimeout: 30000,
    connectionTimeout: 2000,
    ssl: process.env.NODE_ENV === 'production'
  },

  // Environment-specific settings
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test'
  }
};

// Validation functions
const validatePassword = (password) => {
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = securityConfig.password;
  
  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long` };
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (requireSpecialChars && !/[@$!%*?&]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
  }
  
  return { valid: true };
};

// Security utility functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

const generateSecureToken = (length = 32) => {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
};

const hashPassword = async (password) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, securityConfig.password.saltRounds);
};

const comparePassword = async (password, hash) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hash);
};

module.exports = {
  securityConfig,
  validatePassword,
  sanitizeInput,
  generateSecureToken,
  hashPassword,
  comparePassword
}; 