const { pool } = require('../config/db');

/**
 * Customer creates a review for their own completed booking
 * POST /api/reviews
 */
async function createReview(req, res, next) {
  try {
    const customerId = req.user.customer_id;
    const { booking_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    // 1. Verify booking exists, belongs to this customer, and is COMPLETED
    const [bookings] = await pool.query(
      'SELECT booking_id, customer_id, driver_id, status FROM bookings WHERE booking_id = ?',
      [booking_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    if (booking.customer_id !== customerId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only review your own bookings.' });
    }

    if ((booking.status || '').toLowerCase() !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Reviews are only permitted for completed trips. Current status is '${booking.status}'.`
      });
    }

    if (!booking.driver_id) {
      return res.status(400).json({ success: false, message: 'No driver associated with this booking to review.' });
    }

    // 2. Check if a review already exists for this booking (1:1 constraint)
    const [existing] = await pool.query('SELECT review_id FROM reviews WHERE booking_id = ?', [booking_id]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A review has already been submitted for this trip.' });
    }

    // 3. Insert review
    const [result] = await pool.query(
      `INSERT INTO reviews (booking_id, customer_id, driver_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, customerId, booking.driver_id, rating, comment || null]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review submitted successfully.',
      data: {
        review_id: result.insertId,
        booking_id,
        rating,
        comment
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: List all reviews
 * GET /api/reviews
 */
async function getAllReviews(req, res, next) {
  try {
    const { rating, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = `
      SELECT 
        r.review_id, r.booking_id, r.customer_id, r.driver_id, r.rating, r.comment, r.created_at,
        c.name AS customer_name,
        d.name AS driver_name,
        b.pickup_location, b.drop_location, b.vehicle_type
      FROM reviews r
      JOIN customers c ON r.customer_id = c.customer_id
      JOIN drivers d ON r.driver_id = d.driver_id
      JOIN bookings b ON r.booking_id = b.booking_id
      WHERE 1=1
    `;
    const params = [];

    if (rating) {
      query += ` AND r.rating = ?`;
      params.push(rating);
    }

    query += ` ORDER BY r.review_id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);

    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM reviews');

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
 * Driver: View reviews and rating breakdown for own profile
 * GET /api/reviews/driver
 */
async function getDriverReviews(req, res, next) {
  try {
    const driverId = req.user.driver_id;

    const [rows] = await pool.query(`
      SELECT 
        r.review_id, r.booking_id, r.customer_id, r.driver_id, r.rating, r.comment, r.created_at,
        c.name AS customer_name,
        b.pickup_location, b.drop_location
      FROM reviews r
      JOIN customers c ON r.customer_id = c.customer_id
      JOIN bookings b ON r.booking_id = b.booking_id
      WHERE r.driver_id = ?
      ORDER BY r.review_id DESC
    `, [driverId]);

    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) AS total_reviews,
        ROUND(AVG(rating), 2) AS average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) AS low_star
      FROM reviews
      WHERE driver_id = ?
    `, [driverId]);

    res.json({
      success: true,
      data: rows,
      summary: summary[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReview,
  getAllReviews,
  getDriverReviews
};
