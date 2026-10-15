const express = require('express');
const {
  getAdminDashboardStats,
  getCustomerDashboardStats,
  getDriverDashboardStats
} = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Admin stats
router.get('/admin', authenticateToken, requireRole('admin'), getAdminDashboardStats);

// Customer stats
router.get('/customer', authenticateToken, requireRole('customer'), getCustomerDashboardStats);

// Driver stats
router.get('/driver', authenticateToken, requireRole('driver'), getDriverDashboardStats);

module.exports = router;
