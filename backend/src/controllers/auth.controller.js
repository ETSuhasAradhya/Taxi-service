const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Helper to generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      customer_id: user.customer_id || null,
      driver_id: user.driver_id || null,
      email: user.email,
      role: (user.role || '').toLowerCase()
    },
    process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production_12345',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Register a new Customer (atomic transaction)
 * POST /api/auth/register
 */
async function registerCustomer(req, res, next) {
  const { email, password, name, full_name, phone, address } = req.body;
  const displayName = full_name || name;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check existing email
    const [existingUsers] = await connection.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check existing phone
    const [existingPhones] = await connection.query(
      'SELECT customer_id FROM customers WHERE phone = ?',
      [phone]
    );
    if (existingPhones.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert into users
    const [userResult] = await connection.query(
      'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, "customer", 1)',
      [email, passwordHash]
    );
    const userId = userResult.insertId;

    // Insert into customers
    const [customerResult] = await connection.query(
      'INSERT INTO customers (user_id, full_name, phone, address) VALUES (?, ?, ?, ?)',
      [userId, displayName, phone, address || null]
    );
    const customerId = customerResult.insertId;

    await connection.commit();

    const userObj = {
      user_id: userId,
      customer_id: customerId,
      email,
      role: 'customer',
      name: displayName,
      full_name: displayName,
      phone,
      address
    };

    const token = generateToken(userObj);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Taxi Service.',
      token,
      user: userObj
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * Login (for Customer, Driver, or Admin)
 * POST /api/auth/login
 */
async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query(
      'SELECT user_id, email, password_hash, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated or blocked. Please contact administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const roleLower = (user.role || '').toLowerCase();
    const responseUser = {
      user_id: user.user_id,
      email: user.email,
      role: roleLower
    };

    // Attach role profile info
    if (roleLower === 'customer') {
      const [customers] = await pool.query(
        'SELECT customer_id, full_name, phone, address FROM customers WHERE user_id = ?',
        [user.user_id]
      );
      if (customers.length > 0) {
        responseUser.customer_id = customers[0].customer_id;
        responseUser.name = customers[0].full_name;
        responseUser.full_name = customers[0].full_name;
        responseUser.phone = customers[0].phone;
        responseUser.address = customers[0].address;
      }
    } else if (roleLower === 'driver') {
      const [drivers] = await pool.query(
        'SELECT driver_id, full_name, phone, license_number, status FROM drivers WHERE user_id = ?',
        [user.user_id]
      );
      if (drivers.length > 0) {
        responseUser.driver_id = drivers[0].driver_id;
        responseUser.name = drivers[0].full_name;
        responseUser.full_name = drivers[0].full_name;
        responseUser.phone = drivers[0].phone;
        responseUser.license_number = drivers[0].license_number;
        responseUser.status = drivers[0].status;
        responseUser.availability_status = drivers[0].status;
        responseUser.driver_status = drivers[0].status;
      }
    } else if (roleLower === 'admin') {
      responseUser.name = 'System Administrator';
      responseUser.full_name = 'System Administrator';
    }

    const token = generateToken(responseUser);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: responseUser
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerCustomer,
  login,
  getMe
};
