-- =============================================================================
-- Taxi Service Management System - Database Schema (MySQL 8, InnoDB, 3NF)
-- Exact relational architecture specified for College DBMS Coursework
-- =============================================================================

CREATE DATABASE IF NOT EXISTS taxi_service_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE taxi_service_db;

-- Drop views if exist
DROP VIEW IF EXISTS v_booking_details;
DROP VIEW IF EXISTS v_daily_revenue;

-- Drop tables in reverse foreign key dependency order
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS fare_rates;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

-- -----------------------------------------------------------------------------
-- 1. Table: users
-- Purpose: Central authentication & account security (Role-Based Access Control)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'driver', 'admin') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: customers
-- Purpose: Rider profile information linked 1:1 with users
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customers_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: drivers
-- Purpose: Professional driver credentials and operational availability
-- -----------------------------------------------------------------------------
CREATE TABLE drivers (
    driver_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_expiry DATE NOT NULL,
    status ENUM('available', 'on_trip', 'off_duty') NOT NULL DEFAULT 'available',
    joined_date DATE NOT NULL,
    CONSTRAINT fk_drivers_user FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: vehicles
-- Purpose: Fleet inventory tracking with vehicle classification & status
-- -----------------------------------------------------------------------------
CREATE TABLE vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    vehicle_type ENUM('mini', 'sedan', 'suv', 'luxury') NOT NULL,
    seats TINYINT NOT NULL,
    status ENUM('available', 'in_use', 'maintenance') NOT NULL DEFAULT 'available',
    driver_id INT NULL,
    CONSTRAINT chk_vehicle_seats CHECK (seats > 0),
    CONSTRAINT fk_vehicles_driver FOREIGN KEY (driver_id)
        REFERENCES drivers(driver_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table: fare_rates
-- Purpose: Pricing rules per vehicle type: max(min_fare, base_fare + km*per_km_rate)
-- -----------------------------------------------------------------------------
CREATE TABLE fare_rates (
    rate_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type ENUM('mini', 'sedan', 'suv', 'luxury') NOT NULL UNIQUE,
    base_fare DECIMAL(8, 2) NOT NULL,
    per_km_rate DECIMAL(8, 2) NOT NULL,
    per_minute_rate DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    minimum_fare DECIMAL(8, 2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_base_fare CHECK (base_fare >= 0),
    CONSTRAINT chk_per_km_rate CHECK (per_km_rate >= 0),
    CONSTRAINT chk_min_fare CHECK (minimum_fare >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table: bookings
-- Purpose: Core ride lifecycle state machine:
-- pending -> assigned -> accepted -> in_progress -> completed
-- pending | assigned | accepted -> cancelled
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    driver_id INT NULL,
    vehicle_id INT NULL,
    vehicle_type ENUM('mini', 'sedan', 'suv', 'luxury') NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    destination_location VARCHAR(255) NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    estimated_fare DECIMAL(10, 2) NOT NULL,
    final_fare DECIMAL(10, 2) NULL,
    status ENUM('pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_time DATETIME NULL,
    completed_at DATETIME NULL,
    cancelled_reason VARCHAR(255) NULL,
    CONSTRAINT chk_distance_km CHECK (distance_km > 0),
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_driver FOREIGN KEY (driver_id)
        REFERENCES drivers(driver_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(vehicle_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Table: payments
-- Purpose: Financial receipts and payment settlement ledger (1:1 with bookings)
-- -----------------------------------------------------------------------------
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    paid_at DATETIME NULL,
    CONSTRAINT chk_payment_amount CHECK (amount >= 0),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Table: reviews
-- Purpose: Customer rating & commentary (1:1 per completed ride)
-- -----------------------------------------------------------------------------
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    driver_id INT NOT NULL,
    rating TINYINT NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id)
        REFERENCES bookings(booking_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_driver FOREIGN KEY (driver_id)
        REFERENCES drivers(driver_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- PERFORMANCE INDEXES (Beyond Primary Keys & Unique Keys)
-- =============================================================================
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_time ON bookings(booking_time);
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX idx_bookings_driver_status ON bookings(driver_id, status);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_vehicles_status_type ON vehicles(status, vehicle_type);
CREATE INDEX idx_drivers_status ON drivers(status);

-- =============================================================================
-- RELATIONAL VIEWS
-- =============================================================================

-- View 1: Complete Booking Details (Joining bookings, customers, drivers, vehicles, payments, reviews)
CREATE OR REPLACE VIEW v_booking_details AS
SELECT 
    b.booking_id,
    b.status AS booking_status,
    b.pickup_location,
    b.destination_location,
    b.distance_km,
    b.estimated_fare,
    b.final_fare,
    b.booking_time,
    b.pickup_time,
    b.completed_at,
    b.cancelled_reason,
    c.customer_id,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    d.driver_id,
    d.full_name AS driver_name,
    d.phone AS driver_phone,
    v.vehicle_id,
    v.registration_number,
    v.model AS vehicle_model,
    b.vehicle_type,
    p.payment_id,
    p.amount AS payment_amount,
    p.payment_method,
    p.payment_status,
    p.paid_at,
    r.review_id,
    r.rating,
    r.comment AS review_comment
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
LEFT JOIN drivers d ON b.driver_id = d.driver_id
LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
LEFT JOIN payments p ON b.booking_id = p.booking_id
LEFT JOIN reviews r ON b.booking_id = r.booking_id;

-- View 2: Daily Revenue Summary
CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT 
    DATE(b.completed_at) AS ride_date,
    COUNT(b.booking_id) AS total_completed_rides,
    COALESCE(SUM(b.final_fare), 0) AS total_gross_revenue,
    COALESCE(SUM(CASE WHEN p.payment_status = 'paid' THEN p.amount ELSE 0 END), 0) AS total_settled_revenue
FROM bookings b
LEFT JOIN payments p ON b.booking_id = p.booking_id
WHERE b.status = 'completed' AND b.completed_at IS NOT NULL
GROUP BY DATE(b.completed_at);

-- =============================================================================
-- STORED PROCEDURES & TRIGGERS
-- =============================================================================

DROP PROCEDURE IF EXISTS sp_assign_driver;
DELIMITER $$
CREATE PROCEDURE sp_assign_driver(
    IN p_booking_id INT,
    IN p_driver_id INT,
    IN p_vehicle_id INT
)
BEGIN
    DECLARE v_booking_status VARCHAR(20);
    DECLARE v_driver_status VARCHAR(20);
    DECLARE v_vehicle_status VARCHAR(20);

    -- 1. Check current booking status
    SELECT status INTO v_booking_status FROM bookings WHERE booking_id = p_booking_id;
    IF v_booking_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found.';
    END IF;
    IF v_booking_status != 'pending' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking is not in pending status.';
    END IF;

    -- 2. Check driver availability
    SELECT status INTO v_driver_status FROM drivers WHERE driver_id = p_driver_id;
    IF v_driver_status != 'available' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Driver is not currently available.';
    END IF;

    -- 3. Check vehicle availability
    SELECT status INTO v_vehicle_status FROM vehicles WHERE vehicle_id = p_vehicle_id;
    IF v_vehicle_status != 'available' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Vehicle is not currently available.';
    END IF;

    -- 4. Execute atomic assignment
    UPDATE bookings 
    SET driver_id = p_driver_id,
        vehicle_id = p_vehicle_id,
        status = 'assigned'
    WHERE booking_id = p_booking_id;

    UPDATE drivers SET status = 'on_trip' WHERE driver_id = p_driver_id;
    UPDATE vehicles SET status = 'in_use' WHERE vehicle_id = p_vehicle_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_monthly_revenue;
DELIMITER $$
CREATE PROCEDURE sp_monthly_revenue(IN p_year INT, IN p_month INT)
BEGIN
    SELECT 
        p_year AS report_year,
        p_month AS report_month,
        COUNT(b.booking_id) AS total_rides_booked,
        SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_rides,
        SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_rides,
        COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE 0 END), 0) AS total_revenue_collected,
        ROUND(COALESCE(AVG(CASE WHEN b.status = 'completed' THEN b.final_fare ELSE NULL END), 0), 2) AS average_completed_fare
    FROM bookings b
    WHERE YEAR(b.booking_time) = p_year AND MONTH(b.booking_time) = p_month;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_after_booking_status_update;
DELIMITER $$
CREATE TRIGGER trg_after_booking_status_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    -- Free driver and vehicle when trip completes or cancels
    IF NEW.status IN ('completed', 'cancelled') AND OLD.status NOT IN ('completed', 'cancelled') THEN
        IF NEW.driver_id IS NOT NULL THEN
            UPDATE drivers SET status = 'available' WHERE driver_id = NEW.driver_id;
        END IF;
        IF NEW.vehicle_id IS NOT NULL THEN
            UPDATE vehicles SET status = 'available' WHERE vehicle_id = NEW.vehicle_id;
        END IF;
    END IF;
END$$
DELIMITER ;
