const { pool } = require('../config/db');

/**
 * Get all customers (Admin only, supports search and pagination)
 */
async function getAllCustomers(req, res, next) {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = `
      SELECT 
        c.customer_id, c.user_id, c.name, c.name AS full_name, c.phone, c.address, c.created_at,
        u.email, u.status AS user_status,
        COUNT(b.booking_id) AS total_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' AND p.status = 'COMPLETED' THEN p.amount ELSE 0 END), 0) AS total_spent
      FROM customers c
      JOIN users u ON c.user_id = u.user_id
      LEFT JOIN bookings b ON c.customer_id = b.customer_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
    `;
    const params = [];

    if (search) {
      query += ` WHERE c.name LIKE ? OR c.phone LIKE ? OR u.email LIKE ? `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += `
      GROUP BY c.customer_id, u.user_id
      ORDER BY c.customer_id DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM customers c JOIN users u ON c.user_id = u.user_id';
    const countParams = [];
    if (search) {
      countQuery += ' WHERE c.name LIKE ? OR c.phone LIKE ? OR u.email LIKE ?';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const [countRows] = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: rows,
      total: countRows[0].total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(countRows[0].total / parseInt(limit, 10))
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single customer by ID
 */
async function getCustomerById(req, res, next) {
  try {
    const customerId = parseInt(req.params.id, 10);
    const userRole = (req.user.role || '').toUpperCase();

    // Customer can only view their own profile
    if (userRole === 'CUSTOMER' && req.user.customer_id !== customerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this profile.' });
    }

    const [rows] = await pool.query(
      `SELECT c.customer_id, c.user_id, c.name, c.name AS full_name, c.phone, c.address, c.created_at,
              u.email, u.status AS user_status,
              COUNT(b.booking_id) AS total_bookings
       FROM customers c
       JOIN users u ON c.user_id = u.user_id
       LEFT JOIN bookings b ON c.customer_id = b.customer_id
       WHERE c.customer_id = ?
       GROUP BY c.customer_id, u.user_id`,
      [customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Customer Profile
 */
async function updateCustomer(req, res, next) {
  try {
    const customerId = parseInt(req.params.id, 10);
    const { name, full_name, phone, address, status, is_active } = req.body;
    const displayName = name || full_name;
    const userRole = (req.user.role || '').toUpperCase();

    if (userRole === 'CUSTOMER' && req.user.customer_id !== customerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this profile.' });
    }

    const [customer] = await pool.query('SELECT user_id FROM customers WHERE customer_id = ?', [customerId]);
    if (customer.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query(
      'UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE customer_id = ?',
      [displayName, phone, address, customerId]
    );

    // Admin can toggle status ACTIVE / BLOCKED
    if (userRole === 'ADMIN') {
      let targetStatus = null;
      if (status) {
        targetStatus = status.toUpperCase();
      } else if (typeof is_active !== 'undefined') {
        targetStatus = is_active ? 'ACTIVE' : 'BLOCKED';
      }
      if (targetStatus) {
        await pool.query('UPDATE users SET status = ? WHERE user_id = ?', [targetStatus, customer[0].user_id]);
      }
    }

    res.json({ success: true, message: 'Customer profile updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Customer (Safe deletion: Blocks if booking history exists, offers deactivation)
 */
async function deleteCustomer(req, res, next) {
  try {
    const customerId = parseInt(req.params.id, 10);

    // Check booking history
    const [bookings] = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?',
      [customerId]
    );

    if (bookings[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete customer: Customer has ${bookings[0].count} historical bookings on record (Foreign Key RESTRICT). Please deactivate or block their account instead to maintain audit integrity.`
      });
    }

    const [customer] = await pool.query('SELECT user_id FROM customers WHERE customer_id = ?', [customerId]);
    if (customer.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await pool.query('DELETE FROM users WHERE user_id = ?', [customer[0].user_id]);

    res.json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
