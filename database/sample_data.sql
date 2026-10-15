-- =============================================================================
-- Taxi Service Management System - Sample Dataset
-- Populates realistic data for DBMS course project demo and viva
-- All user accounts share the demo password: Password123!
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
-- 1. Users (21 records: 1 Admin, 12 Customers, 8 Drivers)
-- -----------------------------------------------------------------------------
INSERT INTO users (user_id, email, password_hash, role, is_active, created_at) VALUES
  (1, 'admin@taxiservice.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'admin', 1, '2023-10-01 00:00:00'),
  (2, 'rahul.sharma@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (3, 'priya.patel@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (4, 'amit.verma@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (5, 'sneha.reddy@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (6, 'vikram.singh@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (7, 'ananya.iyer@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (8, 'rohit.gupta@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (9, 'deepika.nair@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (10, 'manish.joshi@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (11, 'pooja.kumar@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (12, 'arjun.mehta@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (13, 'kavita.deshmukh@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'customer', 1, '2023-10-01 00:00:00'),
  (14, 'suresh.driver@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'driver', 1, '2023-10-01 00:00:00'),
  (15, 'ramesh.driver@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'driver', 1, '2023-10-01 00:00:00'),
  (16, 'anil.driver@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'driver', 1, '2023-10-01 00:00:00'),
  (17, 'rajesh.driver@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'driver', 1, '2023-10-01 00:00:00'),
  (18, 'sunil.driver@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'driver', 1, '2023-10-01 00:00:00'),
  (19, 'vijay.driver@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'driver', 1, '2023-10-01 00:00:00'),
  (20, 'mahesh.driver@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'driver', 1, '2023-10-01 00:00:00'),
  (21, 'dinesh.driver@example.com', '$2a$10$TNEeeb84pATkvi0J8ppBUOwBQJS0LnJPWTsXWw37zQhLBZWHX3jv2', 'driver', 1, '2023-10-01 00:00:00');

-- -----------------------------------------------------------------------------
-- 2. Customers (12 records; Customers 11 & 12 never booked)
-- -----------------------------------------------------------------------------
INSERT INTO customers (customer_id, user_id, full_name, phone, address, created_at) VALUES
  (1, 2, 'Rahul Sharma', '+91 98765 43210', '42 MG Road, Bangalore', '2023-10-01 00:00:00'),
  (2, 3, 'Priya Patel', '+91 98765 43211', '15 Indiranagar 100ft Rd, Bangalore', '2023-10-01 00:00:00'),
  (3, 4, 'Amit Verma', '+91 98765 43212', '88 Koramangala 5th Block, Bangalore', '2023-10-01 00:00:00'),
  (4, 5, 'Sneha Reddy', '+91 98765 43213', '23 HSR Layout Sector 2, Bangalore', '2023-10-01 00:00:00'),
  (5, 6, 'Vikram Singh', '+91 98765 43214', '7 Whitefield Main Road, Bangalore', '2023-10-01 00:00:00'),
  (6, 7, 'Ananya Iyer', '+91 98765 43215', '102 Jayanagar 4th Block, Bangalore', '2023-10-01 00:00:00'),
  (7, 8, 'Rohit Gupta', '+91 98765 43216', '54 Electronic City Phase 1, Bangalore', '2023-10-01 00:00:00'),
  (8, 9, 'Deepika Nair', '+91 98765 43217', '31 Malleshwaram 8th Cross, Bangalore', '2023-10-01 00:00:00'),
  (9, 10, 'Manish Joshi', '+91 98765 43218', '19 Banashankari 2nd Stage, Bangalore', '2023-10-01 00:00:00'),
  (10, 11, 'Pooja Kumar', '+91 98765 43219', '76 Bellandur Green Glen, Bangalore', '2023-10-01 00:00:00'),
  (11, 12, 'Arjun Mehta', '+91 98765 43220', '12 Kalyan Nagar Outer Ring, Bangalore', '2023-10-01 00:00:00'),
  (12, 13, 'Kavita Deshmukh', '+91 98765 43221', '9 Richmond Town Promenade, Bangalore', '2023-10-01 00:00:00');

-- -----------------------------------------------------------------------------
-- 3. Drivers (8 records; Driver 8 was never assigned)
-- -----------------------------------------------------------------------------
INSERT INTO drivers (driver_id, user_id, full_name, phone, license_number, license_expiry, status, joined_date) VALUES
  (1, 14, 'Suresh Kumar', '+91 98111 11001', 'DL-04-2018-001234', '2028-05-15', 'available', '2022-01-10'),
  (2, 15, 'Ramesh Yadav', '+91 98111 11002', 'DL-04-2019-002345', '2027-08-20', 'available', '2022-03-12'),
  (3, 16, 'Anil Gowda', '+91 98111 11003', 'DL-04-2017-003456', '2026-11-30', 'on_trip', '2021-06-25'),
  (4, 17, 'Rajesh Hegde', '+91 98111 11004', 'DL-04-2020-004567', '2029-02-14', 'available', '2022-09-01'),
  (5, 18, 'Sunil Rao', '+91 98111 11005', 'DL-04-2016-005678', '2027-04-18', 'off_duty', '2021-02-18'),
  (6, 19, 'Vijay Shettigar', '+91 98111 11006', 'DL-04-2021-006789', '2030-07-22', 'available', '2023-04-10'),
  (7, 20, 'Mahesh Patil', '+91 98111 11007', 'DL-04-2018-007890', '2028-10-05', 'available', '2022-11-15'),
  (8, 21, 'Dinesh Acharya', '+91 98111 11008', 'DL-04-2023-008901', '2033-01-10', 'available', '2024-01-05');

-- -----------------------------------------------------------------------------
-- 4. Vehicles (11 records across all 4 tiers and availability statuses)
-- -----------------------------------------------------------------------------
INSERT INTO vehicles (vehicle_id, registration_number, model, vehicle_type, seats, status, driver_id) VALUES
  (1, 'KA-01-AB-1001', 'Maruti Suzuki WagonR', 'mini', 4, 'available', 1),
  (2, 'KA-01-CD-2002', 'Hyundai Grand i10', 'mini', 4, 'available', 2),
  (3, 'KA-02-EF-3003', 'Honda Amaze', 'sedan', 4, 'in_use', 3),
  (4, 'KA-02-GH-4004', 'Maruti Suzuki Dzire', 'sedan', 4, 'available', 4),
  (5, 'KA-03-IJ-5005', 'Hyundai Verna', 'sedan', 4, 'available', NULL),
  (6, 'KA-03-KL-6006', 'Toyota Innova Crysta', 'suv', 7, 'available', 5),
  (7, 'KA-04-MN-7007', 'Mahindra XUV700', 'suv', 7, 'available', 6),
  (8, 'KA-04-OP-8008', 'Tata Safari', 'suv', 7, 'maintenance', NULL),
  (9, 'KA-05-QR-9009', 'Mercedes-Benz E-Class', 'luxury', 4, 'available', 7),
  (10, 'KA-05-ST-9999', 'BMW 5 Series', 'luxury', 4, 'available', NULL),
  (11, 'KA-05-UV-1111', 'Audi A6', 'luxury', 4, 'available', NULL);

-- -----------------------------------------------------------------------------
-- 5. Fare Rates (4 vehicle tiers)
-- -----------------------------------------------------------------------------
INSERT INTO fare_rates (rate_id, vehicle_type, base_fare, per_km_rate, per_minute_rate, minimum_fare) VALUES
  (1, 'mini', 50.00, 12.00, 1.50, 80.00),
  (2, 'sedan', 80.00, 16.00, 2.00, 120.00),
  (3, 'suv', 120.00, 22.00, 2.50, 180.00),
  (4, 'luxury', 250.00, 38.00, 4.00, 350.00);

-- -----------------------------------------------------------------------------
-- 6. Bookings (65 records spread over 4 months with all lifecycle statuses)
-- -----------------------------------------------------------------------------
INSERT INTO bookings (booking_id, customer_id, driver_id, vehicle_id, vehicle_type, pickup_location, destination_location, distance_km, estimated_fare, final_fare, status, booking_time, pickup_time, completed_at, cancelled_reason) VALUES
  (1, 1, 1, 1, 'mini', 'Downtown Central Station', 'International Airport (BLR)', 34.50, 568.00, 568.00, 'completed', '2026-06-23 02:30:00', '2026-06-23 03:30:00', '2026-06-23 04:15:00', NULL),
  (2, 2, 2, 2, 'sedan', 'Cyber City Tech Park', 'Grand Metro Mall & Multiplex', 16.20, 404.00, 404.00, 'completed', '2026-06-25 03:37:00', '2026-06-25 03:30:00', '2026-06-25 04:15:00', NULL),
  (3, 3, 3, 3, 'suv', 'University Campus & Library', 'Downtown Central Station', 8.40, 347.00, 347.00, 'completed', '2026-06-27 04:44:00', '2026-06-27 03:30:00', '2026-06-27 04:15:00', NULL),
  (4, 1, 4, 4, 'luxury', 'City General Hospital', 'Suburban Green Residency', 14.80, 931.00, 931.00, 'completed', '2026-06-29 05:51:00', '2026-06-29 03:30:00', '2026-06-29 04:15:00', NULL),
  (5, 2, 5, 5, 'mini', 'Sunrise Bay Financial District', 'International Airport (BLR)', 38.00, 620.00, 620.00, 'completed', '2026-06-30 06:58:00', '2026-06-30 03:30:00', '2026-06-30 04:15:00', NULL),
  (6, 3, 6, 6, 'sedan', 'Grand Metro Mall & Multiplex', 'Cyber City Tech Park', 17.50, 430.00, NULL, 'cancelled', '2026-07-02 08:05:00', NULL, NULL, 'Driver delayed in heavy traffic'),
  (7, 1, 7, 7, 'suv', 'Westfield Exhibition Center', 'Downtown Central Station', 11.20, 422.00, 422.00, 'completed', '2026-07-04 09:12:00', '2026-07-04 03:30:00', '2026-07-04 04:15:00', NULL),
  (8, 2, 1, 1, 'luxury', 'Old Town Heritage Market', 'University Campus & Library', 6.80, 563.00, 563.00, 'completed', '2026-07-05 10:19:00', '2026-07-05 03:30:00', '2026-07-05 04:15:00', NULL),
  (9, 3, 2, 2, 'mini', 'Suburban Green Residency', 'Sunrise Bay Financial District', 21.40, 371.00, 371.00, 'completed', '2026-07-07 11:26:00', '2026-07-07 03:30:00', '2026-07-07 04:15:00', NULL),
  (10, 1, 3, 3, 'sedan', 'International Airport (BLR)', 'Cyber City Tech Park', 42.10, 922.00, 922.00, 'completed', '2026-07-09 11:33:00', '2026-07-09 03:30:00', '2026-07-09 04:15:00', NULL),
  (11, 2, 4, 4, 'suv', 'Downtown Central Station', 'International Airport (BLR)', 34.50, 1052.00, 1052.00, 'completed', '2026-07-10 12:40:00', '2026-07-10 03:30:00', '2026-07-10 04:15:00', NULL),
  (12, 3, 5, 5, 'luxury', 'Cyber City Tech Park', 'Grand Metro Mall & Multiplex', 16.20, 995.00, 995.00, 'completed', '2026-07-12 13:47:00', '2026-07-12 03:30:00', '2026-07-12 04:15:00', NULL),
  (13, 1, 6, 6, 'mini', 'University Campus & Library', 'Downtown Central Station', 8.40, 176.00, NULL, 'cancelled', '2026-07-14 02:54:00', NULL, NULL, 'Customer changed schedule'),
  (14, 2, 7, 7, 'sedan', 'City General Hospital', 'Suburban Green Residency', 14.80, 376.00, 376.00, 'completed', '2026-07-16 04:01:00', '2026-07-16 03:30:00', '2026-07-16 04:15:00', NULL),
  (15, 3, 1, 1, 'suv', 'Sunrise Bay Financial District', 'International Airport (BLR)', 38.00, 1146.00, 1146.00, 'completed', '2026-07-17 05:08:00', '2026-07-17 03:30:00', '2026-07-17 04:15:00', NULL),
  (16, 1, 2, 2, 'luxury', 'Grand Metro Mall & Multiplex', 'Cyber City Tech Park', 17.50, 1055.00, 1055.00, 'completed', '2026-07-19 06:15:00', '2026-07-19 03:30:00', '2026-07-19 04:15:00', NULL),
  (17, 2, 3, 3, 'mini', 'Westfield Exhibition Center', 'Downtown Central Station', 11.20, 218.00, 218.00, 'completed', '2026-07-21 07:22:00', '2026-07-21 03:30:00', '2026-07-21 04:15:00', NULL),
  (18, 3, 4, 4, 'sedan', 'Old Town Heritage Market', 'University Campus & Library', 6.80, 216.00, 216.00, 'completed', '2026-07-22 08:29:00', '2026-07-22 03:30:00', '2026-07-22 04:15:00', NULL),
  (19, 1, 5, 5, 'suv', 'Suburban Green Residency', 'Sunrise Bay Financial District', 21.40, 698.00, 698.00, 'completed', '2026-07-24 08:36:00', '2026-07-24 03:30:00', '2026-07-24 04:15:00', NULL),
  (20, 2, 6, 6, 'luxury', 'International Airport (BLR)', 'Cyber City Tech Park', 42.10, 2187.00, NULL, 'cancelled', '2026-07-26 09:43:00', NULL, NULL, 'Driver delayed in heavy traffic'),
  (21, 3, 7, 7, 'mini', 'Downtown Central Station', 'International Airport (BLR)', 34.50, 568.00, 568.00, 'completed', '2026-07-27 10:50:00', '2026-07-27 03:30:00', '2026-07-27 04:15:00', NULL),
  (22, 1, 1, 1, 'sedan', 'Cyber City Tech Park', 'Grand Metro Mall & Multiplex', 16.20, 404.00, 404.00, 'completed', '2026-07-29 11:57:00', '2026-07-29 03:30:00', '2026-07-29 04:15:00', NULL),
  (23, 2, 2, 2, 'suv', 'University Campus & Library', 'Downtown Central Station', 8.40, 347.00, 347.00, 'completed', '2026-07-31 13:04:00', '2026-07-31 03:30:00', '2026-07-31 04:15:00', NULL),
  (24, 3, 3, 3, 'luxury', 'City General Hospital', 'Suburban Green Residency', 14.80, 931.00, 931.00, 'completed', '2026-08-02 14:11:00', '2026-08-02 03:30:00', '2026-08-02 04:15:00', NULL),
  (25, 1, 4, 4, 'mini', 'Sunrise Bay Financial District', 'International Airport (BLR)', 38.00, 620.00, 620.00, 'completed', '2026-08-03 03:18:00', '2026-08-03 03:30:00', '2026-08-03 04:15:00', NULL),
  (26, 4, 5, 5, 'sedan', 'Grand Metro Mall & Multiplex', 'Cyber City Tech Park', 17.50, 430.00, 430.00, 'completed', '2026-08-05 04:25:00', '2026-08-05 03:30:00', '2026-08-05 04:15:00', NULL),
  (27, 5, 6, 6, 'suv', 'Westfield Exhibition Center', 'Downtown Central Station', 11.20, 422.00, NULL, 'cancelled', '2026-08-07 04:32:00', NULL, NULL, 'Customer changed schedule'),
  (28, 6, 7, 7, 'luxury', 'Old Town Heritage Market', 'University Campus & Library', 6.80, 563.00, 563.00, 'completed', '2026-08-08 05:39:00', '2026-08-08 03:30:00', '2026-08-08 04:15:00', NULL),
  (29, 7, 1, 1, 'mini', 'Suburban Green Residency', 'Sunrise Bay Financial District', 21.40, 371.00, 371.00, 'completed', '2026-08-10 06:46:00', '2026-08-10 03:30:00', '2026-08-10 04:15:00', NULL),
  (30, 8, 2, 2, 'sedan', 'International Airport (BLR)', 'Cyber City Tech Park', 42.10, 922.00, 922.00, 'completed', '2026-08-12 07:53:00', '2026-08-12 03:30:00', '2026-08-12 04:15:00', NULL),
  (31, 9, 3, 3, 'suv', 'Downtown Central Station', 'International Airport (BLR)', 34.50, 1052.00, 1052.00, 'completed', '2026-08-13 09:00:00', '2026-08-13 03:30:00', '2026-08-13 04:15:00', NULL),
  (32, 10, 4, 4, 'luxury', 'Cyber City Tech Park', 'Grand Metro Mall & Multiplex', 16.20, 995.00, 995.00, 'completed', '2026-08-15 10:07:00', '2026-08-15 03:30:00', '2026-08-15 04:15:00', NULL),
  (33, 4, 5, 5, 'mini', 'University Campus & Library', 'Downtown Central Station', 8.40, 176.00, 176.00, 'completed', '2026-08-17 11:14:00', '2026-08-17 03:30:00', '2026-08-17 04:15:00', NULL),
  (34, 5, 6, 6, 'sedan', 'City General Hospital', 'Suburban Green Residency', 14.80, 376.00, NULL, 'cancelled', '2026-08-19 12:21:00', NULL, NULL, 'Driver delayed in heavy traffic'),
  (35, 6, 7, 7, 'suv', 'Sunrise Bay Financial District', 'International Airport (BLR)', 38.00, 1146.00, 1146.00, 'completed', '2026-08-20 13:28:00', '2026-08-20 03:30:00', '2026-08-20 04:15:00', NULL),
  (36, 7, 1, 1, 'luxury', 'Grand Metro Mall & Multiplex', 'Cyber City Tech Park', 17.50, 1055.00, 1055.00, 'completed', '2026-08-22 13:35:00', '2026-08-22 03:30:00', '2026-08-22 04:15:00', NULL),
  (37, 8, 2, 2, 'mini', 'Westfield Exhibition Center', 'Downtown Central Station', 11.20, 218.00, 218.00, 'completed', '2026-08-24 02:42:00', '2026-08-24 03:30:00', '2026-08-24 04:15:00', NULL),
  (38, 9, 3, 3, 'sedan', 'Old Town Heritage Market', 'University Campus & Library', 6.80, 216.00, 216.00, 'completed', '2026-08-25 03:49:00', '2026-08-25 03:30:00', '2026-08-25 04:15:00', NULL),
  (39, 10, 4, 4, 'suv', 'Suburban Green Residency', 'Sunrise Bay Financial District', 21.40, 698.00, 698.00, 'completed', '2026-08-27 04:56:00', '2026-08-27 03:30:00', '2026-08-27 04:15:00', NULL),
  (40, 4, 5, 5, 'luxury', 'International Airport (BLR)', 'Cyber City Tech Park', 42.10, 2187.00, 2187.00, 'completed', '2026-08-29 06:03:00', '2026-08-29 03:30:00', '2026-08-29 04:15:00', NULL),
  (41, 5, 6, 6, 'mini', 'Downtown Central Station', 'International Airport (BLR)', 34.50, 568.00, NULL, 'cancelled', '2026-08-30 07:10:00', NULL, NULL, 'Customer changed schedule'),
  (42, 6, 7, 7, 'sedan', 'Cyber City Tech Park', 'Grand Metro Mall & Multiplex', 16.20, 404.00, 404.00, 'completed', '2026-09-01 08:17:00', '2026-09-01 03:30:00', '2026-09-01 04:15:00', NULL),
  (43, 7, 1, 1, 'suv', 'University Campus & Library', 'Downtown Central Station', 8.40, 347.00, 347.00, 'completed', '2026-09-03 09:24:00', '2026-09-03 03:30:00', '2026-09-03 04:15:00', NULL),
  (44, 8, 2, 2, 'luxury', 'City General Hospital', 'Suburban Green Residency', 14.80, 931.00, 931.00, 'completed', '2026-09-05 09:31:00', '2026-09-05 03:30:00', '2026-09-05 04:15:00', NULL),
  (45, 9, 3, 3, 'mini', 'Sunrise Bay Financial District', 'International Airport (BLR)', 38.00, 620.00, 620.00, 'completed', '2026-09-06 10:38:00', '2026-09-06 03:30:00', '2026-09-06 04:15:00', NULL),
  (46, 10, 4, 4, 'sedan', 'Grand Metro Mall & Multiplex', 'Cyber City Tech Park', 17.50, 430.00, 430.00, 'completed', '2026-09-08 11:45:00', '2026-09-08 03:30:00', '2026-09-08 04:15:00', NULL),
  (47, 4, 5, 5, 'suv', 'Westfield Exhibition Center', 'Downtown Central Station', 11.20, 422.00, 422.00, 'completed', '2026-09-10 12:52:00', '2026-09-10 03:30:00', '2026-09-10 04:15:00', NULL),
  (48, 5, 6, 6, 'luxury', 'Old Town Heritage Market', 'University Campus & Library', 6.80, 563.00, NULL, 'cancelled', '2026-09-11 13:59:00', NULL, NULL, 'Driver delayed in heavy traffic'),
  (49, 6, 7, 7, 'mini', 'Suburban Green Residency', 'Sunrise Bay Financial District', 21.40, 371.00, 371.00, 'completed', '2026-09-13 03:06:00', '2026-09-13 03:30:00', '2026-09-13 04:15:00', NULL),
  (50, 7, 1, 1, 'sedan', 'International Airport (BLR)', 'Cyber City Tech Park', 42.10, 922.00, 922.00, 'completed', '2026-09-15 04:13:00', '2026-09-15 03:30:00', '2026-09-15 04:15:00', NULL),
  (51, 8, 2, 2, 'suv', 'Downtown Central Station', 'International Airport (BLR)', 34.50, 1052.00, 1052.00, 'completed', '2026-09-16 05:20:00', '2026-09-16 03:30:00', '2026-09-16 04:15:00', NULL),
  (52, 9, 3, 3, 'luxury', 'Cyber City Tech Park', 'Grand Metro Mall & Multiplex', 16.20, 995.00, 995.00, 'completed', '2026-09-18 06:27:00', '2026-09-18 03:30:00', '2026-09-18 04:15:00', NULL),
  (53, 10, 4, 4, 'mini', 'University Campus & Library', 'Downtown Central Station', 8.40, 176.00, 176.00, 'completed', '2026-09-20 06:34:00', '2026-09-20 03:30:00', '2026-09-20 04:15:00', NULL),
  (54, 4, 5, 5, 'sedan', 'City General Hospital', 'Suburban Green Residency', 14.80, 376.00, 376.00, 'completed', '2026-09-22 07:41:00', '2026-09-22 03:30:00', '2026-09-22 04:15:00', NULL),
  (55, 5, 6, 6, 'suv', 'Sunrise Bay Financial District', 'International Airport (BLR)', 38.00, 1146.00, NULL, 'cancelled', '2026-09-23 08:48:00', NULL, NULL, 'Customer changed schedule'),
  (56, 6, 7, 7, 'luxury', 'Grand Metro Mall & Multiplex', 'Cyber City Tech Park', 17.50, 1055.00, 1055.00, 'completed', '2026-09-25 09:55:00', '2026-09-25 03:30:00', '2026-09-25 04:15:00', NULL),
  (57, 7, 1, 1, 'mini', 'Westfield Exhibition Center', 'Downtown Central Station', 11.20, 218.00, 218.00, 'completed', '2026-09-27 11:02:00', '2026-09-27 03:30:00', '2026-09-27 04:15:00', NULL),
  (58, 8, 2, 2, 'sedan', 'Old Town Heritage Market', 'University Campus & Library', 6.80, 216.00, 216.00, 'completed', '2026-09-28 12:09:00', '2026-09-28 03:30:00', '2026-09-28 04:15:00', NULL),
  (59, 9, 3, 3, 'suv', 'Suburban Green Residency', 'Sunrise Bay Financial District', 21.40, 698.00, 698.00, 'completed', '2026-09-30 13:16:00', '2026-09-30 03:30:00', '2026-09-30 04:15:00', NULL),
  (60, 10, 4, 4, 'luxury', 'International Airport (BLR)', 'Cyber City Tech Park', 42.10, 2187.00, 2187.00, 'completed', '2026-10-02 14:23:00', '2026-10-02 03:30:00', '2026-10-02 04:15:00', NULL),
  (61, 4, NULL, NULL, 'mini', 'Downtown Central Station', 'International Airport (BLR)', 34.50, 568.00, NULL, 'pending', '2026-10-03 02:30:00', NULL, NULL, NULL),
  (62, 5, 1, 1, 'sedan', 'Cyber City Tech Park', 'Grand Metro Mall & Multiplex', 16.20, 404.00, NULL, 'assigned', '2026-10-05 03:37:00', NULL, NULL, NULL),
  (63, 6, 2, 2, 'suv', 'University Campus & Library', 'Downtown Central Station', 8.40, 347.00, NULL, 'accepted', '2026-10-07 04:44:00', NULL, NULL, NULL),
  (64, 7, 3, 3, 'luxury', 'City General Hospital', 'Suburban Green Residency', 14.80, 931.00, NULL, 'in_progress', '2026-10-09 05:51:00', '2026-10-16 04:45:00', NULL, NULL),
  (65, 8, 2, 2, 'mini', 'Sunrise Bay Financial District', 'International Airport (BLR)', 38.00, 620.00, 620.00, 'completed', '2026-10-10 06:58:00', '2026-10-10 03:30:00', '2026-10-10 04:15:00', NULL);

-- -----------------------------------------------------------------------------
-- 7. Payments (65 ledger rows 1:1 with bookings)
-- -----------------------------------------------------------------------------
INSERT INTO payments (payment_id, booking_id, amount, payment_method, payment_status, paid_at) VALUES
  (1, 1, 568.00, 'card', 'paid', '2026-06-23 04:15:00'),
  (2, 2, 404.00, 'upi', 'paid', '2026-06-25 04:15:00'),
  (3, 3, 347.00, 'cash', 'paid', '2026-06-27 04:15:00'),
  (4, 4, 931.00, 'card', 'paid', '2026-06-29 04:15:00'),
  (5, 5, 620.00, 'upi', 'paid', '2026-06-30 04:15:00'),
  (6, 6, 430.00, 'cash', 'refunded', NULL),
  (7, 7, 422.00, 'card', 'paid', '2026-07-04 04:15:00'),
  (8, 8, 563.00, 'upi', 'paid', '2026-07-05 04:15:00'),
  (9, 9, 371.00, 'cash', 'paid', '2026-07-07 04:15:00'),
  (10, 10, 922.00, 'card', 'paid', '2026-07-09 04:15:00'),
  (11, 11, 1052.00, 'upi', 'paid', '2026-07-10 04:15:00'),
  (12, 12, 995.00, 'cash', 'paid', '2026-07-12 04:15:00'),
  (13, 13, 176.00, 'card', 'refunded', NULL),
  (14, 14, 376.00, 'upi', 'paid', '2026-07-16 04:15:00'),
  (15, 15, 1146.00, 'cash', 'paid', '2026-07-17 04:15:00'),
  (16, 16, 1055.00, 'card', 'paid', '2026-07-19 04:15:00'),
  (17, 17, 218.00, 'upi', 'paid', '2026-07-21 04:15:00'),
  (18, 18, 216.00, 'cash', 'paid', '2026-07-22 04:15:00'),
  (19, 19, 698.00, 'card', 'paid', '2026-07-24 04:15:00'),
  (20, 20, 2187.00, 'upi', 'refunded', NULL),
  (21, 21, 568.00, 'cash', 'paid', '2026-07-27 04:15:00'),
  (22, 22, 404.00, 'card', 'paid', '2026-07-29 04:15:00'),
  (23, 23, 347.00, 'upi', 'paid', '2026-07-31 04:15:00'),
  (24, 24, 931.00, 'cash', 'paid', '2026-08-02 04:15:00'),
  (25, 25, 620.00, 'card', 'paid', '2026-08-03 04:15:00'),
  (26, 26, 430.00, 'upi', 'paid', '2026-08-05 04:15:00'),
  (27, 27, 422.00, 'cash', 'refunded', NULL),
  (28, 28, 563.00, 'card', 'paid', '2026-08-08 04:15:00'),
  (29, 29, 371.00, 'upi', 'paid', '2026-08-10 04:15:00'),
  (30, 30, 922.00, 'cash', 'paid', '2026-08-12 04:15:00'),
  (31, 31, 1052.00, 'card', 'paid', '2026-08-13 04:15:00'),
  (32, 32, 995.00, 'upi', 'paid', '2026-08-15 04:15:00'),
  (33, 33, 176.00, 'cash', 'paid', '2026-08-17 04:15:00'),
  (34, 34, 376.00, 'card', 'refunded', NULL),
  (35, 35, 1146.00, 'upi', 'paid', '2026-08-20 04:15:00'),
  (36, 36, 1055.00, 'cash', 'paid', '2026-08-22 04:15:00'),
  (37, 37, 218.00, 'card', 'paid', '2026-08-24 04:15:00'),
  (38, 38, 216.00, 'upi', 'paid', '2026-08-25 04:15:00'),
  (39, 39, 698.00, 'cash', 'paid', '2026-08-27 04:15:00'),
  (40, 40, 2187.00, 'card', 'paid', '2026-08-29 04:15:00'),
  (41, 41, 568.00, 'upi', 'refunded', NULL),
  (42, 42, 404.00, 'cash', 'paid', '2026-09-01 04:15:00'),
  (43, 43, 347.00, 'card', 'paid', '2026-09-03 04:15:00'),
  (44, 44, 931.00, 'upi', 'paid', '2026-09-05 04:15:00'),
  (45, 45, 620.00, 'cash', 'paid', '2026-09-06 04:15:00'),
  (46, 46, 430.00, 'card', 'paid', '2026-09-08 04:15:00'),
  (47, 47, 422.00, 'upi', 'paid', '2026-09-10 04:15:00'),
  (48, 48, 563.00, 'cash', 'refunded', NULL),
  (49, 49, 371.00, 'card', 'paid', '2026-09-13 04:15:00'),
  (50, 50, 922.00, 'upi', 'paid', '2026-09-15 04:15:00'),
  (51, 51, 1052.00, 'cash', 'paid', '2026-09-16 04:15:00'),
  (52, 52, 995.00, 'card', 'paid', '2026-09-18 04:15:00'),
  (53, 53, 176.00, 'upi', 'paid', '2026-09-20 04:15:00'),
  (54, 54, 376.00, 'cash', 'paid', '2026-09-22 04:15:00'),
  (55, 55, 1146.00, 'card', 'refunded', NULL),
  (56, 56, 1055.00, 'upi', 'paid', '2026-09-25 04:15:00'),
  (57, 57, 218.00, 'cash', 'paid', '2026-09-27 04:15:00'),
  (58, 58, 216.00, 'card', 'paid', '2026-09-28 04:15:00'),
  (59, 59, 698.00, 'upi', 'paid', '2026-09-30 04:15:00'),
  (60, 60, 2187.00, 'cash', 'paid', '2026-10-02 04:15:00'),
  (61, 61, 568.00, 'card', 'pending', NULL),
  (62, 62, 404.00, 'upi', 'pending', NULL),
  (63, 63, 347.00, 'cash', 'pending', NULL),
  (64, 64, 931.00, 'card', 'pending', NULL),
  (65, 65, 620.00, 'upi', 'paid', '2026-10-10 04:15:00');

-- -----------------------------------------------------------------------------
-- 8. Reviews (25 reviews for completed bookings with ratings 1-5)
-- -----------------------------------------------------------------------------
INSERT INTO reviews (review_id, booking_id, customer_id, driver_id, rating, comment, created_at) VALUES
  (1, 1, 1, 1, 5, 'Great ride! The driver was very polite and the car was clean.', '2026-06-23 04:15:00'),
  (2, 2, 2, 2, 5, 'Punctual and smooth driving through heavy traffic.', '2026-06-25 04:15:00'),
  (3, 3, 3, 3, 4, 'Comfortable ride, reached the airport well ahead of time.', '2026-06-27 04:15:00'),
  (4, 4, 1, 4, 5, 'Very professional service. AC was working properly.', '2026-06-29 04:15:00'),
  (5, 5, 2, 5, 4, 'Decent trip, reasonable fare.', '2026-06-30 04:15:00'),
  (6, 7, 1, 7, 5, 'Excellent experience with the luxury sedan, totally worth it!', '2026-07-04 04:15:00'),
  (7, 8, 2, 1, 5, 'Courteous driver and safe driving throughout.', '2026-07-05 04:15:00'),
  (8, 9, 3, 2, 5, 'Quick pickup and clean interiors.', '2026-07-07 04:15:00'),
  (9, 10, 1, 3, 4, 'Good navigation avoiding bottleneck congestion.', '2026-07-09 04:15:00'),
  (10, 11, 2, 4, 5, 'Reliable service as always, highly recommend!', '2026-07-10 04:15:00'),
  (11, 12, 3, 5, 4, 'Great ride! The driver was very polite and the car was clean.', '2026-07-12 04:15:00'),
  (12, 14, 2, 7, 5, 'Punctual and smooth driving through heavy traffic.', '2026-07-16 04:15:00'),
  (13, 15, 3, 1, 5, 'Comfortable ride, reached the airport well ahead of time.', '2026-07-17 04:15:00'),
  (14, 16, 1, 2, 5, 'Very professional service. AC was working properly.', '2026-07-19 04:15:00'),
  (15, 17, 2, 3, 4, 'Decent trip, reasonable fare.', '2026-07-21 04:15:00'),
  (16, 18, 3, 4, 5, 'Excellent experience with the luxury sedan, totally worth it!', '2026-07-22 04:15:00'),
  (17, 19, 1, 5, 4, 'Courteous driver and safe driving throughout.', '2026-07-24 04:15:00'),
  (18, 21, 3, 7, 5, 'Quick pickup and clean interiors.', '2026-07-27 04:15:00'),
  (19, 22, 1, 1, 5, 'Good navigation avoiding bottleneck congestion.', '2026-07-29 04:15:00'),
  (20, 23, 2, 2, 5, 'Reliable service as always, highly recommend!', '2026-07-31 04:15:00'),
  (21, 24, 3, 3, 4, 'Great ride! The driver was very polite and the car was clean.', '2026-08-02 04:15:00'),
  (22, 25, 1, 4, 5, 'Punctual and smooth driving through heavy traffic.', '2026-08-03 04:15:00'),
  (23, 26, 4, 5, 4, 'Comfortable ride, reached the airport well ahead of time.', '2026-08-05 04:15:00'),
  (24, 28, 6, 7, 5, 'Very professional service. AC was working properly.', '2026-08-08 04:15:00'),
  (25, 29, 7, 1, 5, 'Decent trip, reasonable fare.', '2026-08-10 04:15:00');
