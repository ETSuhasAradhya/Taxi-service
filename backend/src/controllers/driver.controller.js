const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

/**
 * Get all drivers (Admin only, supports filter by availability_status)
 */
async function getAllDrivers(req, res, next) {
  try {
    const { status, availability_status, search = '', page = 1, limit = 50 } = req.query;
    const filterStatus = availability_status || status;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = `
      SELECT 
        d.driver_id, d.user_id, d.name, d.name AS full_name, d.phone, d.license_number,
        d.availability_status, d.created_at, u.email, u.status AS user_status,
        COUNT(b.booking_id) AS total_trips,
        SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_trips,
        COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.final_fare ELSE 0 END), 0) AS total_earnings,
        ROUND(AVG(r.rating), 1) AS average_rating
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      LEFT JOIN bookings b ON d.driver_id = b.driver_id
      LEFT JOIN reviews r ON d.driver_id = r.driver_id
    `;
    const params = [];
    const conditions = [];

    if (filterStatus) {
      conditions.push('d.availability_status = ?');
      params.push(filterStatus.toUpperCase());
    }
    if (search) {
      conditions.push('(d.name LIKE ? OR d.phone LIKE ? OR d.license_number LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += `
      GROUP BY d.driver_id, u.user_id
      ORDER BY d.driver_id DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM drivers d JOIN users u ON d.user_id = u.user_id';
    const countParams = [];
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      countParams.push(...params.slice(0, -2));
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
 * Get available drivers (for dispatch assignment)
 */
async function getAvailableDrivers(req, res, next) {
  try {
    const [drivers] = await pool.query(`
      SELECT d.driver_id, d.name, d.name AS full_name, d.phone, d.license_number, d.availability_status
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.availability_status = 'AVAILABLE' AND u.status = 'ACTIVE'
      ORDER BY d.name ASC
    `);

    res.json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Driver by ID (Driver self or Admin)
 */
async function getDriverById(req, res, next) {
  try {
    const driverId = parseInt(req.params.id, 10);
    const userRole = (req.user.role || '').toUpperCase();

    if (userRole === 'DRIVER' && req.user.driver_id !== driverId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this driver profile.' });
    }

    const [rows] = await pool.query(`
      SELECT 
        d.driver_id, d.user_id, d.name, d.name AS full_name, d.phone, d.license_number,
        d.availability_status, d.created_at, u.email, u.status AS user_status,
        COUNT(b.booking_id) AS total_trips,
        SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_trips,
        COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.final_fare ELSE 0 END), 0) AS total_earnings,
        ROUND(AVG(r.rating), 1) AS average_rating
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      LEFT JOIN bookings b ON d.driver_id = b.driver_id
      LEFT JOIN reviews r ON d.driver_id = r.driver_id
      WHERE d.driver_id = ?
      GROUP BY d.driver_id, u.user_id
    `, [driverId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Driver Earnings & Trip Stats (for Driver self or Admin)
 * GET /api/drivers/:id/earnings
 */
async function getDriverEarnings(req, res, next) {
  try {
    const driverId = parseInt(req.params.id, 10);
    const userRole = (req.user.role || '').toUpperCase();

    if (userRole === 'DRIVER' && req.user.driver_id !== driverId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this driver earnings.' });
    }

    const [stats] = await pool.query(`
      SELECT 
        COUNT(b.booking_id) AS total_trips,
        SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_trips,
        COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.final_fare ELSE 0 END), 0) AS total_earnings,
        COALESCE(SUM(CASE WHEN b.status = 'COMPLETED' THEN b.distance_km ELSE 0 END), 0) AS total_distance_km,
        ROUND(AVG(r.rating), 1) AS average_rating
      FROM bookings b
      LEFT JOIN reviews r ON b.booking_id = r.booking_id
      WHERE b.driver_id = ?
    `, [driverId]);

    const [recentTrips] = await pool.query(`
      SELECT booking_id, pickup_location, drop_location, distance_km, final_fare, status, booking_time, completed_at
      FROM bookings
      WHERE driver_id = ? AND status = 'COMPLETED'
      ORDER BY completed_at DESC
      LIMIT 10
    `, [driverId]);

    res.json({
      success: true,
      data: {
        summary: stats[0],
        recentTrips
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add a new driver (Admin only, creates user + driver record atomically in a transaction)
 * POST /api/drivers
 */
async function createDriver(req, res, next) {
  const { email, password, name, full_name, phone, license_number } = req.body;
  const displayName = name || full_name;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingEmail] = await connection.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const [existingDriver] = await connection.query(
      'SELECT driver_id FROM drivers WHERE phone = ? OR license_number = ?',
      [phone, license_number]
    );
    if (existingDriver.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'A driver with this phone number or license number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Driver@123', salt);

    const [userRes] = await connection.query(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, "DRIVER", "ACTIVE")',
      [email, passwordHash]
    );

    const [driverRes] = await connection.query(
      `INSERT INTO drivers (user_id, name, phone, license_number, availability_status)
       VALUES (?, ?, ?, ?, 'AVAILABLE')`,
      [userRes.insertId, displayName, phone, license_number]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Driver profile created successfully.',
      data: {
        driver_id: driverRes.insertId,
        user_id: userRes.insertId,
        name: displayName,
        email,
        phone,
        license_number
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

/**
 * Update driver profile / status
 * PUT /api/drivers/:id
 */
async function updateDriver(req, res, next) {
  try {
    const driverId = parseInt(req.params.id, 10);
    const { name, full_name, phone, license_number, availability_status, status } = req.body;
    const displayName = name || full_name;
    const targetAvail = availability_status || status;
    const userRole = (req.user.role || '').toUpperCase();

    if (userRole === 'DRIVER' && req.user.driver_id !== driverId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this driver profile.' });
    }

    // Drivers can toggle AVAILABLE or OFFLINE (cannot set themselves ON_TRIP directly)
    if (userRole === 'DRIVER' && targetAvail && !['AVAILABLE', 'OFFLINE'].includes(targetAvail.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Drivers can only toggle status between AVAILABLE and OFFLINE.' });
    }

    await pool.query(
      `UPDATE drivers 
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           license_number = COALESCE(?, license_number),
           availability_status = COALESCE(?, availability_status)
       WHERE driver_id = ?`,
      [displayName, phone, license_number, targetAvail ? targetAvail.toUpperCase() : null, driverId]
    );

    res.json({ success: true, message: 'Driver updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Driver (Safe deletion: Blocks if trip history exists, offers deactivation)
 * DELETE /api/drivers/:id
 */
async function deleteDriver(req, res, next) {
  try {
    const driverId = parseInt(req.params.id, 10);

    const [trips] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE driver_id = ?', [driverId]);
    if (trips[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete driver: Driver has ${trips[0].count} historical trip assignments on record (Foreign Key RESTRICT). Please deactivate or block their account instead to maintain audit integrity.`
      });
    }

    const [driver] = await pool.query('SELECT user_id FROM drivers WHERE driver_id = ?', [driverId]);
    if (driver.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver not found.' });
    }

    await pool.query('DELETE FROM users WHERE user_id = ?', [driver[0].user_id]);

    res.json({ success: true, message: 'Driver deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDrivers,
  getAvailableDrivers,
  getDriverById,
  getDriverEarnings,
  createDriver,
  updateDriver,
  deleteDriver
};
