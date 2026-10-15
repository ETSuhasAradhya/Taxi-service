const express = require('express');
const { body } = require('express-validator');
const {
  getAllFareRates,
  getLocations,
  estimateFare,
  updateFareRate
} = require('../controllers/fareRate.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Public: get fare rates
router.get('/', getAllFareRates);

// Public: get predefined location list
router.get('/locations', getLocations);

// Public/Customer: estimate fare
router.post(
  '/estimate',
  [
    body('vehicle_type').notEmpty().withMessage('Vehicle type is required'),
    body('pickup_location').trim().notEmpty().withMessage('Pickup location is required'),
    validate
  ],
  estimateFare
);

// Admin: update rate
router.put('/:id', authenticateToken, requireRole('ADMIN'), updateFareRate);

module.exports = router;
