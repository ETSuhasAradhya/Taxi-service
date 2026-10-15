const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Authentication Middleware
 * Validates JWT token in Authorization header and attaches user details to req.user
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production_12345'
    );

    // Verify user exists and is active in database
    const [rows] = await pool.query(
      'SELECT user_id, email, role, is_active FROM users WHERE user_id = ?',
      [decoded.user_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.'
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated or blocked. Please contact support.'
      });
    }

    const roleLower = (user.role || '').toLowerCase();
    user.role = roleLower;

    // Attach role-specific IDs (customer_id or driver_id)
    if (roleLower === 'customer') {
      const [customers] = await pool.query(
        'SELECT customer_id, full_name, phone, address FROM customers WHERE user_id = ?',
        [user.user_id]
      );
      if (customers.length > 0) {
        user.customer_id = customers[0].customer_id;
        user.name = customers[0].full_name;
        user.full_name = customers[0].full_name;
        user.phone = customers[0].phone;
        user.address = customers[0].address;
      }
    } else if (roleLower === 'driver') {
      const [drivers] = await pool.query(
        'SELECT driver_id, full_name, phone, license_number, status FROM drivers WHERE user_id = ?',
        [user.user_id]
      );
      if (drivers.length > 0) {
        user.driver_id = drivers[0].driver_id;
        user.name = drivers[0].full_name;
        user.full_name = drivers[0].full_name;
        user.phone = drivers[0].phone;
        user.license_number = drivers[0].license_number;
        user.status = drivers[0].status;
        user.availability_status = drivers[0].status;
        user.driver_status = drivers[0].status;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: error.message || 'Invalid or malformed authentication token.'
    });
  }
}

module.exports = {
  authenticateToken
};
