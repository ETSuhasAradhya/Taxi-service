const express = require('express');
const { body } = require('express-validator');
const {
  customerCreateBooking,
  getCustomerBookings,
  getDriverTrips,
  driverUpdateStatus,
  completeRide,
  adminAssign,
  cancelRide,
  getAllBookings,
  getBookingById
} = require('../controllers/booking.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Customer: Create booking
router.post(
  '/',
  authenticateToken,
  requireRole('CUSTOMER'),
  [
    body('vehicle_type').notEmpty().withMessage('Valid vehicle type is required'),
    body('pickup_location').trim().notEmpty().withMessage('Pickup location is required'),
    body('payment_method').optional().isIn(['CASH', 'CARD', 'UPI', 'cash', 'card', 'upi']).withMessage('Payment method must be CASH, CARD, or UPI'),
    validate
  ],
  customerCreateBooking
);

// Customer: View own bookings
router.get('/my-bookings', authenticateToken, requireRole('CUSTOMER'), getCustomerBookings);

// Driver: View assigned / active / completed rides
router.get('/driver-rides', authenticateToken, requireRole('DRIVER'), getDriverTrips);
router.get('/driver-trips', authenticateToken, requireRole('DRIVER'), getDriverTrips);

// Driver: Update trip status ACCEPTED -> IN_PROGRESS -> COMPLETED
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('DRIVER'),
  driverUpdateStatus
);

// Convenient aliases for driver actions
router.put('/:id/accept', authenticateToken, requireRole('DRIVER'), (req, res, next) => {
  req.body.status = 'ACCEPTED';
  return driverUpdateStatus(req, res, next);
});
router.post('/:id/accept', authenticateToken, requireRole('DRIVER'), (req, res, next) => {
  req.body.status = 'ACCEPTED';
  return driverUpdateStatus(req, res, next);
});

router.put('/:id/start', authenticateToken, requireRole('DRIVER'), (req, res, next) => {
  req.body.status = 'IN_PROGRESS';
  return driverUpdateStatus(req, res, next);
});
router.post('/:id/start', authenticateToken, requireRole('DRIVER'), (req, res, next) => {
  req.body.status = 'IN_PROGRESS';
  return driverUpdateStatus(req, res, next);
});

// Trip Completion (Customer, Driver, or Admin)
router.put('/:id/complete', authenticateToken, completeRide);
router.post('/:id/complete', authenticateToken, completeRide);

// Admin: Assign driver and vehicle
router.post(
  '/:id/assign',
  authenticateToken,
  requireRole('ADMIN'),
  [
    body('driver_id').isInt().withMessage('Valid driver ID is required'),
    body('vehicle_id').isInt().withMessage('Valid vehicle ID is required'),
    validate
  ],
  adminAssign
);
router.put(
  '/:id/assign',
  authenticateToken,
  requireRole('ADMIN'),
  [
    body('driver_id').isInt().withMessage('Valid driver ID is required'),
    body('vehicle_id').isInt().withMessage('Valid vehicle ID is required'),
    validate
  ],
  adminAssign
);

// Customer or Admin: Cancel ride
router.post('/:id/cancel', authenticateToken, cancelRide);
router.put('/:id/cancel', authenticateToken, cancelRide);

// Admin: List all bookings
router.get('/', authenticateToken, requireRole('ADMIN'), getAllBookings);

// View single booking details
router.get('/:id', authenticateToken, getBookingById);

module.exports = router;
