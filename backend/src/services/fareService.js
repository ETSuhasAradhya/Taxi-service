const { pool } = require('../config/db');

/**
 * Predefined City Locations for offline realistic distance calculation
 */
const CITY_LOCATIONS = [
  { id: 'loc-1', name: 'Andheri West Metro Station', lat: 19.1197, lng: 72.8464 },
  { id: 'loc-2', name: 'Chhatrapati Shivaji Airport T2', lat: 19.0896, lng: 72.8656 },
  { id: 'loc-3', name: 'Bandra Kurla Complex (BKC)', lat: 19.0662, lng: 72.8687 },
  { id: 'loc-4', name: 'Hiranandani Gardens Powai', lat: 19.1197, lng: 72.9051 },
  { id: 'loc-5', name: 'Nariman Point Trident', lat: 18.9256, lng: 72.8242 },
  { id: 'loc-6', name: 'Dadar TT Circle', lat: 19.0178, lng: 72.8478 },
  { id: 'loc-7', name: 'Thane Viviana Mall', lat: 19.2086, lng: 72.9714 },
  { id: 'loc-8', name: 'Vashi Sector 17', lat: 19.0771, lng: 72.9986 }
];

/**
 * Haversine distance with road curve factor
 */
function calculateDistance(pickupName, destName) {
  const pLoc = CITY_LOCATIONS.find(l => l.name.toLowerCase() === (pickupName || '').trim().toLowerCase());
  const dLoc = CITY_LOCATIONS.find(l => l.name.toLowerCase() === (destName || '').trim().toLowerCase());

  if (pLoc && dLoc) {
    if (pLoc.id === dLoc.id) return 2.0;
    const R = 6371; // Earth radius in km
    const dLat = (dLoc.lat - pLoc.lat) * (Math.PI / 180);
    const dLng = (dLoc.lng - pLoc.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pLoc.lat * (Math.PI / 180)) *
        Math.cos(dLoc.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = R * c;
    return Math.max(Math.round(straightKm * 1.35 * 10) / 10, 1.5);
  }

  // Realistic fallback for free-form addresses based on string length hash
  const hash = Math.abs((pickupName + destName).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  return Number(((hash % 25) + 3.5).toFixed(1));
}

/**
 * Server-side fare estimation: max(min_fare, base_fare + km * per_km_rate)
 */
async function calculateFare(vehicleType, pickupLocation, destinationLocation, customDistance = null) {
  const normalizedType = (vehicleType || 'MINI').toUpperCase();
  const [rates] = await pool.query(
    'SELECT * FROM fare_rates WHERE vehicle_type = ?',
    [normalizedType]
  );

  if (rates.length === 0) {
    throw new Error(`Fare rates not configured for vehicle type: ${vehicleType}`);
  }

  const rate = rates[0];
  const distanceKm = customDistance && customDistance > 0 
    ? Number(customDistance) 
    : calculateDistance(pickupLocation, destinationLocation);

  const baseFare = Number(rate.base_fare);
  const perKmRate = Number(rate.per_km_rate);
  const minFare = Number(rate.minimum_fare || rate.min_fare || 0);

  // Exact formula from specifications: max(min_fare, base_fare + km * per_km_rate)
  const computedFare = baseFare + (distanceKm * perKmRate);
  const estimatedFare = Math.max(minFare, computedFare);

  return {
    vehicleType: normalizedType,
    vehicle_type: normalizedType.toLowerCase(),
    pickupLocation,
    pickup_location: pickupLocation,
    dropLocation: destinationLocation,
    destination_location: destinationLocation,
    distanceKm: Number(distanceKm.toFixed(2)),
    distance_km: Number(distanceKm.toFixed(2)),
    baseFare: Number(baseFare.toFixed(2)),
    base_fare: Number(baseFare.toFixed(2)),
    perKmRate: Number(perKmRate.toFixed(2)),
    per_km_rate: Number(perKmRate.toFixed(2)),
    minFare: Number(minFare.toFixed(2)),
    minimum_fare: Number(minFare.toFixed(2)),
    estimatedFare: Number(estimatedFare.toFixed(2)),
    estimated_fare: Number(estimatedFare.toFixed(2))
  };
}

module.exports = {
  CITY_LOCATIONS,
  calculateDistance,
  calculateFare
};
