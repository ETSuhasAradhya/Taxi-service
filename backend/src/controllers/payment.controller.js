const { pool } = require('../config/db');

/**
 * List all payments (Admin only, supports filters and pagination)
 */
async function getAllPayments(req, res, next) {
  try {
    const { status, method, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = `
      SELECT 
        p.payment_id, p.booking_id, p.amount, p.method, p.method AS payment_method,
        p.status, p.status AS payment_status, p.paid_at,
        b.pickup_location, b.drop_location, b.status AS booking_status, b.distance_km, b.booking_time,
        c.customer_id, c.name AS customer_name, c.name AS full_name, c.phone AS customer_phone,
        d.driver_id, d.name AS driver_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.booking_id
      JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN drivers d ON b.driver_id = d.driver_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status.toUpperCase());
    }
    if (method) {
      query += ` AND p.method = ?`;
      params.push(method.toUpperCase());
    }
    if (search) {
      query += ` AND (c.name LIKE ? OR d.name LIKE ? OR b.pickup_location LIKE ? OR b.drop_location LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY p.payment_id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);

    let countQuery = `
      SELECT COUNT(*) as total 
      FROM payments p
      JOIN bookings b ON p.booking_id = b.booking_id
      JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN drivers d ON b.driver_id = d.driver_id
      WHERE 1=1
    `;
    const countParams = [];
    if (status) {
      countQuery += ` AND p.status = ?`;
      countParams.push(status.toUpperCase());
    }
    if (method) {
      countQuery += ` AND p.method = ?`;
      countParams.push(method.toUpperCase());
    }
    if (search) {
      countQuery += ` AND (c.name LIKE ? OR d.name LIKE ? OR b.pickup_location LIKE ? OR b.drop_location LIKE ?)`;
      const term = `%${search}%`;
      countParams.push(term, term, term, term);
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
 * Customer views their own payments
 */
async function getCustomerPayments(req, res, next) {
  try {
    const customerId = req.user.customer_id;

    const [rows] = await pool.query(`
      SELECT p.payment_id, p.booking_id, p.amount, p.method, p.method AS payment_method,
             p.status, p.status AS payment_status, p.paid_at,
             b.pickup_location, b.drop_location, b.status AS booking_status, b.booking_time
      FROM payments p
      JOIN bookings b ON p.booking_id = b.booking_id
      WHERE b.customer_id = ?
      ORDER BY p.payment_id DESC
    `, [customerId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * Confirm payment received
 */
async function markPaymentAsPaid(req, res, next) {
  try {
    const paymentId = parseInt(req.params.id, 10);

    const [payments] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    await pool.query(
      "UPDATE payments SET status = 'COMPLETED', paid_at = NOW() WHERE payment_id = ?",
      [paymentId]
    );

    res.json({ success: true, message: 'Payment marked as COMPLETED successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllPayments,
  getCustomerPayments,
  markPaymentAsPaid
};
