const express = require('express');
const {
  getAllPayments,
  getCustomerPayments,
  markPaymentAsPaid
} = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// List all payments (Admin)
router.get('/', authenticateToken, requireRole('ADMIN'), getAllPayments);

// Customer view their own payments
router.get('/my-payments', authenticateToken, requireRole('CUSTOMER'), getCustomerPayments);

// Mark payment as paid (Admin or Driver)
router.put('/:id/pay', authenticateToken, requireRole('ADMIN', 'DRIVER'), markPaymentAsPaid);
router.patch('/:id/pay', authenticateToken, requireRole('ADMIN', 'DRIVER'), markPaymentAsPaid);

module.exports = router;
