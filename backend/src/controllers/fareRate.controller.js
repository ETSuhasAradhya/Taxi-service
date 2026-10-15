const { pool } = require('../config/db');
const { calculateFare, CITY_LOCATIONS } = require('../services/fareService');

/**
 * Get all fare rates
 * GET /api/fare-rates
 */
async function getAllFareRates(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM fare_rates ORDER BY base_fare ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

/**
 * Get city locations list
 * GET /api/fare-rates/locations
 */
function getLocations(req, res) {
  res.json({ success: true, data: CITY_LOCATIONS });
}

/**
 * Estimate fare endpoint: max(min_fare, base_fare + km*per_km_rate)
 * POST /api/fare-rates/estimate
 */
async function estimateFare(req, res, next) {
  try {
    const { vehicle_type, pickup_location, drop_location, destination_location, distance_km } = req.body;

    const result = await calculateFare(
      vehicle_type,
      pickup_location,
      drop_location || destination_location,
      distance_km
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * Update fare rate for a vehicle type (Admin only)
 * PUT /api/fare-rates/:id
 */
async function updateFareRate(req, res, next) {
  try {
    const rateId = parseInt(req.params.id, 10);
    const { base_fare, per_km_rate, min_fare, minimum_fare } = req.body;
    const finalMinFare = min_fare || minimum_fare;

    await pool.query(
      `UPDATE fare_rates
       SET base_fare = COALESCE(?, base_fare),
           per_km_rate = COALESCE(?, per_km_rate),
           min_fare = COALESCE(?, min_fare)
       WHERE rate_id = ?`,
      [base_fare, per_km_rate, finalMinFare, rateId]
    );

    res.json({ success: true, message: 'Fare rates updated successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllFareRates,
  getLocations,
  estimateFare,
  updateFareRate
};
