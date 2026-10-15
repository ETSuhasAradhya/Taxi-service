const express = require('express');
const { body } = require('express-validator');
const {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customer.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Admin can list all customers
router.get('/', authenticateToken, requireRole('admin'), getAllCustomers);

// Customer can view own, Admin can view any
router.get('/:id', authenticateToken, requireRole('admin', 'customer'), getCustomerById);

// Update profile
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'customer'),
  [
    body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
    body('address').optional().trim(),
    validate
  ],
  updateCustomer
);

// Admin only: safe delete
router.delete('/:id', authenticateToken, requireRole('admin'), deleteCustomer);

module.exports = router;
