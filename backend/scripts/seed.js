const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

// Demo accounts password
const DEMO_PASSWORD = 'Password123!';

async function generateSampleData() {
  console.log('Generating sample data with bcrypt hashes for password:', DEMO_PASSWORD);
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

  // 1. Users & Customers & Drivers & Admin
  // 1 Admin (user_id = 1)
  // 12 Customers (user_id = 2 to 13, customer_id = 1 to 12)
  // 8 Drivers (user_id = 14 to 21, driver_id = 1 to 8)

  const users = [
    { id: 1, email: 'admin@taxiservice.com', role: 'admin', is_active: 1 },
    // Customers
    { id: 2, email: 'rahul.sharma@example.com', role: 'customer', is_active: 1 },
    { id: 3, email: 'priya.patel@example.com', role: 'customer', is_active: 1 },
    { id: 4, email: 'amit.verma@example.com', role: 'customer', is_active: 1 },
    { id: 5, email: 'sneha.reddy@example.com', role: 'customer', is_active: 1 },
    { id: 6, email: 'vikram.singh@example.com', role: 'customer', is_active: 1 },
    { id: 7, email: 'ananya.iyer@example.com', role: 'customer', is_active: 1 },
    { id: 8, email: 'rohit.gupta@example.com', role: 'customer', is_active: 1 },
    { id: 9, email: 'deepika.nair@example.com', role: 'customer', is_active: 1 },
    { id: 10, email: 'manish.joshi@example.com', role: 'customer', is_active: 1 },
    { id: 11, email: 'pooja.kumar@example.com', role: 'customer', is_active: 1 },
    { id: 12, email: 'arjun.mehta@example.com', role: 'customer', is_active: 1 }, // Never booked
    { id: 13, email: 'kavita.deshmukh@example.com', role: 'customer', is_active: 1 }, // Never booked
    // Drivers
    { id: 14, email: 'suresh.driver@example.com', role: 'driver', is_active: 1 },
    { id: 15, email: 'ramesh.driver@example.com', role: 'driver', is_active: 1 },
    { id: 16, email: 'anil.driver@example.com', role: 'driver', is_active: 1 },
    { id: 17, email: 'rajesh.driver@example.com', role: 'driver', is_active: 1 },
    { id: 18, email: 'sunil.driver@example.com', role: 'driver', is_active: 1 },
    { id: 19, email: 'vijay.driver@example.com', role: 'driver', is_active: 1 },
    { id: 20, email: 'mahesh.driver@example.com', role: 'driver', is_active: 1 },
    { id: 21, email: 'dinesh.driver@example.com', role: 'driver', is_active: 1 } // Never assigned
  ];

  const customers = [
    { id: 1, user_id: 2, name: 'Rahul Sharma', phone: '+91 98765 43210', address: '42 MG Road, Bangalore' },
    { id: 2, user_id: 3, name: 'Priya Patel', phone: '+91 98765 43211', address: '15 Indiranagar 100ft Rd, Bangalore' },
    { id: 3, user_id: 4, name: 'Amit Verma', phone: '+91 98765 43212', address: '88 Koramangala 5th Block, Bangalore' },
    { id: 4, user_id: 5, name: 'Sneha Reddy', phone: '+91 98765 43213', address: '23 HSR Layout Sector 2, Bangalore' },
    { id: 5, user_id: 6, name: 'Vikram Singh', phone: '+91 98765 43214', address: '7 Whitefield Main Road, Bangalore' },
    { id: 6, user_id: 7, name: 'Ananya Iyer', phone: '+91 98765 43215', address: '102 Jayanagar 4th Block, Bangalore' },
    { id: 7, user_id: 8, name: 'Rohit Gupta', phone: '+91 98765 43216', address: '54 Electronic City Phase 1, Bangalore' },
    { id: 8, user_id: 9, name: 'Deepika Nair', phone: '+91 98765 43217', address: '31 Malleshwaram 8th Cross, Bangalore' },
    { id: 9, user_id: 10, name: 'Manish Joshi', phone: '+91 98765 43218', address: '19 Banashankari 2nd Stage, Bangalore' },
    { id: 10, user_id: 11, name: 'Pooja Kumar', phone: '+91 98765 43219', address: '76 Bellandur Green Glen, Bangalore' },
    { id: 11, user_id: 12, name: 'Arjun Mehta', phone: '+91 98765 43220', address: '12 Kalyan Nagar Outer Ring, Bangalore' },
    { id: 12, user_id: 13, name: 'Kavita Deshmukh', phone: '+91 98765 43221', address: '9 Richmond Town Promenade, Bangalore' }
  ];

  const drivers = [
    { id: 1, user_id: 14, name: 'Suresh Kumar', phone: '+91 98111 11001', license: 'DL-04-2018-001234', expiry: '2028-05-15', status: 'available', joined: '2022-01-10' },
    { id: 2, user_id: 15, name: 'Ramesh Yadav', phone: '+91 98111 11002', license: 'DL-04-2019-002345', expiry: '2027-08-20', status: 'available', joined: '2022-03-12' },
    { id: 3, user_id: 16, name: 'Anil Gowda', phone: '+91 98111 11003', license: 'DL-04-2017-003456', expiry: '2026-11-30', status: 'on_trip', joined: '2021-06-25' },
    { id: 4, user_id: 17, name: 'Rajesh Hegde', phone: '+91 98111 11004', license: 'DL-04-2020-004567', expiry: '2029-02-14', status: 'available', joined: '2022-09-01' },
    { id: 5, user_id: 18, name: 'Sunil Rao', phone: '+91 98111 11005', license: 'DL-04-2016-005678', expiry: '2027-04-18', status: 'off_duty', joined: '2021-02-18' },
    { id: 6, user_id: 19, name: 'Vijay Shettigar', phone: '+91 98111 11006', license: 'DL-04-2021-006789', expiry: '2030-07-22', status: 'available', joined: '2023-04-10' },
    { id: 7, user_id: 20, name: 'Mahesh Patil', phone: '+91 98111 11007', license: 'DL-04-2018-007890', expiry: '2028-10-05', status: 'available', joined: '2022-11-15' },
    { id: 8, user_id: 21, name: 'Dinesh Acharya', phone: '+91 98111 11008', license: 'DL-04-2023-008901', expiry: '2033-01-10', status: 'available', joined: '2024-01-05' } // Never assigned
  ];

  const vehicles = [
    { id: 1, reg: 'KA-01-AB-1001', model: 'Maruti Suzuki WagonR', type: 'mini', seats: 4, status: 'available', driver_id: 1 },
    { id: 2, reg: 'KA-01-CD-2002', model: 'Hyundai Grand i10', type: 'mini', seats: 4, status: 'available', driver_id: 2 },
    { id: 3, reg: 'KA-02-EF-3003', model: 'Honda Amaze', type: 'sedan', seats: 4, status: 'in_use', driver_id: 3 },
    { id: 4, reg: 'KA-02-GH-4004', model: 'Maruti Suzuki Dzire', type: 'sedan', seats: 4, status: 'available', driver_id: 4 },
    { id: 5, reg: 'KA-03-IJ-5005', model: 'Hyundai Verna', type: 'sedan', seats: 4, status: 'available', driver_id: null },
    { id: 6, reg: 'KA-03-KL-6006', model: 'Toyota Innova Crysta', type: 'suv', seats: 7, status: 'available', driver_id: 5 },
    { id: 7, reg: 'KA-04-MN-7007', model: 'Mahindra XUV700', type: 'suv', seats: 7, status: 'available', driver_id: 6 },
    { id: 8, reg: 'KA-04-OP-8008', model: 'Tata Safari', type: 'suv', seats: 7, status: 'maintenance', driver_id: null },
    { id: 9, reg: 'KA-05-QR-9009', model: 'Mercedes-Benz E-Class', type: 'luxury', seats: 4, status: 'available', driver_id: 7 },
    { id: 10, reg: 'KA-05-ST-9999', model: 'BMW 5 Series', type: 'luxury', seats: 4, status: 'available', driver_id: null },
    { id: 11, reg: 'KA-05-UV-1111', model: 'Audi A6', type: 'luxury', seats: 4, status: 'available', driver_id: null }
  ];

  const fareRates = [
    { type: 'mini', base: 50.00, per_km: 12.00, per_min: 1.50, min_fare: 80.00 },
    { type: 'sedan', base: 80.00, per_km: 16.00, per_min: 2.00, min_fare: 120.00 },
    { type: 'suv', base: 120.00, per_km: 22.00, per_min: 2.50, min_fare: 180.00 },
    { type: 'luxury', base: 250.00, per_km: 38.00, per_min: 4.00, min_fare: 350.00 }
  ];

  // Locations for sample trips
  const routes = [
    { p: 'Downtown Central Station', d: 'International Airport (BLR)', km: 34.5 },
    { p: 'Cyber City Tech Park', d: 'Grand Metro Mall & Multiplex', km: 16.2 },
    { p: 'University Campus & Library', d: 'Downtown Central Station', km: 8.4 },
    { p: 'City General Hospital', d: 'Suburban Green Residency', km: 14.8 },
    { p: 'Sunrise Bay Financial District', d: 'International Airport (BLR)', km: 38.0 },
    { p: 'Grand Metro Mall & Multiplex', d: 'Cyber City Tech Park', km: 17.5 },
    { p: 'Westfield Exhibition Center', d: 'Downtown Central Station', km: 11.2 },
    { p: 'Old Town Heritage Market', d: 'University Campus & Library', km: 6.8 },
    { p: 'Suburban Green Residency', d: 'Sunrise Bay Financial District', km: 21.4 },
    { p: 'International Airport (BLR)', d: 'Cyber City Tech Park', km: 42.1 }
  ];

  // Helper for dates spread over 4 months (e.g. from 120 days ago to today)
  function getDateString(daysAgo, hour = 10, minute = 30) {
    const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }

  const vTypes = ['mini', 'sedan', 'suv', 'luxury'];
  const pMethods = ['card', 'upi', 'cash'];

  const bookings = [];
  const payments = [];
  const reviews = [];

  // Generate 65 realistic bookings
  let bookingId = 1;
  const reviewComments = [
    'Great ride! The driver was very polite and the car was clean.',
    'Punctual and smooth driving through heavy traffic.',
    'Comfortable ride, reached the airport well ahead of time.',
    'Very professional service. AC was working properly.',
    'Decent trip, reasonable fare.',
    'Excellent experience with the luxury sedan, totally worth it!',
    'Courteous driver and safe driving throughout.',
    'Quick pickup and clean interiors.',
    'Good navigation avoiding bottleneck congestion.',
    'Reliable service as always, highly recommend!'
  ];

  for (let i = 0; i < 65; i++) {
    // Distribute customers 1 to 10 (customers 11 & 12 have NO bookings)
    // Customer 1, 2, 3 have heavy booking counts (> 3)
    let custId;
    if (i < 25) {
      custId = (i % 3) + 1; // 1, 2, or 3
    } else {
      custId = ((i - 25) % 7) + 4; // 4 to 10
    }

    const route = routes[i % routes.length];
    const vType = vTypes[i % vTypes.length];
    const daysAgo = Math.floor(115 - (i * 1.7)); // spread over 115 days
    const bookTime = getDateString(Math.max(daysAgo, 0), 8 + (i % 12), (i * 7) % 60);

    // Fare calculation
    const rate = fareRates.find(r => r.type === vType);
    const estFare = Math.max(rate.min_fare, Math.round(rate.base + (route.km * rate.per_km) + (route.km * 2 * rate.per_min)));

    // Status distribution:
    // Recent 5: pending, assigned, accepted, in_progress, cancelled
    // Previous 60: completed (50), cancelled (10)
    let status = 'completed';
    let driverId = ((i % 7) + 1); // Drivers 1 to 7 (Driver 8 NEVER assigned)
    let vehicleId = ((i % 7) + 1);
    let pickupTime = null;
    let completedAt = null;
    let cancelReason = null;
    let finalFare = null;
    let paymentStatus = 'paid';
    let paidAt = null;

    if (i === 60) {
      status = 'pending';
      driverId = null;
      vehicleId = null;
      paymentStatus = 'pending';
    } else if (i === 61) {
      status = 'assigned';
      driverId = 1;
      vehicleId = 1;
      paymentStatus = 'pending';
    } else if (i === 62) {
      status = 'accepted';
      driverId = 2;
      vehicleId = 2;
      paymentStatus = 'pending';
    } else if (i === 63) {
      status = 'in_progress';
      driverId = 3;
      vehicleId = 3;
      pickupTime = getDateString(0, 10, 15);
      paymentStatus = 'pending';
    } else if (i % 7 === 5) {
      status = 'cancelled';
      cancelReason = i % 2 === 0 ? 'Customer changed schedule' : 'Driver delayed in heavy traffic';
      paymentStatus = 'refunded';
    } else {
      status = 'completed';
      finalFare = estFare;
      pickupTime = getDateString(daysAgo, 9, 0);
      completedAt = getDateString(daysAgo, 9, 45);
      paidAt = completedAt;
      paymentStatus = 'paid';
    }

    bookings.push({
      id: bookingId,
      customer_id: custId,
      driver_id: driverId,
      vehicle_id: vehicleId,
      vehicle_type: vType,
      pickup: route.p,
      dest: route.d,
      km: route.km,
      est_fare: estFare,
      final_fare: finalFare,
      status: status,
      book_time: bookTime,
      pickup_time: pickupTime,
      completed_at: completedAt,
      cancel_reason: cancelReason
    });

    payments.push({
      id: bookingId,
      booking_id: bookingId,
      amount: finalFare || estFare,
      method: pMethods[i % pMethods.length],
      status: paymentStatus,
      paid_at: paidAt
    });

    if (status === 'completed' && reviews.length < 25) {
      reviews.push({
        id: reviews.length + 1,
        booking_id: bookingId,
        customer_id: custId,
        driver_id: driverId,
        rating: (reviews.length % 3 === 0) ? 5 : ((reviews.length % 2 === 0) ? 4 : 5),
        comment: reviewComments[reviews.length % reviewComments.length],
        created_at: completedAt
      });
    }

    bookingId++;
  }

  // Generate SQL file content
  let sql = `-- =============================================================================
-- Taxi Service Management System - Sample Dataset
-- Populates realistic data for DBMS course project demo and viva
-- All user accounts share the demo password: ${DEMO_PASSWORD}
-- =============================================================================

USE taxi_service_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reviews;
TRUNCATE TABLE payments;
TRUNCATE TABLE bookings;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE drivers;
TRUNCATE TABLE customers;
TRUNCATE TABLE fare_rates;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. Users (${users.length} records: 1 Admin, 12 Customers, 8 Drivers)
-- -----------------------------------------------------------------------------
INSERT INTO users (user_id, email, password_hash, role, is_active, created_at) VALUES\n`;

  sql += users.map(u => 
    `  (${u.id}, '${u.email}', '${passwordHash}', '${u.role}', ${u.is_active}, '2023-10-01 00:00:00')`
  ).join(',\n') + ';\n\n';

  // 2. Customers
  sql += `-- -----------------------------------------------------------------------------
-- 2. Customers (${customers.length} records; Customers 11 & 12 never booked)
-- -----------------------------------------------------------------------------
INSERT INTO customers (customer_id, user_id, full_name, phone, address, created_at) VALUES\n`;
  sql += customers.map(c =>
    `  (${c.id}, ${c.user_id}, '${c.name}', '${c.phone}', '${c.address}', '2023-10-01 00:00:00')`
  ).join(',\n') + ';\n\n';

  // 3. Drivers
  sql += `-- -----------------------------------------------------------------------------
-- 3. Drivers (${drivers.length} records; Driver 8 was never assigned)
-- -----------------------------------------------------------------------------
INSERT INTO drivers (driver_id, user_id, full_name, phone, license_number, license_expiry, status, joined_date) VALUES\n`;
  sql += drivers.map(d =>
    `  (${d.id}, ${d.user_id}, '${d.name}', '${d.phone}', '${d.license}', '${d.expiry}', '${d.status}', '${d.joined}')`
  ).join(',\n') + ';\n\n';

  // 4. Vehicles
  sql += `-- -----------------------------------------------------------------------------
-- 4. Vehicles (${vehicles.length} records across all 4 tiers and availability statuses)
-- -----------------------------------------------------------------------------
INSERT INTO vehicles (vehicle_id, registration_number, model, vehicle_type, seats, status, driver_id) VALUES\n`;
  sql += vehicles.map(v =>
    `  (${v.id}, '${v.reg}', '${v.model}', '${v.type}', ${v.seats}, '${v.status}', ${v.driver_id || 'NULL'})`
  ).join(',\n') + ';\n\n';

  // 5. Fare Rates
  sql += `-- -----------------------------------------------------------------------------
-- 5. Fare Rates (4 vehicle tiers)
-- -----------------------------------------------------------------------------
INSERT INTO fare_rates (rate_id, vehicle_type, base_fare, per_km_rate, per_minute_rate, minimum_fare) VALUES\n`;
  sql += fareRates.map((f, idx) =>
    `  (${idx + 1}, '${f.type}', ${f.base.toFixed(2)}, ${f.per_km.toFixed(2)}, ${f.per_min.toFixed(2)}, ${f.min_fare.toFixed(2)})`
  ).join(',\n') + ';\n\n';

  // 6. Bookings
  sql += `-- -----------------------------------------------------------------------------
-- 6. Bookings (${bookings.length} records spread over 4 months with all lifecycle statuses)
-- -----------------------------------------------------------------------------
INSERT INTO bookings (booking_id, customer_id, driver_id, vehicle_id, vehicle_type, pickup_location, destination_location, distance_km, estimated_fare, final_fare, status, booking_time, pickup_time, completed_at, cancelled_reason) VALUES\n`;
  sql += bookings.map(b =>
    `  (${b.id}, ${b.customer_id}, ${b.driver_id || 'NULL'}, ${b.vehicle_id || 'NULL'}, '${b.vehicle_type}', '${b.pickup}', '${b.dest}', ${b.km.toFixed(2)}, ${b.est_fare.toFixed(2)}, ${b.final_fare ? b.final_fare.toFixed(2) : 'NULL'}, '${b.status}', '${b.book_time}', ${b.pickup_time ? `'${b.pickup_time}'` : 'NULL'}, ${b.completed_at ? `'${b.completed_at}'` : 'NULL'}, ${b.cancel_reason ? `'${b.cancel_reason}'` : 'NULL'})`
  ).join(',\n') + ';\n\n';

  // 7. Payments
  sql += `-- -----------------------------------------------------------------------------
-- 7. Payments (${payments.length} ledger rows 1:1 with bookings)
-- -----------------------------------------------------------------------------
INSERT INTO payments (payment_id, booking_id, amount, payment_method, payment_status, paid_at) VALUES\n`;
  sql += payments.map(p =>
    `  (${p.id}, ${p.booking_id}, ${p.amount.toFixed(2)}, '${p.method}', '${p.status}', ${p.paid_at ? `'${p.paid_at}'` : 'NULL'})`
  ).join(',\n') + ';\n\n';

  // 8. Reviews
  sql += `-- -----------------------------------------------------------------------------
-- 8. Reviews (${reviews.length} reviews for completed bookings with ratings 1-5)
-- -----------------------------------------------------------------------------
INSERT INTO reviews (review_id, booking_id, customer_id, driver_id, rating, comment, created_at) VALUES\n`;
  sql += reviews.map(r =>
    `  (${r.id}, ${r.booking_id}, ${r.customer_id}, ${r.driver_id}, ${r.rating}, '${r.comment}', '${r.created_at}')`
  ).join(',\n') + ';\n';

  const outputPath = path.resolve(__dirname, '../../database/sample_data.sql');
  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`✅ Sample data script saved to: ${outputPath}`);

  return { users, customers, drivers, vehicles, fareRates, bookings, payments, reviews };
}

// If executed directly via node
if (require.main === module) {
  generateSampleData()
    .then(data => {
      console.log(`Summary of generated data:`);
      console.log(`- Users: ${data.users.length}`);
      console.log(`- Customers: ${data.customers.length} (Customers 11 & 12 have 0 bookings)`);
      console.log(`- Drivers: ${data.drivers.length} (Driver 8 has 0 assignments)`);
      console.log(`- Vehicles: ${data.vehicles.length}`);
      console.log(`- Fare Rates: ${data.fareRates.length}`);
      console.log(`- Bookings: ${data.bookings.length}`);
      console.log(`- Payments: ${data.payments.length}`);
      console.log(`- Reviews: ${data.reviews.length}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Error generating sample data:', err);
      process.exit(1);
    });
}

module.exports = { generateSampleData, DEMO_PASSWORD };
