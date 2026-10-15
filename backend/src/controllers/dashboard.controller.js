const { pool } = require('../config/db');

/**
 * Admin Dashboard Statistics
 */
async function getAdminDashboardStats(req, res, next) {
  try {
    // 1. High-level metric counts
    const [counts] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM drivers) AS total_drivers,
        (SELECT COUNT(*) FROM vehicles) AS total_vehicles,
        (SELECT COUNT(*) FROM vehicles WHERE status = 'available') AS available_vehicles,
        (SELECT COUNT(*) FROM drivers WHERE status = 'available') AS available_drivers,
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE DATE(booking_time) = CURDATE()) AS todays_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') AS completed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') AS cancelled_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status IN ('assigned', 'accepted', 'in_progress')) AS active_bookings,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'paid') AS total_revenue
    `);

    // 2. Booking status distribution with query link
    const [statusDistribution] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM bookings
      GROUP BY status
      ORDER BY count DESC
    `);

    // 3. Monthly revenue & ride count (Past 6 months)
    const [monthlyRevenue] = await pool.query(`
      SELECT 
        DATE_FORMAT(b.booking_time, '%Y-%m') AS month,
        DATE_FORMAT(b.booking_time, '%b %Y') AS month_label,
        COUNT(b.booking_id) AS total_rides,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_rides,
        COALESCE(SUM(CASE WHEN p.payment_status = 'paid' THEN p.amount ELSE 0 END), 0) AS revenue
      FROM bookings b
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      GROUP BY month, month_label
      ORDER BY month ASC
      LIMIT 6
    `);

    // 4. Vehicle Type distribution
    const [vehicleDistribution] = await pool.query(`
      SELECT 
        b.vehicle_type,
        COUNT(b.booking_id) AS ride_count,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS revenue
      FROM bookings b
      GROUP BY b.vehicle_type
      ORDER BY ride_count DESC
    `);

    // 5. Recent 6 bookings
    const [recentBookings] = await pool.query(`
      SELECT * FROM v_booking_details
      ORDER BY booking_id DESC
      LIMIT 6
    `);

    // 6. Top drivers preview
    const [topDrivers] = await pool.query(`
      SELECT d.driver_id, d.full_name AS driver_name, COUNT(b.booking_id) AS completed_trips, ROUND(AVG(r.rating), 1) AS avg_rating
      FROM drivers d
      LEFT JOIN bookings b ON d.driver_id = b.driver_id AND b.status = 'completed'
      LEFT JOIN reviews r ON d.driver_id = r.driver_id
      GROUP BY d.driver_id, d.full_name
      ORDER BY completed_trips DESC
      LIMIT 5
    `);

    // 7. Top customers preview
    const [topCustomers] = await pool.query(`
      SELECT c.customer_id, c.full_name AS customer_name, COUNT(b.booking_id) AS completed_trips, SUM(b.final_fare) AS total_spend
      FROM customers c
      JOIN bookings b ON c.customer_id = b.customer_id
      WHERE b.status = 'completed'
      GROUP BY c.customer_id, c.full_name
      ORDER BY total_spend DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        stats: counts[0],
        total_bookings: counts[0].total_bookings,
        total_revenue: counts[0].total_revenue,
        statusDistribution,
        monthlyRevenue,
        vehicleDistribution,
        recentBookings,
        topDrivers,
        topCustomers,
        queryLinks: {
          revenue: 'report-monthly-revenue',
          topCustomers: 'report-top-customers',
          bookingsByStatus: 'report-bookings-by-status',
          topDrivers: 'report-top-drivers',
          availableVehicles: 'available-vehicles-list',
          availableDrivers: 'drivers-never-assigned'
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Customer Dashboard summary
 */
async function getCustomerDashboardStats(req, res, next) {
  try {
    const customerId = req.user.customer_id;

    // Active ride if any
    const [activeRides] = await pool.query(`
      SELECT * FROM v_booking_details
      WHERE customer_id = ? AND booking_status IN ('pending', 'assigned', 'accepted', 'in_progress')
      ORDER BY booking_id DESC
      LIMIT 1
    `, [customerId]);

    // Overall summary
    const [summary] = await pool.query(`
      SELECT 
        COUNT(b.booking_id) AS total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
        SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'completed' AND p.payment_status = 'paid' THEN p.amount ELSE 0 END), 0) AS total_spent
      FROM bookings b
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      WHERE b.customer_id = ?
    `, [customerId]);

    // Recent 5 bookings
    const [recent] = await pool.query(`
      SELECT * FROM v_booking_details
      WHERE customer_id = ?
      ORDER BY booking_id DESC
      LIMIT 5
    `, [customerId]);

    res.json({
      success: true,
      data: {
        activeBooking: activeRides.length > 0 ? activeRides[0] : null,
        summary: summary[0],
        recentBookings: recent
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Driver Dashboard summary
 */
async function getDriverDashboardStats(req, res, next) {
  try {
    const driverId = req.user.driver_id;

    // Active trip assigned to driver
    const [activeTrips] = await pool.query(`
      SELECT * FROM v_booking_details
      WHERE driver_id = ? AND booking_status IN ('assigned', 'accepted', 'in_progress')
      ORDER BY booking_id DESC
      LIMIT 1
    `, [driverId]);

    // Driver overall metrics
    const [metrics] = await pool.query(`
      SELECT 
        d.status AS driver_status,
        COUNT(b.booking_id) AS total_trips,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_trips,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS total_earnings,
        ROUND(AVG(r.rating), 1) AS average_rating
      FROM drivers d
      LEFT JOIN bookings b ON d.driver_id = b.driver_id
      LEFT JOIN reviews r ON d.driver_id = r.driver_id
      WHERE d.driver_id = ?
      GROUP BY d.driver_id
    `, [driverId]);

    // Recent completed trips
    const [recent] = await pool.query(`
      SELECT * FROM v_booking_details
      WHERE driver_id = ?
      ORDER BY booking_id DESC
      LIMIT 5
    `, [driverId]);

    res.json({
      success: true,
      data: {
        activeTrip: activeTrips.length > 0 ? activeTrips[0] : null,
        metrics: metrics[0] || {},
        recentTrips: recent
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminDashboardStats,
  getCustomerDashboardStats,
  getDriverDashboardStats
};
