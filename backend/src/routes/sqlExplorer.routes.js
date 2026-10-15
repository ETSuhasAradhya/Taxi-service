const express = require('express');
const {
  getSqlQueries,
  getSqlQueryById
} = require('../controllers/sqlExplorer.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Admin only: list all queries with search and category filtering
router.get('/', authenticateToken, requireRole('ADMIN'), getSqlQueries);
router.get('/queries', authenticateToken, requireRole('ADMIN'), getSqlQueries);

// Admin only: get query detail by ID
router.get('/:id', authenticateToken, requireRole('ADMIN'), getSqlQueryById);
router.get('/queries/:id', authenticateToken, requireRole('ADMIN'), getSqlQueryById);

module.exports = router;
