const { pool } = require('../config/db');

/**
 * Get all vehicles (Admin, supports filtering by status and vehicle_type)
 */
async function getAllVehicles(req, res, next) {
  try {
    const { status, vehicle_type, search = '' } = req.query;

    let query = `
      SELECT 
        v.vehicle_id, v.plate_number, v.plate_number AS registration_number,
        v.model, v.vehicle_type, v.capacity, v.capacity AS seats, v.status, v.created_at,
        COUNT(b.booking_id) AS total_trips
      FROM vehicles v
      LEFT JOIN bookings b ON v.vehicle_id = b.vehicle_id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('v.status = ?');
      params.push(status.toUpperCase());
    }
    if (vehicle_type) {
      conditions.push('v.vehicle_type = ?');
      params.push(vehicle_type.toUpperCase());
    }
    if (search) {
      conditions.push('(v.plate_number LIKE ? OR v.model LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += `
      GROUP BY v.vehicle_id
      ORDER BY v.vehicle_id DESC
    `;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * Get available vehicles (supports ?vehicle_type=)
 */
async function getAvailableVehicles(req, res, next) {
  try {
    const { vehicle_type } = req.query;
    let query = `
      SELECT v.vehicle_id, v.plate_number, v.plate_number AS registration_number,
             v.model, v.vehicle_type, v.capacity, v.status
      FROM vehicles v
      WHERE v.status = 'AVAILABLE'
    `;
    const params = [];

    if (vehicle_type) {
      query += ` AND v.vehicle_type = ?`;
      params.push(vehicle_type.toUpperCase());
    }

    query += ` ORDER BY v.vehicle_type, v.model`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * Add a new vehicle (Admin only)
 */
async function createVehicle(req, res, next) {
  try {
    const { plate_number, registration_number, model, vehicle_type, capacity, seats } = req.body;
    const finalPlate = plate_number || registration_number;
    const finalCap = capacity || seats || 4;
    const normType = (vehicle_type || 'SEDAN').toUpperCase();

    const [existing] = await pool.query('SELECT vehicle_id FROM vehicles WHERE plate_number = ?', [finalPlate]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A vehicle with this plate number already exists.' });
    }

    const [result] = await pool.query(
      `INSERT INTO vehicles (plate_number, model, vehicle_type, capacity, status)
       VALUES (?, ?, ?, ?, 'AVAILABLE')`,
      [finalPlate, model, normType, finalCap]
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle added to fleet successfully.',
      data: {
        vehicle_id: result.insertId,
        plate_number: finalPlate,
        model,
        vehicle_type: normType,
        capacity: finalCap,
        status: 'AVAILABLE'
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update vehicle (Admin only)
 */
async function updateVehicle(req, res, next) {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    const { plate_number, registration_number, model, vehicle_type, capacity, seats, status } = req.body;
    const finalPlate = plate_number || registration_number;
    const finalCap = capacity || seats;

    await pool.query(
      `UPDATE vehicles
       SET plate_number = COALESCE(?, plate_number),
           model = COALESCE(?, model),
           vehicle_type = COALESCE(?, vehicle_type),
           capacity = COALESCE(?, capacity),
           status = COALESCE(?, status)
       WHERE vehicle_id = ?`,
      [
        finalPlate,
        model,
        vehicle_type ? vehicle_type.toUpperCase() : null,
        finalCap,
        status ? status.toUpperCase() : null,
        vehicleId
      ]
    );

    res.json({ success: true, message: 'Vehicle details updated successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Vehicle (Safe deletion: Blocks if ride history exists)
 */
async function deleteVehicle(req, res, next) {
  try {
    const vehicleId = parseInt(req.params.id, 10);

    const [trips] = await pool.query('SELECT COUNT(*) as count FROM bookings WHERE vehicle_id = ?', [vehicleId]);
    if (trips[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete vehicle: Vehicle has ${trips[0].count} historical trips on record (Foreign Key RESTRICT). Please update status to MAINTENANCE instead to preserve trip records.`
      });
    }

    await pool.query('DELETE FROM vehicles WHERE vehicle_id = ?', [vehicleId]);

    res.json({ success: true, message: 'Vehicle removed from fleet successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllVehicles,
  getAvailableVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
