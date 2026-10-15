const express = require('express');
const { body } = require('express-validator');
const {
  getAllVehicles,
  getAvailableVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicle.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');

const router = express.Router();

// List all vehicles (Admin)
router.get('/', authenticateToken, requireRole('ADMIN'), getAllVehicles);

// List available vehicles for booking dispatch (Admin or Customer)
router.get('/available', authenticateToken, getAvailableVehicles);

// Add vehicle (Admin)
router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  [
    body('model').trim().notEmpty().withMessage('Vehicle model is required'),
    validate
  ],
  createVehicle
);

// Update vehicle (Admin)
router.put('/:id', authenticateToken, requireRole('ADMIN'), updateVehicle);

// Safe delete vehicle (Admin)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteVehicle);

module.exports = router;
