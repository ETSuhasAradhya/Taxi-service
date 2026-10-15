const express = require('express');
const { body } = require('express-validator');
const {
  createReview,
  getAllReviews,
  getDriverReviews
} = require('../controllers/review.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Customer creates review for completed trip
router.post(
  '/',
  authenticateToken,
  requireRole('CUSTOMER'),
  [
    body('booking_id').isInt().withMessage('Valid booking ID required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5 stars'),
    body('comment').optional().trim(),
    validate
  ],
  createReview
);

// Admin lists all reviews
router.get('/', authenticateToken, requireRole('ADMIN'), getAllReviews);

// Driver views their received reviews
router.get('/driver', authenticateToken, requireRole('DRIVER'), getDriverReviews);

module.exports = router;
