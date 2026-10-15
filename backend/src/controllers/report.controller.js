const { pool } = require('../config/db');

/**
 * Live Report: Revenue by Month
 * GET /api/reports/revenue-by-month
 */
async function getRevenueByMonth(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(b.booking_time, '%Y-%m') AS month,
        COUNT(b.booking_id) AS total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS gross_revenue,
        COALESCE(SUM(CASE WHEN p.payment_status = 'paid' THEN p.amount ELSE 0 END), 0) AS collected_revenue
      FROM bookings b
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      GROUP BY DATE_FORMAT(b.booking_time, '%Y-%m')
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      reportType: 'Live Report',
      relatedQueryId: 'report-monthly-revenue',
      title: 'Monthly Revenue Summary',
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Live Report: Bookings by Status
 * GET /api/reports/bookings-by-status
 */
async function getBookingsByStatus(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        status, 
        COUNT(*) AS booking_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings), 1) AS percentage_of_total,
        COALESCE(SUM(estimated_fare), 0) AS total_estimated_value
      FROM bookings
      GROUP BY status
      ORDER BY booking_count DESC
    `);

    res.json({
      success: true,
      reportType: 'Live Report',
      relatedQueryId: 'report-bookings-by-status',
      title: 'Bookings by Lifecycle Status',
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Live Report: Top Customers by Spend
 * GET /api/reports/top-customers
 */
async function getTopCustomers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const [rows] = await pool.query(`
      SELECT 
        c.customer_id, 
        c.full_name AS customer_name, 
        c.phone, 
        COUNT(b.booking_id) AS total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS total_spend
      FROM customers c
      JOIN bookings b ON c.customer_id = b.customer_id
      GROUP BY c.customer_id, c.full_name, c.phone
      ORDER BY total_spend DESC
      LIMIT ?
    `, [limit]);

    res.json({
      success: true,
      reportType: 'Live Report',
      relatedQueryId: 'report-top-customers',
      title: 'Top Customers by Lifetime Value',
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Live Report: Top Drivers by Trips and Ratings
 * GET /api/reports/top-drivers
 */
async function getTopDrivers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const [rows] = await pool.query(`
      SELECT 
        d.driver_id, 
        d.full_name AS driver_name, 
        d.license_number, 
        COUNT(b.booking_id) AS total_trips,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_trips, 
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS total_revenue, 
        ROUND(AVG(r.rating), 1) AS average_rating, 
        COUNT(r.review_id) AS total_reviews
      FROM drivers d
      LEFT JOIN bookings b ON d.driver_id = b.driver_id
      LEFT JOIN reviews r ON d.driver_id = r.driver_id
      GROUP BY d.driver_id, d.full_name, d.license_number
      ORDER BY completed_trips DESC, average_rating DESC
      LIMIT ?
    `, [limit]);

    res.json({
      success: true,
      reportType: 'Live Report',
      relatedQueryId: 'report-top-drivers',
      title: 'Top Drivers Performance Scorecard',
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Live Reports Summary: bundles all reports for ReportsPage
 * GET /api/reports/summary
 */
async function getAllReportsSummary(req, res, next) {
  try {
    const [monthlyRev] = await pool.query(`
      SELECT 
        DATE_FORMAT(b.booking_time, '%Y-%m') AS booking_month,
        COUNT(b.booking_id) AS total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS gross_revenue,
        COALESCE(SUM(CASE WHEN p.payment_status = 'paid' THEN p.amount ELSE 0 END), 0) AS collected_revenue
      FROM bookings b
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      GROUP BY DATE_FORMAT(b.booking_time, '%Y-%m')
      ORDER BY booking_month ASC
    `);

    const [statusDist] = await pool.query(`
      SELECT 
        status, 
        COUNT(*) AS booking_count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings), 1) AS percentage_of_total,
        COALESCE(SUM(estimated_fare), 0) AS total_estimated_value
      FROM bookings 
      GROUP BY status 
      ORDER BY booking_count DESC
    `);

    const [topCust] = await pool.query(`
      SELECT 
        c.customer_id, 
        c.full_name, 
        c.phone, 
        COUNT(b.booking_id) AS total_bookings,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS total_spend
      FROM customers c 
      JOIN bookings b ON c.customer_id = b.customer_id
      GROUP BY c.customer_id, c.full_name, c.phone 
      ORDER BY total_spend DESC 
      LIMIT 5
    `);

    const [topDriv] = await pool.query(`
      SELECT 
        d.driver_id, 
        d.full_name, 
        d.phone, 
        COUNT(b.booking_id) AS completed_trips, 
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS total_revenue, 
        ROUND(AVG(r.rating), 1) AS average_rating
      FROM drivers d 
      LEFT JOIN bookings b ON d.driver_id = b.driver_id AND b.status = 'completed'
      LEFT JOIN reviews r ON d.driver_id = r.driver_id 
      GROUP BY d.driver_id, d.full_name, d.phone 
      ORDER BY completed_trips DESC 
      LIMIT 5
    `);

    const [utilization] = await pool.query(`
      SELECT 
        vehicle_type,
        COUNT(vehicle_id) AS total_vehicles,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_count,
        SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) AS in_use_count,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_count
      FROM vehicles
      GROUP BY vehicle_type
    `);

    const [cancellation] = await pool.query(`
      SELECT 
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
        ROUND(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS cancellation_rate_pct,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN estimated_fare ELSE 0 END), 0) AS lost_potential_revenue
      FROM bookings
    `);

    res.json({
      success: true,
      reportType: 'Live Report',
      data: {
        report_monthly_revenue: {
          title: 'Monthly Revenue Trends',
          catalogSlug: 'monthly-revenue-trends',
          data: monthlyRev
        },
        revenueByMonth: {
          title: 'Monthly Revenue Trends',
          relatedQueryId: 'report-monthly-revenue',
          data: monthlyRev
        },
        report_bookings_by_status: {
          title: 'Bookings by Lifecycle Status',
          catalogSlug: 'bookings-by-status',
          data: statusDist
        },
        bookingsByStatus: {
          title: 'Bookings by Lifecycle Status',
          relatedQueryId: 'report-bookings-by-status',
          data: statusDist
        },
        report_top_customers: {
          title: 'Top High-Frequency Customers',
          catalogSlug: 'top-five-customers-by-bookings',
          data: topCust
        },
        topCustomers: {
          title: 'Top High-Frequency Customers',
          relatedQueryId: 'report-top-customers',
          data: topCust
        },
        report_top_drivers: {
          title: 'Top Performing Drivers',
          catalogSlug: 'drivers-with-most-completed-rides',
          data: topDriv
        },
        topDrivers: {
          title: 'Top Performing Drivers',
          relatedQueryId: 'report-top-drivers',
          data: topDriv
        },
        report_vehicle_utilization: {
          title: 'Fleet Category Utilization',
          catalogSlug: 'available-vehicles-list',
          data: utilization
        },
        report_cancellation_rate: {
          title: 'Cancellation Rate Analysis',
          catalogSlug: 'cancellation-rate-analysis',
          data: cancellation
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRevenueByMonth,
  getBookingsByStatus,
  getTopCustomers,
  getTopDrivers,
  getAllReportsSummary
};
