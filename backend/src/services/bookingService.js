const { pool } = require('../config/db');
const { calculateFare } = require('./fareService');

/**
 * 1. Create a new Booking and initialize pending Payment ledger
 * Transaction:
 * - Insert into bookings (status = 'pending')
 * - Insert into payments (payment_status = 'pending')
 */
async function createBooking({ customerId, vehicleType, pickupLocation, dropLocation, destinationLocation, paymentMethod = 'card', distanceKm = null }) {
  const destLocation = destinationLocation || dropLocation;
  const fareDetails = await calculateFare(vehicleType, pickupLocation, destLocation, distanceKm);
  const normType = (fareDetails.vehicle_type || vehicleType || 'sedan').toLowerCase();

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings 
        (customer_id, vehicle_type, pickup_location, destination_location, distance_km, estimated_fare, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        customerId,
        normType,
        pickupLocation,
        destLocation,
        fareDetails.distance_km,
        fareDetails.estimated_fare
      ]
    );

    const bookingId = bookingResult.insertId;

    const normMethod = (paymentMethod || 'card').toLowerCase();
    await connection.query(
      `INSERT INTO payments 
        (booking_id, amount, payment_method, payment_status) 
       VALUES (?, ?, ?, 'pending')`,
      [bookingId, fareDetails.estimated_fare, normMethod]
    );

    await connection.commit();

    return {
      booking_id: bookingId,
      ...fareDetails,
      payment_method: normMethod,
      status: 'pending',
      statusUpper: 'PENDING'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 2. Assign Driver and Vehicle to a Booking (Admin only)
 * Transaction with FOR UPDATE:
 * - Verify booking is pending
 * - Verify driver is available
 * - Verify vehicle is available
 * - Verify vehicle.vehicle_type matches booking.vehicle_type
 * - Transition booking -> assigned
 * - Set driver -> on_trip, vehicle -> in_use
 */
async function assignDriverAndVehicle(bookingId, driverId, vehicleId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Lock booking row
    const [bookings] = await connection.query(
      'SELECT booking_id, vehicle_type, status FROM bookings WHERE booking_id = ? FOR UPDATE',
      [bookingId]
    );

    if (bookings.length === 0) {
      throw new Error('Booking not found.');
    }
    const booking = bookings[0];
    const curStatus = (booking.status || '').toLowerCase();
    if (curStatus !== 'pending') {
      throw new Error(`Cannot assign driver: Booking status is '${booking.status}', must be 'pending'.`);
    }

    // 2. Lock driver row
    const [drivers] = await connection.query(
      'SELECT driver_id, full_name, status FROM drivers WHERE driver_id = ? FOR UPDATE',
      [driverId]
    );
    if (drivers.length === 0) {
      throw new Error('Driver not found.');
    }
    const driver = drivers[0];
    const driverStatus = (driver.status || '').toLowerCase();
    if (driverStatus !== 'available') {
      throw new Error(`Driver '${driver.full_name}' is currently '${driver.status}', not available.`);
    }

    // 3. Lock vehicle row
    const [vehicles] = await connection.query(
      'SELECT vehicle_id, registration_number, model, vehicle_type, status FROM vehicles WHERE vehicle_id = ? FOR UPDATE',
      [vehicleId]
    );
    if (vehicles.length === 0) {
      throw new Error('Vehicle not found.');
    }
    const vehicle = vehicles[0];
    const vehicleStatus = (vehicle.status || '').toLowerCase();
    if (vehicleStatus !== 'available') {
      throw new Error(`Vehicle '${vehicle.model}' (${vehicle.registration_number}) is currently '${vehicle.status}', not available.`);
    }

    // 4. Verify vehicle type matches requested booking vehicle type
    if (vehicle.vehicle_type.toLowerCase() !== booking.vehicle_type.toLowerCase()) {
      throw new Error(`Vehicle category mismatch: requested '${booking.vehicle_type}', but vehicle is '${vehicle.vehicle_type}'.`);
    }

    // 5. Update booking, driver, and vehicle atomically
    await connection.query(
      "UPDATE bookings SET driver_id = ?, vehicle_id = ?, status = 'assigned' WHERE booking_id = ?",
      [driverId, vehicleId, bookingId]
    );

    await connection.query(
      "UPDATE drivers SET status = 'on_trip' WHERE driver_id = ?",
      [driverId]
    );

    await connection.query(
      "UPDATE vehicles SET status = 'in_use' WHERE vehicle_id = ?",
      [vehicleId]
    );

    await connection.commit();

    return {
      booking_id: bookingId,
      driver_id: driverId,
      vehicle_id: vehicleId,
      status: 'assigned',
      statusUpper: 'CONFIRMED',
      message: 'Driver and vehicle successfully assigned and trip is assigned.'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 2.5 Driver accepts trip: assigned -> accepted
 */
async function driverAcceptTrip(bookingId, driverId) {
  const [rows] = await pool.query(
    'SELECT booking_id, driver_id, status FROM bookings WHERE booking_id = ?',
    [bookingId]
  );

  if (rows.length === 0) {
    throw new Error('Booking not found.');
  }

  const booking = rows[0];
  if (booking.driver_id !== Number(driverId)) {
    throw new Error('This booking is not assigned to your account.');
  }
  const curStatus = (booking.status || '').toLowerCase();
  if (curStatus !== 'assigned') {
    throw new Error(`Invalid state transition: Cannot accept trip from status '${booking.status}'. Must be 'assigned'.`);
  }

  await pool.query(
    "UPDATE bookings SET status = 'accepted' WHERE booking_id = ?",
    [bookingId]
  );

  return { booking_id: bookingId, status: 'accepted', statusUpper: 'ACCEPTED', message: 'Ride accepted successfully.' };
}

/**
 * 3. Driver starts trip: assigned/accepted -> in_progress
 */
async function driverStartTrip(bookingId, driverId) {
  const [rows] = await pool.query(
    'SELECT booking_id, driver_id, status FROM bookings WHERE booking_id = ?',
    [bookingId]
  );

  if (rows.length === 0) {
    throw new Error('Booking not found.');
  }

  const booking = rows[0];
  if (booking.driver_id !== Number(driverId)) {
    throw new Error('This booking is not assigned to your account.');
  }
  const curStatus = (booking.status || '').toLowerCase();
  if (curStatus !== 'assigned' && curStatus !== 'accepted' && curStatus !== 'confirmed') {
    throw new Error(`Invalid state transition: Cannot start trip from status '${booking.status}'. Must be assigned or accepted.`);
  }

  await pool.query(
    "UPDATE bookings SET status = 'in_progress', pickup_time = NOW() WHERE booking_id = ?",
    [bookingId]
  );

  return { booking_id: bookingId, status: 'in_progress', statusUpper: 'ONGOING' };
}

/**
 * 4. Driver or Customer completes trip: in_progress/accepted/assigned -> completed
 * Transaction:
 * - Update booking status to 'completed', completed_at = NOW(), final_fare
 * - Settle payment to 'paid', paid_at = NOW()
 * - Free driver to 'available'
 * - Free vehicle to 'available'
 */
async function completeTrip(bookingId, driverId = null, finalFareOverride = null, customerId = null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT booking_id, customer_id, driver_id, vehicle_id, estimated_fare, status FROM bookings WHERE booking_id = ? FOR UPDATE',
      [bookingId]
    );

    if (rows.length === 0) {
      throw new Error('Booking not found.');
    }

    const booking = rows[0];
    if (driverId && booking.driver_id !== Number(driverId)) {
      throw new Error('This booking is not assigned to your account.');
    }
    if (customerId && booking.customer_id !== Number(customerId)) {
      throw new Error('This booking does not belong to your account.');
    }
    const curStatus = (booking.status || '').toLowerCase();
    const validForCompletion = ['in_progress', 'ongoing', 'accepted', 'assigned'];
    if (!validForCompletion.includes(curStatus)) {
      throw new Error(`Invalid state transition: Cannot complete trip from status '${booking.status}'. Must be in_progress, accepted, or assigned.`);
    }

    const finalFare = finalFareOverride && Number(finalFareOverride) > 0
      ? Number(finalFareOverride)
      : Number(booking.estimated_fare);

    // Update booking
    await connection.query(
      "UPDATE bookings SET status = 'completed', final_fare = ?, completed_at = NOW() WHERE booking_id = ?",
      [finalFare, bookingId]
    );

    // Settle payment ledger
    await connection.query(
      "UPDATE payments SET payment_status = 'paid', amount = ?, paid_at = NOW() WHERE booking_id = ?",
      [finalFare, bookingId]
    );

    // Free driver
    if (booking.driver_id) {
      await connection.query(
        "UPDATE drivers SET status = 'available' WHERE driver_id = ?",
        [booking.driver_id]
      );
    }

    // Free vehicle
    if (booking.vehicle_id) {
      await connection.query(
        "UPDATE vehicles SET status = 'available' WHERE vehicle_id = ?",
        [booking.vehicle_id]
      );
    }

    await connection.commit();

    return {
      booking_id: bookingId,
      status: 'completed',
      statusUpper: 'COMPLETED',
      final_fare: finalFare,
      message: 'Trip completed successfully, payment settled, and driver/vehicle freed.'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 5. Cancel Booking (Customer or Admin)
 * Allowed ONLY if pending, assigned, or accepted
 * Transaction:
 * - If assigned/accepted, free driver and vehicle back to available
 * - Set booking status to cancelled and store cancelled_reason
 * - Set payment status to failed
 */
async function cancelBooking(bookingId, cancelledByUserId = null, cancelReason = 'Cancelled by user', isAdmin = false) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT b.booking_id, b.customer_id, b.driver_id, b.vehicle_id, b.status, c.user_id AS customer_user_id
       FROM bookings b
       JOIN customers c ON b.customer_id = c.customer_id
       WHERE b.booking_id = ? FOR UPDATE`,
      [bookingId]
    );

    if (rows.length === 0) {
      throw new Error('Booking not found.');
    }

    const booking = rows[0];

    // Ownership check: Customer can only cancel their own booking, Admin can cancel any
    if (!isAdmin && cancelledByUserId && booking.customer_user_id !== Number(cancelledByUserId)) {
      throw new Error('You do not have permission to cancel this booking.');
    }

    const curStatus = (booking.status || '').toLowerCase();
    const cancellable = ['pending', 'assigned', 'accepted', 'confirmed'];
    if (!cancellable.includes(curStatus)) {
      throw new Error(`Cannot cancel ride: Current status is '${booking.status}'. Only pending or assigned bookings can be cancelled.`);
    }

    // If assigned, free driver and vehicle
    if (booking.driver_id) {
      await connection.query(
        "UPDATE drivers SET status = 'available' WHERE driver_id = ?",
        [booking.driver_id]
      );
    }
    if (booking.vehicle_id) {
      await connection.query(
        "UPDATE vehicles SET status = 'available' WHERE vehicle_id = ?",
        [booking.vehicle_id]
      );
    }

    // Update booking
    await connection.query(
      "UPDATE bookings SET status = 'cancelled', cancelled_reason = ? WHERE booking_id = ?",
      [cancelReason || 'Cancelled by user', bookingId]
    );

    // Update payment
    await connection.query(
      "UPDATE payments SET payment_status = 'failed' WHERE booking_id = ?",
      [bookingId]
    );

    await connection.commit();

    return {
      booking_id: bookingId,
      status: 'cancelled',
      statusUpper: 'CANCELLED',
      cancelled_reason: cancelReason,
      message: 'Booking cancelled successfully and any assigned resources released.'
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createBooking,
  assignDriverAndVehicle,
  driverAcceptTrip,
  driverStartTrip,
  completeTrip,
  cancelBooking
};
