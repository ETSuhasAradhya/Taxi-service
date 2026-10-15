const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { registerCustomer, login, getMe } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Strict login rate limiter (e.g. 20 login attempts per 15 minutes window)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/auth/register
 * @desc    Customer self-registration
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    validate
  ],
  registerCustomer
);

/**
 * @route   POST /api/auth/login
 * @desc    Login for customer, driver, or admin
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private (JWT required)
 */
router.get('/me', authenticateToken, getMe);

module.exports = router;
