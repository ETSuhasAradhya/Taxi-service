const { pool } = require('../config/db');
const {
  createBooking,
  assignDriverAndVehicle,
  driverAcceptTrip,
  driverStartTrip,
  completeTrip,
  cancelBooking
} = require('../services/bookingService');

/**
 * Customer creates a new booking
 * POST /api/bookings
 */
async function customerCreateBooking(req, res, next) {
  try {
    const { vehicle_type, pickup_location, drop_location, destination_location, payment_method, distance_km } = req.body;
    const customerId = req.user.customer_id;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer profile required to create booking.' });
    }

    const booking = await createBooking({
      customerId,
      vehicleType: vehicle_type,
      pickupLocation: pickup_location,
      dropLocation: drop_location || destination_location,
      paymentMethod: payment_method || 'CARD',
      distanceKm: distance_km
    });

    res.status(201).json({
      success: true,
      message: 'Taxi booking requested successfully!',
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Customer views their own bookings
 * GET /api/bookings/my-bookings
 */
async function getCustomerBookings(req, res, next) {
  try {
    const customerId = req.user.customer_id;
    const { status } = req.query;

    let query = `
      SELECT * FROM v_booking_details
      WHERE customer_id = ?
    `;
    const params = [customerId];

    if (status) {
      query += ` AND booking_status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY booking_id DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * Driver views assigned rides and history
 * GET /api/bookings/driver-rides
 */
async function getDriverTrips(req, res, next) {
  try {
    const driverId = req.user.driver_id;
    const { status } = req.query;

    let query = `
      SELECT * FROM v_booking_details
      WHERE driver_id = ?
    `;
    const params = [driverId];

    if (status) {
      query += ` AND booking_status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY booking_id DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * Driver updates trip status: ACCEPTED -> ONGOING/IN_PROGRESS -> COMPLETED
 * PATCH /api/bookings/:id/status
 */
async function driverUpdateStatus(req, res, next) {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const driverId = req.user.driver_id;
    const { status, final_fare } = req.body;

    const targetStatus = (status || '').toUpperCase();

    if (targetStatus === 'ACCEPTED') {
      const result = await driverAcceptTrip(bookingId, driverId);
      return res.json({
        success: true,
        message: 'Trip accepted by driver.',
        data: result
      });
    } else if (targetStatus === 'ONGOING' || targetStatus === 'IN_PROGRESS') {
      const result = await driverStartTrip(bookingId, driverId);
      return res.json({
        success: true,
        message: 'Trip is now IN_PROGRESS. Passenger picked up.',
        data: result
      });
    } else if (targetStatus === 'COMPLETED') {
      const result = await completeTrip(bookingId, driverId, final_fare);
      return res.json({
        success: true,
        message: 'Trip COMPLETED. Payment settled and driver freed.',
        data: result
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Invalid driver status update '${status}'. Driver can transition to 'ACCEPTED', 'IN_PROGRESS', or 'COMPLETED'.`
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Complete a ride (Driver, Customer, or Admin)
 * PUT /api/bookings/:id/complete
 */
async function completeRide(req, res, next) {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const role = (req.user.role || '').toUpperCase();
    const driverId = role === 'DRIVER' ? req.user.driver_id : null;
    const customerId = role === 'CUSTOMER' ? req.user.customer_id : null;
    const { final_fare } = req.body;

    const result = await completeTrip(bookingId, driverId, final_fare, customerId);
    return res.json({
      success: true,
      message: 'Trip COMPLETED successfully. Payment settled.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin assigns driver and vehicle to a booking
 * POST /api/bookings/:id/assign
 */
async function adminAssign(req, res, next) {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { driver_id, vehicle_id } = req.body;

    if (!driver_id || !vehicle_id) {
      return res.status(400).json({
        success: false,
        message: 'Both driver_id and vehicle_id are required to assign a booking.'
      });
    }

    const result = await assignDriverAndVehicle(bookingId, parseInt(driver_id, 10), parseInt(vehicle_id, 10));
    res.json({
      success: true,
      message: 'Driver and vehicle assigned successfully. Trip is CONFIRMED.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel a booking (Customer or Admin)
 * POST /api/bookings/:id/cancel
 */
async function cancelRide(req, res, next) {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { reason } = req.body;
    const isAdmin = (req.user.role || '').toUpperCase() === 'ADMIN';

    const result = await cancelBooking(
      bookingId,
      req.user.user_id,
      reason || 'Cancelled by user',
      isAdmin
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin lists all bookings with optional filters
 * GET /api/bookings
 */
async function getAllBookings(req, res, next) {
  try {
    const { status, vehicle_type, search } = req.query;

    let query = `SELECT * FROM v_booking_details WHERE 1=1`;
    const params = [];

    if (status) {
      query += ` AND booking_status = ?`;
      params.push(status.toUpperCase());
    }

    if (vehicle_type) {
      query += ` AND vehicle_type = ?`;
      params.push(vehicle_type.toUpperCase());
    }

    if (search) {
      query += ` AND (customer_name LIKE ? OR driver_name LIKE ? OR pickup_location LIKE ? OR drop_location LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY booking_id DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single booking details by ID
 * GET /api/bookings/:id
 */
async function getBookingById(req, res, next) {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const [rows] = await pool.query('SELECT * FROM v_booking_details WHERE booking_id = ?', [bookingId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = rows[0];
    const userRole = (req.user.role || '').toUpperCase();

    // Ownership check
    if (userRole === 'CUSTOMER' && booking.customer_id !== req.user.customer_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot view another rider booking.' });
    }
    if (userRole === 'DRIVER' && booking.driver_id !== req.user.driver_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You cannot view another driver ride.' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  customerCreateBooking,
  getCustomerBookings,
  getDriverTrips,
  driverUpdateStatus,
  completeRide,
  adminAssign,
  cancelRide,
  getAllBookings,
  getBookingById
};
