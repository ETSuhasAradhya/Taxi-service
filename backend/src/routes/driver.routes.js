const express = require('express');
const { body } = require('express-validator');
const {
  getAllDrivers,
  getAvailableDrivers,
  getDriverById,
  getDriverEarnings,
  createDriver,
  updateDriver,
  deleteDriver
} = require('../controllers/driver.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');

const router = express.Router();

// List all drivers (Admin)
router.get('/', authenticateToken, requireRole('ADMIN'), getAllDrivers);

// List available drivers for assignment (Admin)
router.get('/available', authenticateToken, requireRole('ADMIN'), getAvailableDrivers);

// Driver earnings and trip stats (Driver self or Admin)
router.get('/:id/earnings', authenticateToken, requireRole('ADMIN', 'DRIVER'), getDriverEarnings);

// Single driver details (Driver self or Admin)
router.get('/:id', authenticateToken, requireRole('ADMIN', 'DRIVER'), getDriverById);

// Create new driver (Admin)
router.post(
  '/',
  authenticateToken,
  requireRole('ADMIN'),
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('license_number').trim().notEmpty().withMessage('License number is required'),
    validate
  ],
  createDriver
);

// Update driver (Driver self or Admin)
router.put('/:id', authenticateToken, requireRole('ADMIN', 'DRIVER'), updateDriver);

// Safe delete driver (Admin)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteDriver);

module.exports = router;
