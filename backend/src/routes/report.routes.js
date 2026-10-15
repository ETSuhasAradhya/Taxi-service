const express = require('express');
const {
  getRevenueByMonth,
  getBookingsByStatus,
  getTopCustomers,
  getTopDrivers,
  getAllReportsSummary
} = require('../controllers/report.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticateToken, requireRole('ADMIN'));

router.get('/revenue-by-month', getRevenueByMonth);
router.get('/bookings-by-status', getBookingsByStatus);
router.get('/top-customers', getTopCustomers);
router.get('/top-drivers', getTopDrivers);
router.get('/summary', getAllReportsSummary);

module.exports = router;
