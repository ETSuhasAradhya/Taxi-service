/**
 * Taxi Service Management System - SQL Query Catalog
 * Master repository of 48 comprehensive database queries for DBMS Course viva & practical demonstrations.
 * Categorized into 16 required categories with complete pedagogical metadata.
 */

const QUERY_CATALOG = [
  // =========================================================================
  // 1. Basic SQL
  // =========================================================================
  {
    id: 1,
    slug: 'all-customers',
    title: 'Select All Registered Customers',
    category: 'Basic SQL',
    concept: 'SELECT projection and column retrieval',
    difficulty: 'Beginner',
    tags: ['SELECT', 'Primary Key', 'Customer Reports'],
    sql: `SELECT customer_id, full_name, phone, address, created_at 
FROM customers 
ORDER BY customer_id ASC 
LIMIT 50;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Specifies the exact column projection (attributes) to retrieve from the relation.' },
      { line: 2, explanation: 'Declares the source table: customers.' },
      { line: 3, explanation: 'Sorts rows in ascending order based on the Primary Key customer_id.' },
      { line: 4, explanation: 'Limits the result set to prevent unbounded result streaming.' }
    ],
    tables_involved: ['customers'],
    expected_output_description: 'Tabular list of customer records including profile identifiers and contact information.',
    sample_output: {
      columns: ['customer_id', 'full_name', 'phone', 'address', 'created_at'],
      rows: [
        [1, 'Rahul Sharma', '+91 98765 43210', '42 MG Road, Bangalore', '2023-10-01 00:00:00'],
        [2, 'Priya Patel', '+91 98765 43211', '15 Indiranagar 100ft Rd', '2023-10-01 00:00:00'],
        [3, 'Amit Verma', '+91 98765 43212', '88 Koramangala 5th Block', '2023-10-01 00:00:00']
      ]
    },
    why_useful_in_taxi_app: 'Allows the admin dispatch console to view all registered riders in the platform.',
    dbms_concept: 'Relational Projection (π) and Ordering',
    sample_use_case: 'Displaying the master customer directory in Admin Portal.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 2,
    slug: 'distinct-vehicle-types',
    title: 'Select Distinct Vehicle Types in Fleet',
    category: 'Basic SQL',
    concept: 'DISTINCT deduplication',
    difficulty: 'Beginner',
    tags: ['DISTINCT', 'SELECT', 'Vehicle Availability'],
    sql: `SELECT DISTINCT vehicle_type, seats 
FROM vehicles 
ORDER BY seats ASC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Eliminates duplicate attribute combinations from the output relation.' },
      { line: 2, explanation: 'Queries the vehicles inventory table.' },
      { line: 3, explanation: 'Orders output by seat capacity ascending.' }
    ],
    tables_involved: ['vehicles'],
    expected_output_description: 'List of unique combinations of vehicle categories and their seating capacity.',
    sample_output: {
      columns: ['vehicle_type', 'seats'],
      rows: [
        ['mini', 4],
        ['sedan', 4],
        ['luxury', 4],
        ['suv', 7]
      ]
    },
    why_useful_in_taxi_app: 'Shows customers available taxi classes and passenger capacity.',
    dbms_concept: 'Set Deduplication and Cardinality Reduction',
    sample_use_case: 'Populating vehicle selection dropdown during ride booking.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 3,
    slug: 'bookings-within-date-range',
    title: 'Filter Bookings Within Date Range (BETWEEN)',
    category: 'Basic SQL',
    concept: 'Range filtering with BETWEEN predicate',
    difficulty: 'Beginner',
    tags: ['BETWEEN', 'SELECT', 'Booking Reports'],
    sql: `SELECT booking_id, customer_id, vehicle_type, pickup_location, destination_location, estimated_fare, booking_time 
FROM bookings 
WHERE booking_time BETWEEN DATE_SUB(NOW(), INTERVAL 90 DAY) AND NOW() 
ORDER BY booking_time DESC 
LIMIT 20;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Retrieves booking identifiers, route details, and fare information.' },
      { line: 2, explanation: 'From the bookings table.' },
      { line: 3, explanation: 'Filters timestamps strictly within the last 90 days inclusive.' },
      { line: 4, explanation: 'Orders newest trips first.' },
      { line: 5, explanation: 'Caps output to 20 rows for performance.' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Recent ride requests logged within the specified timeframe.',
    sample_output: {
      columns: ['booking_id', 'customer_id', 'vehicle_type', 'pickup_location', 'destination_location', 'estimated_fare', 'booking_time'],
      rows: [
        [65, 3, 'luxury', 'International Airport', 'Cyber City Tech Park', 1849.00, '2026-10-13 10:30:00'],
        [64, 1, 'sedan', 'Downtown Central', 'Airport', 718.00, '2026-10-12 14:15:00']
      ]
    },
    why_useful_in_taxi_app: 'Enables quarterly or monthly trip audits by dispatch managers.',
    dbms_concept: 'Temporal Selection (σ) using B-Tree index on booking_time',
    sample_use_case: 'Auditing recent ride operations for dispute resolution.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 2. CRUD Operations
  // =========================================================================
  {
    id: 4,
    slug: 'insert-customer-demo',
    title: 'Insert New Customer Profile (INSERT)',
    category: 'CRUD Operations',
    concept: 'Tuple Insertion into Relational Table',
    difficulty: 'Beginner',
    tags: ['INSERT', 'Primary Key', 'Foreign Key'],
    sql: `-- Educational demonstration of inserting a customer profile referencing an existing user_id
INSERT INTO customers (user_id, full_name, phone, address) 
VALUES (2, 'Rahul Sharma Demo', '+91 99999 00001', '100 Feet Ring Road');`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Educational comment explaining target and constraints.' },
      { line: 2, explanation: 'Defines target relation and attribute columns.' },
      { line: 3, explanation: 'Provides values matching column types (user_id must satisfy FK constraint).' }
    ],
    tables_involved: ['customers'],
    expected_output_description: 'Inserts one new tuple; returns number of affected rows (1) and last insert ID.',
    sample_output: {
      columns: ['Status', 'Affected Rows', 'Note'],
      rows: [['SUCCESS', 1, 'Tuple created with auto-increment customer_id']]
    },
    why_useful_in_taxi_app: 'Executed during user registration to store rider profile details.',
    dbms_concept: 'Tuple Insertion & Referential Integrity Validation',
    sample_use_case: 'User onboarding flow.',
    execution_type: 'educational',
    executable: false,
    report_key: null
  },
  {
    id: 5,
    slug: 'update-driver-status-demo',
    title: 'Update Driver Operational Status (UPDATE)',
    category: 'CRUD Operations',
    concept: 'In-place Tuple Modification with WHERE clause',
    difficulty: 'Beginner',
    tags: ['UPDATE', 'Driver Reports'],
    sql: `-- Safely updating a driver's status to off_duty
UPDATE drivers 
SET status = 'off_duty' 
WHERE driver_id = 5 AND status = 'available';`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Comment highlighting importance of WHERE clause.' },
      { line: 2, explanation: 'Identifies table to update: drivers.' },
      { line: 3, explanation: 'Specifies the attribute modification (sets status to off_duty).' },
      { line: 4, explanation: 'Restricts modification to driver_id 5 only if currently available.' }
    ],
    tables_involved: ['drivers'],
    expected_output_description: 'Updates 1 record matching the primary key condition.',
    sample_output: {
      columns: ['Status', 'Matched Rows', 'Changed Rows'],
      rows: [['SUCCESS', 1, 1]]
    },
    why_useful_in_taxi_app: 'Allows drivers to clock out when ending their shift.',
    dbms_concept: 'Tuple Attribute Mutation & State Machine transition',
    sample_use_case: 'Driver toggling availability in the mobile interface.',
    execution_type: 'educational',
    executable: false,
    report_key: null
  },
  {
    id: 6,
    slug: 'delete-cancelled-demo',
    title: 'Delete Demo Record with Referential Protection (DELETE)',
    category: 'CRUD Operations',
    concept: 'Tuple Deletion and Foreign Key RESTRICT validation',
    difficulty: 'Intermediate',
    tags: ['DELETE', 'Foreign Key', 'Constraints'],
    sql: `-- Safe DELETE demonstration: will fail if foreign key references exist (ON DELETE RESTRICT)
DELETE FROM customers 
WHERE customer_id = 11 AND NOT EXISTS (
    SELECT 1 FROM bookings WHERE customer_id = 11
);`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Explains safe deletion pattern preventing cascade loss.' },
      { line: 2, explanation: 'Specifies deletion from customers relation.' },
      { line: 3, explanation: 'Filters target customer 11 who has never booked.' },
      { line: 4, explanation: 'Guarantees no child records exist in bookings table.' }
    ],
    tables_involved: ['customers', 'bookings'],
    expected_output_description: 'Deletes only customers without dependent booking foreign key rows.',
    sample_output: {
      columns: ['Status', 'Deleted Rows'],
      rows: [['SUCCESS', 1]]
    },
    why_useful_in_taxi_app: 'Purges unverified test accounts without corrupting audit history.',
    dbms_concept: 'Referential Integrity Guarded Tuple Deletion',
    sample_use_case: 'Account cleanup for inactive non-riders.',
    execution_type: 'educational',
    executable: false,
    report_key: null
  },

  // =========================================================================
  // 3. Joins
  // =========================================================================
  {
    id: 7,
    slug: 'bookings-joined-with-customers',
    title: 'Bookings Joined with Customers (INNER JOIN)',
    category: 'Joins',
    concept: 'INNER JOIN combining matched foreign key tuples',
    difficulty: 'Intermediate',
    tags: ['JOIN', 'INNER JOIN', 'Customer Reports', 'Booking Reports'],
    sql: `SELECT 
    b.booking_id,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    b.pickup_location,
    b.destination_location,
    b.distance_km,
    b.estimated_fare,
    b.status
FROM bookings b
INNER JOIN customers c ON b.customer_id = c.customer_id
ORDER BY b.booking_id DESC
LIMIT 20;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects booking attributes and rider contact details.' },
      { line: 8, explanation: 'Primary relation: bookings aliased as b.' },
      { line: 9, explanation: 'Inner joins customers c on equality of the customer_id foreign key.' },
      { line: 10, explanation: 'Sorts by newest booking identifier.' },
      { line: 11, explanation: 'Restricts output size to 20 rows.' }
    ],
    tables_involved: ['bookings', 'customers'],
    expected_output_description: 'Every booking alongside the rider name and phone who created it.',
    sample_output: {
      columns: ['booking_id', 'customer_name', 'customer_phone', 'pickup_location', 'destination_location', 'distance_km', 'estimated_fare', 'status'],
      rows: [
        [65, 'Amit Verma', '+91 98765 43212', 'Airport', 'Cyber City', 42.10, 1849.00, 'completed'],
        [64, 'Rahul Sharma', '+91 98765 43210', 'Downtown', 'Airport', 34.50, 718.00, 'completed']
      ]
    },
    why_useful_in_taxi_app: 'Essential for the dispatch screen to display who booked which cab.',
    dbms_concept: 'Natural Join / Equi-Join across Primary-Foreign Key',
    sample_use_case: 'Admin monitoring current ride dispatch queue.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 8,
    slug: 'bookings-joined-with-drivers-and-vehicles',
    title: 'Complete Trip Dispatch (Multi-Table 4-Way JOIN)',
    category: 'Joins',
    concept: 'Multi-table INNER and LEFT JOINs linking 4 entities',
    difficulty: 'Intermediate',
    tags: ['JOIN', 'LEFT JOIN', 'Driver Reports', 'Vehicle Availability'],
    sql: `SELECT 
    b.booking_id,
    c.full_name AS customer_name,
    d.full_name AS driver_name,
    d.phone AS driver_phone,
    v.model AS vehicle_model,
    v.registration_number,
    b.pickup_location,
    b.destination_location,
    b.status
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
LEFT JOIN drivers d ON b.driver_id = d.driver_id
LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
ORDER BY b.booking_id DESC
LIMIT 20;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects composite ride attributes across 4 separate relations.' },
      { line: 10, explanation: 'Base relation: bookings.' },
      { line: 11, explanation: 'Mandatory JOIN to customers (every booking has a customer).' },
      { line: 12, explanation: 'LEFT JOIN to drivers: preserves pending bookings where driver_id is NULL.' },
      { line: 13, explanation: 'LEFT JOIN to vehicles: preserves bookings before vehicle assignment.' }
    ],
    tables_involved: ['bookings', 'customers', 'drivers', 'vehicles'],
    expected_output_description: 'Full dispatch summary with rider, driver, and vehicle assignment details.',
    sample_output: {
      columns: ['booking_id', 'customer_name', 'driver_name', 'driver_phone', 'vehicle_model', 'registration_number', 'pickup_location', 'destination_location', 'status'],
      rows: [
        [60, 'Rahul Sharma', 'NULL', 'NULL', 'NULL', 'NULL', 'Downtown Central', 'Airport', 'pending'],
        [59, 'Priya Patel', 'Suresh Kumar', '+91 98111 11001', 'Maruti WagonR', 'KA-01-AB-1001', 'Cyber City', 'Metro Mall', 'completed']
      ]
    },
    why_useful_in_taxi_app: 'Powers the master admin live bookings dashboard table.',
    dbms_concept: 'Multi-table Equi-Join with Nullable Foreign Key preservation',
    sample_use_case: 'Real-time dispatch control view.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 9,
    slug: 'customers-never-booked',
    title: 'Find Customers Who Never Booked (LEFT JOIN with IS NULL)',
    category: 'Joins',
    concept: 'Anti-Join pattern using LEFT JOIN and NULL check',
    difficulty: 'Intermediate',
    tags: ['LEFT JOIN', 'Customer Reports'],
    sql: `SELECT 
    c.customer_id,
    c.full_name,
    c.phone,
    c.address,
    c.created_at
FROM customers c
LEFT JOIN bookings b ON c.customer_id = b.customer_id
WHERE b.booking_id IS NULL;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects customer profile attributes.' },
      { line: 6, explanation: 'From customers relation.' },
      { line: 7, explanation: 'LEFT JOINs bookings: creates NULL fields for customers without matching bookings.' },
      { line: 8, explanation: 'Filters for unmatched tuples where b.booking_id is NULL.' }
    ],
    tables_involved: ['customers', 'bookings'],
    expected_output_description: 'List of registered customer accounts with zero ride history.',
    sample_output: {
      columns: ['customer_id', 'full_name', 'phone', 'address', 'created_at'],
      rows: [
        [11, 'Arjun Mehta', '+91 98765 43220', '12 Kalyan Nagar Outer Ring', '2023-10-01 00:00:00'],
        [12, 'Kavita Deshmukh', '+91 98765 43221', '9 Richmond Town Promenade', '2023-10-01 00:00:00']
      ]
    },
    why_useful_in_taxi_app: 'Marketing team targets dormant riders with sign-up promotional discount codes.',
    dbms_concept: 'Relational Set Difference (A - B) implemented via Outer Join',
    sample_use_case: 'Promotional discount campaign targeting dormant users.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 10,
    slug: 'drivers-never-assigned',
    title: 'Drivers Never Assigned to Any Trip',
    category: 'Joins',
    concept: 'Anti-Join to identify unallocated resources',
    difficulty: 'Intermediate',
    tags: ['LEFT JOIN', 'Driver Reports'],
    sql: `SELECT 
    d.driver_id,
    d.full_name,
    d.phone,
    d.license_number,
    d.status,
    d.joined_date
FROM drivers d
LEFT JOIN bookings b ON d.driver_id = b.driver_id
WHERE b.booking_id IS NULL;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects driver credentials and license details.' },
      { line: 7, explanation: 'Queries drivers table.' },
      { line: 8, explanation: 'LEFT JOINs bookings table on driver_id.' },
      { line: 9, explanation: 'Keeps only drivers with no matching rows in bookings.' }
    ],
    tables_involved: ['drivers', 'bookings'],
    expected_output_description: 'Active drivers on platform who have never handled a trip.',
    sample_output: {
      columns: ['driver_id', 'full_name', 'phone', 'license_number', 'status', 'joined_date'],
      rows: [
        [8, 'Dinesh Acharya', '+91 98111 11008', 'DL-04-2023-008901', 'available', '2024-01-05']
      ]
    },
    why_useful_in_taxi_app: 'Discovers idle workforce for assignment priority and onboarding assistance.',
    dbms_concept: 'Relational Anti-Join & Resource Allocation Audit',
    sample_use_case: 'Admin workforce utilization report.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 4. Aggregate Functions
  // =========================================================================
  {
    id: 11,
    slug: 'aggregate-summary-demo',
    title: 'Comprehensive Ride & Revenue Aggregations (COUNT, SUM, AVG, MIN, MAX)',
    category: 'Aggregate Functions',
    concept: 'Standard SQL aggregate functions over completed rides',
    difficulty: 'Intermediate',
    tags: ['Aggregate Functions', 'COUNT', 'SUM', 'AVG', 'Revenue Reports'],
    sql: `SELECT 
    COUNT(*) AS total_completed_trips,
    SUM(final_fare) AS total_gross_revenue,
    ROUND(AVG(final_fare), 2) AS average_fare,
    MIN(final_fare) AS lowest_fare,
    MAX(final_fare) AS highest_fare,
    ROUND(AVG(distance_km), 2) AS average_distance_km
FROM bookings 
WHERE status = 'completed';`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Calculates high-level statistical summaries across all completed trips.' },
      { line: 2, explanation: 'Counts total number of completed rides.' },
      { line: 3, explanation: 'Sums final collected fares to determine gross earnings.' },
      { line: 4, explanation: 'Computes arithmetic mean of fares rounded to two decimal places.' },
      { line: 5, explanation: 'Finds minimum and maximum fare outliers.' },
      { line: 7, explanation: 'Calculates average distance traveled.' },
      { line: 8, explanation: 'Restricts aggregation to completed trips only.' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Single-row statistical snapshot of platform financial operations.',
    sample_output: {
      columns: ['total_completed_trips', 'total_gross_revenue', 'average_fare', 'lowest_fare', 'highest_fare', 'average_distance_km'],
      rows: [
        [50, 39620.00, 792.40, 180.00, 2150.00, 21.65]
      ]
    },
    why_useful_in_taxi_app: 'Displays executive KPIs on the Admin Overview Dashboard.',
    dbms_concept: 'Aggregate Operations (γ) across Relational Tuples',
    sample_use_case: 'Executive management performance summary.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 12,
    slug: 'total-revenue-paid-rides',
    title: 'Total Revenue from Completed and Paid Rides',
    category: 'Aggregate Functions',
    concept: 'Aggregating financial ledger with double constraint verification',
    difficulty: 'Beginner',
    tags: ['SUM', 'Revenue Reports'],
    sql: `SELECT 
    COUNT(p.payment_id) AS total_paid_transactions,
    SUM(p.amount) AS total_collected_revenue,
    ROUND(AVG(p.amount), 2) AS average_paid_ticket_size
FROM payments p
JOIN bookings b ON p.booking_id = b.booking_id
WHERE b.status = 'completed' AND p.payment_status = 'paid';`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects count, total amount, and average ticket size.' },
      { line: 4, explanation: 'From payments table joined with bookings.' },
      { line: 6, explanation: 'Enforces business rule: trip must be completed AND payment received.' }
    ],
    tables_involved: ['payments', 'bookings'],
    expected_output_description: 'Realized revenue total excluding pending, failed, or refunded amounts.',
    sample_output: {
      columns: ['total_paid_transactions', 'total_collected_revenue', 'average_paid_ticket_size'],
      rows: [
        [50, 39620.00, 792.40]
      ]
    },
    why_useful_in_taxi_app: 'Ensures accurate GAAP-compliant financial reporting without phantom revenue.',
    dbms_concept: 'Joined Relational Aggregation with Predicate Filtering',
    sample_use_case: 'Financial accounting and payout reconciliation.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 5. GROUP BY and HAVING
  // =========================================================================
  {
    id: 13,
    slug: 'bookings-by-status',
    title: 'Booking Count Distribution by Lifecycle Status',
    category: 'GROUP BY and HAVING',
    concept: 'GROUP BY aggregation partitioning tuples into status buckets',
    difficulty: 'Intermediate',
    tags: ['GROUP BY', 'COUNT', 'Booking Reports'],
    sql: `SELECT 
    status AS booking_status,
    COUNT(*) AS total_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings), 1) AS percentage
FROM bookings
GROUP BY status
ORDER BY total_count DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects the group key: booking status.' },
      { line: 2, explanation: 'Counts rows within each status group.' },
      { line: 3, explanation: 'Calculates group percentage using scalar subquery.' },
      { line: 5, explanation: 'Partitions data into distinct status groups.' },
      { line: 6, explanation: 'Orders highest volume statuses first.' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Breakdown of bookings in each lifecycle stage with percentage share.',
    sample_output: {
      columns: ['booking_status', 'total_count', 'percentage'],
      rows: [
        ['completed', 50, 76.9],
        ['cancelled', 11, 16.9],
        ['pending', 1, 1.5],
        ['assigned', 1, 1.5],
        ['accepted', 1, 1.5],
        ['in_progress', 1, 1.5]
      ]
    },
    why_useful_in_taxi_app: 'Renders the pie chart / donut chart on the Admin Dashboard.',
    dbms_concept: 'Relational Partitioning via GROUP BY and Scalar Aggregation',
    sample_use_case: 'Operational health and conversion rate monitoring.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_bookings_by_status'
  },
  {
    id: 14,
    slug: 'customers-with-more-than-three-bookings',
    title: 'High-Volume Customers (GROUP BY + HAVING > 3)',
    category: 'GROUP BY and HAVING',
    concept: 'Filtering grouped records using HAVING predicate',
    difficulty: 'Intermediate',
    tags: ['GROUP BY', 'HAVING', 'Customer Reports'],
    sql: `SELECT 
    c.customer_id,
    c.full_name,
    c.phone,
    COUNT(b.booking_id) AS total_trips,
    COALESCE(SUM(b.final_fare), 0) AS total_spent
FROM customers c
JOIN bookings b ON c.customer_id = b.customer_id
GROUP BY c.customer_id, c.full_name, c.phone
HAVING COUNT(b.booking_id) > 3
ORDER BY total_trips DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects customer identification attributes.' },
      { line: 4, explanation: 'Aggregates booking count and total fare sum.' },
      { line: 7, explanation: 'Groups results per customer tuple.' },
      { line: 8, explanation: 'HAVING clause filters groups where booking count strictly exceeds 3.' },
      { line: 9, explanation: 'Sorts by most active customers.' }
    ],
    tables_involved: ['customers', 'bookings'],
    expected_output_description: 'Loyal customer list with trip volume exceeding 3 rides.',
    sample_output: {
      columns: ['customer_id', 'full_name', 'phone', 'total_trips', 'total_spent'],
      rows: [
        [1, 'Rahul Sharma', '+91 98765 43210', 10, 8420.00],
        [2, 'Priya Patel', '+91 98765 43211', 8, 6240.00],
        [3, 'Amit Verma', '+91 98765 43212', 7, 5890.00]
      ]
    },
    why_useful_in_taxi_app: 'Identifies VIP riders eligible for premium loyalty perks or monthly passes.',
    dbms_concept: 'Group Post-Filtering (HAVING vs WHERE distinction)',
    sample_use_case: 'Loyalty program tier qualification.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_top_customers'
  },

  // =========================================================================
  // 6. Subqueries
  // =========================================================================
  {
    id: 15,
    slug: 'highest-value-bookings-subquery',
    title: 'Bookings with Fare Above Overall Average (Subquery)',
    category: 'Subqueries',
    concept: 'Scalar subquery inside WHERE predicate',
    difficulty: 'Intermediate',
    tags: ['Subquery', 'AVG', 'Booking Reports'],
    sql: `SELECT 
    booking_id,
    customer_id,
    vehicle_type,
    pickup_location,
    destination_location,
    final_fare
FROM bookings
WHERE final_fare > (
    SELECT AVG(final_fare) 
    FROM bookings 
    WHERE status = 'completed'
)
ORDER BY final_fare DESC
LIMIT 15;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects booking route and final fare.' },
      { line: 7, explanation: 'Filters bookings where final fare exceeds the computed average.' },
      { line: 8, explanation: 'Scalar subquery computes the overall average completed fare dynamically.' },
      { line: 12, explanation: 'Orders highest ticket rides first.' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Rides that generated above-average revenue.',
    sample_output: {
      columns: ['booking_id', 'customer_id', 'vehicle_type', 'pickup_location', 'destination_location', 'final_fare'],
      rows: [
        [65, 3, 'luxury', 'Airport', 'Cyber City', 2150.00],
        [58, 2, 'luxury', 'Westfield', 'Airport', 1980.00]
      ]
    },
    why_useful_in_taxi_app: 'Helps analyze profitable long-distance or airport routes.',
    dbms_concept: 'Nested Scalar Subquery Evaluation',
    sample_use_case: 'High-value customer journey analysis.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 16,
    slug: 'correlated-subquery-customer-last-trip',
    title: 'Correlated Subquery: Customer Latest Booking Date',
    category: 'Subqueries',
    concept: 'Correlated subquery referencing outer query attribute',
    difficulty: 'Advanced',
    tags: ['Subquery', 'Customer Reports'],
    sql: `SELECT 
    c.customer_id,
    c.full_name,
    c.phone,
    (SELECT MAX(b.booking_time) 
     FROM bookings b 
     WHERE b.customer_id = c.customer_id) AS last_booking_time
FROM customers c
ORDER BY last_booking_time IS NULL, last_booking_time DESC
LIMIT 15;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects customer profile fields.' },
      { line: 4, explanation: 'Subquery references outer table column c.customer_id.' },
      { line: 5, explanation: 'Computes maximum timestamp for that specific customer.' },
      { line: 7, explanation: 'Outer table: customers c.' }
    ],
    tables_involved: ['customers', 'bookings'],
    expected_output_description: 'Customers listed with the exact timestamp of their most recent booking.',
    sample_output: {
      columns: ['customer_id', 'full_name', 'phone', 'last_booking_time'],
      rows: [
        [3, 'Amit Verma', '+91 98765 43212', '2026-10-13 10:30:00'],
        [1, 'Rahul Sharma', '+91 98765 43210', '2026-10-12 14:15:00']
      ]
    },
    why_useful_in_taxi_app: 'Enables customer churn detection by spotting riders who haven\'t booked recently.',
    dbms_concept: 'Correlated Subquery (Evaluated per tuple in outer relation)',
    sample_use_case: 'Customer retention and churn modeling.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 17,
    slug: 'exists-customers-with-reviews',
    title: 'Customers Who Wrote Reviews (EXISTS Predicate)',
    category: 'Subqueries',
    concept: 'Semi-Join optimization using EXISTS predicate',
    difficulty: 'Intermediate',
    tags: ['Subquery', 'Customer Reports'],
    sql: `SELECT 
    c.customer_id,
    c.full_name,
    c.phone
FROM customers c
WHERE EXISTS (
    SELECT 1 
    FROM reviews r 
    WHERE r.customer_id = c.customer_id
)
ORDER BY c.customer_id ASC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects customer details.' },
      { line: 5, explanation: 'EXISTS returns TRUE as soon as the first matching review row is encountered.' },
      { line: 7, explanation: 'Correlates review customer_id with outer customer tuple.' }
    ],
    tables_involved: ['customers', 'reviews'],
    expected_output_description: 'Customers who have contributed at least one review.',
    sample_output: {
      columns: ['customer_id', 'full_name', 'phone'],
      rows: [
        [1, 'Rahul Sharma', '+91 98765 43210'],
        [2, 'Priya Patel', '+91 98765 43211'],
        [3, 'Amit Verma', '+91 98765 43212']
      ]
    },
    why_useful_in_taxi_app: 'Filters vocal riders for customer feedback surveys or beta testing programs.',
    dbms_concept: 'Relational Semi-Join via EXISTS (Short-circuits evaluation on first match)',
    sample_use_case: 'Targeting engaged riders for quality research.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 7. Constraints and Relationships
  // =========================================================================
  {
    id: 18,
    slug: 'check-constraint-distance-demo',
    title: 'CHECK Constraint: Positive Distance Validation',
    category: 'Constraints and Relationships',
    concept: 'Domain Integrity & CHECK Constraints in MySQL 8',
    difficulty: 'Intermediate',
    tags: ['Constraints', 'Primary Key', 'Foreign Key'],
    sql: `-- Demonstrating CHECK (distance_km > 0) defined on bookings table.
-- The following statement intentionally violates the constraint and is rejected:
-- INSERT INTO bookings (customer_id, vehicle_type, pickup_location, destination_location, distance_km, estimated_fare)
-- VALUES (1, 'mini', 'Point A', 'Point B', -5.0, 50.0);
-- Error Code: 3819. Check constraint 'chk_booking_distance' is violated.

SELECT 
    tc.TABLE_NAME, 
    cc.CONSTRAINT_NAME, 
    cc.CHECK_CLAUSE 
FROM information_schema.CHECK_CONSTRAINTS cc
JOIN information_schema.TABLE_CONSTRAINTS tc 
  ON cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME AND cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
WHERE cc.CONSTRAINT_SCHEMA = 'taxi_service_db';`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Explanation of business rule and deliberate error demonstration.' },
      { line: 7, explanation: 'Queries system information schema joining CHECK_CONSTRAINTS and TABLE_CONSTRAINTS.' },
      { line: 11, explanation: 'Filters by our database schema name.' }
    ],
    tables_involved: ['information_schema.CHECK_CONSTRAINTS', 'information_schema.TABLE_CONSTRAINTS'],
    expected_output_description: 'List of active table-level CHECK constraints enforced by MySQL 8 engine.',
    sample_output: {
      columns: ['TABLE_NAME', 'CONSTRAINT_NAME', 'CHECK_CLAUSE'],
      rows: [
        ['bookings', 'chk_booking_distance', '(`distance_km` > 0)'],
        ['reviews', 'chk_review_rating', '(`rating` between 1 and 5)']
      ]
    },
    why_useful_in_taxi_app: 'Prevents negative distances or invalid ratings from ever entering the database.',
    dbms_concept: 'Domain Integrity & Schema-Level Assertion Constraints',
    sample_use_case: 'Data integrity validation during schema inspection.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 19,
    slug: 'foreign-key-action-demo',
    title: 'Inspect Foreign Keys and Referential Actions',
    category: 'Constraints and Relationships',
    concept: 'Referential Integrity: ON DELETE RESTRICT vs CASCADE vs SET NULL',
    difficulty: 'Intermediate',
    tags: ['Foreign Key', 'Constraints', 'Primary Key'],
    sql: `SELECT 
    k.TABLE_NAME,
    k.COLUMN_NAME,
    k.CONSTRAINT_NAME,
    k.REFERENCED_TABLE_NAME,
    k.REFERENCED_COLUMN_NAME,
    r.DELETE_RULE,
    r.UPDATE_RULE
FROM information_schema.KEY_COLUMN_USAGE k
JOIN information_schema.REFERENTIAL_CONSTRAINTS r 
  ON k.CONSTRAINT_NAME = r.CONSTRAINT_NAME AND k.CONSTRAINT_SCHEMA = r.CONSTRAINT_SCHEMA
WHERE k.CONSTRAINT_SCHEMA = 'taxi_service_db' AND k.REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY k.TABLE_NAME;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects foreign key names, referencing columns, and targets.' },
      { line: 6, explanation: 'Inspects DELETE_RULE (e.g. RESTRICT vs CASCADE).' },
      { line: 9, explanation: 'Joins system catalog tables.' },
      { line: 11, explanation: 'Filters for taxi_service_db foreign keys.' }
    ],
    tables_involved: ['information_schema.KEY_COLUMN_USAGE', 'information_schema.REFERENTIAL_CONSTRAINTS'],
    expected_output_description: 'Complete audit of every foreign key relationship in the database.',
    sample_output: {
      columns: ['TABLE_NAME', 'COLUMN_NAME', 'CONSTRAINT_NAME', 'REFERENCED_TABLE_NAME', 'REFERENCED_COLUMN_NAME', 'DELETE_RULE', 'UPDATE_RULE'],
      rows: [
        ['bookings', 'customer_id', 'fk_bookings_customer', 'customers', 'customer_id', 'RESTRICT', 'CASCADE'],
        ['bookings', 'driver_id', 'fk_bookings_driver', 'drivers', 'driver_id', 'RESTRICT', 'CASCADE'],
        ['vehicles', 'driver_id', 'fk_vehicles_driver', 'drivers', 'driver_id', 'SET NULL', 'CASCADE'],
        ['customers', 'user_id', 'fk_customers_user', 'users', 'user_id', 'CASCADE', 'CASCADE']
      ]
    },
    why_useful_in_taxi_app: 'Proves intentional architecture choices in viva defense (RESTRICT for audit trails).',
    dbms_concept: 'Referential Integrity & Foreign Key Cascade/Restrict Semantics',
    sample_use_case: 'Schema architecture review during project evaluation.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 8. Transactions
  // =========================================================================
  {
    id: 20,
    slug: 'transaction-booking-creation-demo',
    title: 'Atomic Transaction: Create Booking & Payment Ledger',
    category: 'Transactions',
    concept: 'ACID Properties (Atomicity, Consistency, Isolation, Durability)',
    difficulty: 'Advanced',
    tags: ['Transactions', 'INSERT'],
    sql: `-- Educational demonstration of atomic multi-table transaction with COMMIT / ROLLBACK
START TRANSACTION;

-- Step 1: Insert booking tuple
INSERT INTO bookings (customer_id, vehicle_type, pickup_location, destination_location, distance_km, estimated_fare, status) 
VALUES (1, 'sedan', 'Downtown Central', 'Airport BLR', 34.50, 718.00, 'pending');

-- Step 2: Grab generated ID
SET @new_booking_id = LAST_INSERT_ID();

-- Step 3: Insert synchronized payment row
INSERT INTO payments (booking_id, amount, payment_method, payment_status) 
VALUES (@new_booking_id, 718.00, 'card', 'pending');

-- If any step fails: ROLLBACK;
COMMIT;`,
    line_by_line_explanation: [
      { line: 2, explanation: 'Starts transaction boundary with repeatable read isolation.' },
      { line: 5, explanation: 'Creates the booking row.' },
      { line: 9, explanation: 'Captures the generated auto-increment identifier atomically.' },
      { line: 12, explanation: 'Creates the payment row linked 1:1 with booking_id.' },
      { line: 16, explanation: 'Commits all updates permanently to storage (Durability).' }
    ],
    tables_involved: ['bookings', 'payments'],
    expected_output_description: 'Either both booking and payment are saved, or neither is saved (All-or-Nothing).',
    sample_output: {
      columns: ['Operation', 'Status', 'ACID Guarantee'],
      rows: [
        ['START TRANSACTION', 'ACTIVE', 'Isolation'],
        ['INSERT bookings', 'OK', 'Consistency'],
        ['INSERT payments', 'OK', 'Atomicity'],
        ['COMMIT', 'COMMITTED', 'Durability']
      ]
    },
    why_useful_in_taxi_app: 'Guarantees no booking exists without an associated payment record.',
    dbms_concept: 'ACID Transactions & Two-Phase Write Consistency',
    sample_use_case: 'Executed on the backend whenever a customer requests a ride.',
    execution_type: 'educational',
    executable: false,
    report_key: null
  },

  // =========================================================================
  // 9. Views and Indexes
  // =========================================================================
  {
    id: 21,
    slug: 'view-booking-details-demo',
    title: 'Denormalized Master View: v_booking_details',
    category: 'Views and Indexes',
    concept: 'Database VIEW encapsulating 5-table join complexity',
    difficulty: 'Intermediate',
    tags: ['Views', 'SELECT', 'Booking Reports'],
    sql: `SELECT 
    booking_id,
    booking_status,
    customer_name,
    customer_phone,
    driver_name,
    vehicle_model,
    pickup_location,
    destination_location,
    estimated_fare,
    final_fare,
    payment_status,
    rating
FROM v_booking_details
ORDER BY booking_id DESC
LIMIT 15;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Queries the predefined view as if it were a native table.' },
      { line: 14, explanation: 'Source: v_booking_details view.' },
      { line: 15, explanation: 'Sorts newest bookings first.' }
    ],
    tables_involved: ['v_booking_details (bookings, customers, drivers, vehicles, payments, reviews)'],
    expected_output_description: 'Complete view results joining customer, driver, vehicle, and payment data.',
    sample_output: {
      columns: ['booking_id', 'booking_status', 'customer_name', 'customer_phone', 'driver_name', 'vehicle_model', 'pickup_location', 'destination_location', 'estimated_fare', 'final_fare', 'payment_status', 'rating'],
      rows: [
        [65, 'completed', 'Amit Verma', '+91 98765 43212', 'Vijay Shettigar', 'Mahindra XUV700', 'Airport', 'Cyber City', 1849.00, 1849.00, 'paid', 5],
        [64, 'completed', 'Rahul Sharma', '+91 98765 43210', 'Suresh Kumar', 'Maruti WagonR', 'Downtown', 'Airport', 718.00, 718.00, 'paid', 4]
      ]
    },
    why_useful_in_taxi_app: 'Simplifies application code by avoiding repetitive 5-table JOIN statements.',
    dbms_concept: 'View Abstraction & Logical Data Independence',
    sample_use_case: 'Backbone for Admin and Driver booking listing screens.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 22,
    slug: 'explain-index-utilization-demo',
    title: 'EXPLAIN Query Plan: Index Utilization Analysis',
    category: 'Views and Indexes',
    concept: 'Query Optimizer Execution Plan and Index Usage',
    difficulty: 'Advanced',
    tags: ['Indexes', 'SELECT', 'Booking Reports'],
    sql: `EXPLAIN SELECT booking_id, customer_id, estimated_fare 
FROM bookings 
WHERE customer_id = 1 AND status = 'completed';`,
    line_by_line_explanation: [
      { line: 1, explanation: 'EXPLAIN prefix instructs MySQL optimizer to output the access path.' },
      { line: 2, explanation: 'Filter predicates match the composite index (customer_id, status).' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Execution plan showing index key used (idx_bookings_customer_status) and type=ref.',
    sample_output: {
      columns: ['id', 'select_type', 'table', 'type', 'possible_keys', 'key', 'key_len', 'ref', 'rows', 'Extra'],
      rows: [
        [1, 'SIMPLE', 'bookings', 'ref', 'idx_bookings_status,idx_bookings_customer_status', 'idx_bookings_customer_status', '49', 'const,const', 10, 'Using index condition']
      ]
    },
    why_useful_in_taxi_app: 'Demonstrates to the examiner how indexes avoid expensive Full Table Scans (ALL).',
    dbms_concept: 'Query Optimization, B-Tree Indexes, and Execution Plans',
    sample_use_case: 'Database administrator performance tuning.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 10. Stored Procedures and Triggers
  // =========================================================================
  {
    id: 23,
    slug: 'call-stored-procedure-monthly-revenue',
    title: 'Call Stored Procedure: sp_monthly_revenue',
    category: 'Stored Procedures and Triggers',
    concept: 'Stored Procedure execution with parameters',
    difficulty: 'Intermediate',
    tags: ['Stored Procedures', 'Revenue Reports'],
    sql: `CALL sp_monthly_revenue(2026, 8);`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Invokes compiled stored procedure sp_monthly_revenue passing year 2026 and month 8.' }
    ],
    tables_involved: ['bookings', 'payments'],
    expected_output_description: 'Monthly summary record containing ride totals, completions, and gross revenue.',
    sample_output: {
      columns: ['report_year', 'report_month', 'total_rides_booked', 'completed_rides', 'cancelled_rides', 'total_revenue_collected', 'average_completed_fare'],
      rows: [
        [2026, 8, 18, 15, 3, 10780.00, 718.67]
      ]
    },
    why_useful_in_taxi_app: 'Encapsulates complex month-end accounting logic inside the database server.',
    dbms_concept: 'Procedural SQL (Stored Routine) with IN parameters',
    sample_use_case: 'Monthly finance audit reports.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 24,
    slug: 'trigger-definition-inspection',
    title: 'Inspect Trigger: Automatic Driver Availability Sync',
    category: 'Stored Procedures and Triggers',
    concept: 'Event-driven database triggers reacting to UPDATE statements',
    difficulty: 'Advanced',
    tags: ['Triggers', 'Driver Reports', 'Vehicle Availability'],
    sql: `SELECT 
    TRIGGER_NAME, 
    EVENT_MANIPULATION, 
    EVENT_OBJECT_TABLE, 
    ACTION_TIMING, 
    ACTION_STATEMENT 
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'taxi_service_db';`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects trigger metadata: timing, table, event, and definition.' },
      { line: 7, explanation: 'Filters information_schema by database name.' }
    ],
    tables_involved: ['information_schema.TRIGGERS'],
    expected_output_description: 'Active database trigger trg_after_booking_status_update.',
    sample_output: {
      columns: ['TRIGGER_NAME', 'EVENT_MANIPULATION', 'EVENT_OBJECT_TABLE', 'ACTION_TIMING', 'ACTION_STATEMENT'],
      rows: [
        ['trg_after_booking_status_update', 'UPDATE', 'bookings', 'AFTER', 'BEGIN IF NEW.status = "in_progress" ... END']
      ]
    },
    why_useful_in_taxi_app: 'Guarantees drivers and vehicles cannot be double-booked by keeping statuses synchronized.',
    dbms_concept: 'Active Database Triggers & Declarative State Synchronization',
    sample_use_case: 'Verifying automation logic during viva.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 11. Customer Management
  // =========================================================================
  {
    id: 25,
    slug: 'top-five-customers-by-bookings',
    title: 'Top 5 Customers by Booking Frequency',
    category: 'Customer Management',
    concept: 'Ranking and Top-N query pattern',
    difficulty: 'Intermediate',
    tags: ['Customer Reports', 'GROUP BY', 'ORDER BY'],
    sql: `SELECT 
    c.customer_id,
    c.full_name,
    c.phone,
    COUNT(b.booking_id) AS trip_count,
    COALESCE(SUM(b.final_fare), 0) AS total_spent
FROM customers c
JOIN bookings b ON c.customer_id = b.customer_id
GROUP BY c.customer_id, c.full_name, c.phone
ORDER BY trip_count DESC, total_spent DESC
LIMIT 5;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects customer profile info.' },
      { line: 4, explanation: 'Counts trips and sums spend.' },
      { line: 7, explanation: 'Groups by customer identity.' },
      { line: 8, explanation: 'Orders descending by frequency and monetary value.' },
      { line: 9, explanation: 'Restricts to Top 5 rows.' }
    ],
    tables_involved: ['customers', 'bookings'],
    expected_output_description: 'Top 5 frequent fliers of the taxi service.',
    sample_output: {
      columns: ['customer_id', 'full_name', 'phone', 'trip_count', 'total_spent'],
      rows: [
        [1, 'Rahul Sharma', '+91 98765 43210', 10, 8420.00],
        [2, 'Priya Patel', '+91 98765 43211', 8, 6240.00],
        [3, 'Amit Verma', '+91 98765 43212', 7, 5890.00],
        [4, 'Sneha Reddy', '+91 98765 43213', 6, 4920.00],
        [5, 'Vikram Singh', '+91 98765 43214', 6, 4810.00]
      ]
    },
    why_useful_in_taxi_app: 'Powers the Top Customers leaderboard widget on the Reports page.',
    dbms_concept: 'Top-N Filtering via Aggregation and Sort',
    sample_use_case: 'Reward distribution and VIP customer management.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_top_customers'
  },
  {
    id: 26,
    slug: 'one-customer-booking-history',
    title: 'Customer Detailed Booking History (Customer ID = 1)',
    category: 'Customer Management',
    concept: 'Parameterized History Retrieval for Rider Portal',
    difficulty: 'Beginner',
    tags: ['Customer Reports', 'Booking Reports', 'SELECT'],
    sql: `SELECT 
    b.booking_id,
    b.booking_time,
    b.pickup_location,
    b.destination_location,
    b.vehicle_type,
    b.distance_km,
    b.estimated_fare,
    b.final_fare,
    b.status,
    p.payment_status,
    p.payment_method
FROM bookings b
LEFT JOIN payments p ON b.booking_id = p.booking_id
WHERE b.customer_id = 1
ORDER BY b.booking_id DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Retrieves complete itinerary and fare breakdown.' },
      { line: 12, explanation: 'LEFT JOIN to payments.' },
      { line: 14, explanation: 'Restricts strictly to customer_id 1 (derived from JWT token).' }
    ],
    tables_involved: ['bookings', 'payments'],
    expected_output_description: 'Complete chronological trip log for customer 1.',
    sample_output: {
      columns: ['booking_id', 'booking_time', 'pickup_location', 'destination_location', 'vehicle_type', 'distance_km', 'estimated_fare', 'final_fare', 'status', 'payment_status', 'payment_method'],
      rows: [
        [64, '2026-10-12 14:15:00', 'Downtown', 'Airport', 'sedan', 34.50, 718.00, 718.00, 'completed', 'paid', 'card'],
        [57, '2026-10-01 09:30:00', 'Cyber City', 'Metro Mall', 'mini', 16.20, 275.00, 275.00, 'completed', 'paid', 'upi']
      ]
    },
    why_useful_in_taxi_app: 'Feeds the "My Bookings" page in the Customer Portal.',
    dbms_concept: 'Parameterized Equi-Join with Primary-Foreign Key filtering',
    sample_use_case: 'Customer checking ride receipts and past rides.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 12. Driver Management
  // =========================================================================
  {
    id: 27,
    slug: 'drivers-with-most-completed-rides',
    title: 'Drivers with Most Completed Rides & Gross Earnings',
    category: 'Driver Management',
    concept: 'Driver Performance Ranking & Aggregated Metrics',
    difficulty: 'Intermediate',
    tags: ['Driver Reports', 'GROUP BY', 'SUM', 'COUNT'],
    sql: `SELECT 
    d.driver_id,
    d.full_name AS driver_name,
    d.phone,
    d.license_number,
    COUNT(b.booking_id) AS completed_trips,
    COALESCE(SUM(b.final_fare), 0) AS gross_revenue_generated,
    ROUND(AVG(r.rating), 1) AS average_rating
FROM drivers d
JOIN bookings b ON d.driver_id = b.driver_id AND b.status = 'completed'
LEFT JOIN reviews r ON d.driver_id = r.driver_id
GROUP BY d.driver_id, d.full_name, d.phone, d.license_number
ORDER BY completed_trips DESC, gross_revenue_generated DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects driver credentials.' },
      { line: 5, explanation: 'Counts completed trips.' },
      { line: 6, explanation: 'Sums final fares for revenue generated.' },
      { line: 7, explanation: 'Computes driver average customer satisfaction rating.' },
      { line: 9, explanation: 'Filters for completed bookings.' },
      { line: 11, explanation: 'Orders highest performing drivers first.' }
    ],
    tables_involved: ['drivers', 'bookings', 'reviews'],
    expected_output_description: 'Driver leaderboard sorted by completed ride volume.',
    sample_output: {
      columns: ['driver_id', 'driver_name', 'phone', 'license_number', 'completed_trips', 'gross_revenue_generated', 'average_rating'],
      rows: [
        [1, 'Suresh Kumar', '+91 98111 11001', 'DL-04-2018-001234', 8, 6420.00, 4.8],
        [2, 'Ramesh Yadav', '+91 98111 11002', 'DL-04-2019-002345', 7, 5910.00, 4.7]
      ]
    },
    why_useful_in_taxi_app: 'Powers the "Top Drivers" analytics report and monthly bonus calculations.',
    dbms_concept: 'Multi-table Relational Aggregation with GROUP BY',
    sample_use_case: 'Driver performance review and monthly payout bonuses.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_top_drivers'
  },
  {
    id: 28,
    slug: 'driver-average-rating-report',
    title: 'Driver Average Rating and Review Breakdown',
    category: 'Driver Management',
    concept: 'Quality analysis combining review sentiment and metrics',
    difficulty: 'Intermediate',
    tags: ['Driver Reports', 'AVG', 'COUNT'],
    sql: `SELECT 
    d.driver_id,
    d.full_name AS driver_name,
    COUNT(r.review_id) AS review_count,
    ROUND(AVG(r.rating), 2) AS avg_rating,
    SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS five_star_count,
    SUM(CASE WHEN r.rating <= 2 THEN 1 ELSE 0 END) AS negative_ratings
FROM drivers d
LEFT JOIN reviews r ON d.driver_id = r.driver_id
GROUP BY d.driver_id, d.full_name
ORDER BY avg_rating IS NULL, avg_rating DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects driver identifier and name.' },
      { line: 3, explanation: 'Counts total customer reviews received.' },
      { line: 4, explanation: 'Calculates average rating out of 5.' },
      { line: 5, explanation: 'Conditional aggregation: counts 5-star ratings.' },
      { line: 6, explanation: 'Conditional aggregation: counts negative ratings (<= 2 stars).' }
    ],
    tables_involved: ['drivers', 'reviews'],
    expected_output_description: 'Driver scorecard showing customer satisfaction metrics.',
    sample_output: {
      columns: ['driver_id', 'driver_name', 'review_count', 'avg_rating', 'five_star_count', 'negative_ratings'],
      rows: [
        [1, 'Suresh Kumar', 4, 4.75, 3, 0],
        [2, 'Ramesh Yadav', 4, 4.50, 2, 0]
      ]
    },
    why_useful_in_taxi_app: 'Flag drivers with low satisfaction ratings for retraining.',
    dbms_concept: 'Conditional Aggregation using CASE expressions and AVG',
    sample_use_case: 'Quality assurance and rider safety audits.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_driver_ratings'
  },

  // =========================================================================
  // 13. Booking Management
  // =========================================================================
  {
    id: 29,
    slug: 'daily-booking-statistics',
    title: 'Daily Booking Statistics & Velocity',
    category: 'Booking Management',
    concept: 'Date truncation and time-series aggregation',
    difficulty: 'Intermediate',
    tags: ['Booking Reports', 'GROUP BY', 'COUNT'],
    sql: `SELECT 
    DATE(booking_time) AS booking_date,
    COUNT(*) AS total_rides_requested,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_rides,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_rides,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN final_fare ELSE 0 END), 0) AS daily_revenue
FROM bookings
GROUP BY DATE(booking_time)
ORDER BY booking_date DESC
LIMIT 14;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Truncates timestamps to day resolution using DATE().' },
      { line: 2, explanation: 'Counts total booking volume on that calendar day.' },
      { line: 3, explanation: 'Counts completions.' },
      { line: 4, explanation: 'Counts cancellations.' },
      { line: 5, explanation: 'Sums daily revenue.' },
      { line: 7, explanation: 'Groups by truncated date.' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Daily operational ride volume and cancellation breakdown.',
    sample_output: {
      columns: ['booking_date', 'total_rides_requested', 'completed_rides', 'cancelled_rides', 'daily_revenue'],
      rows: [
        ['2026-10-13', 2, 0, 0, 0.00],
        ['2026-10-12', 2, 2, 0, 1540.00]
      ]
    },
    why_useful_in_taxi_app: 'Feeds the daily trends chart on the Reports page.',
    dbms_concept: 'Temporal Grouping and Trend Analysis',
    sample_use_case: 'Tracking daily platform growth and demand surges.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_daily_bookings'
  },
  {
    id: 30,
    slug: 'cancellation-rate-analysis',
    title: 'Cancellation Rate and Reason Breakdown',
    category: 'Booking Management',
    concept: 'Ratio calculation and conditional grouping',
    difficulty: 'Intermediate',
    tags: ['Booking Reports', 'COUNT'],
    sql: `SELECT 
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count,
    ROUND(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS cancellation_rate_pct,
    cancelled_reason,
    COUNT(cancelled_reason) AS reason_count
FROM bookings
WHERE status = 'cancelled'
GROUP BY cancelled_reason;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Aggregates overall cancellations and counts per reason.' },
      { line: 3, explanation: 'Calculates platform-wide percentage of cancelled rides.' },
      { line: 4, explanation: 'Categorizes reason for cancellation.' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Cancellation percentages grouped by specific root causes.',
    sample_output: {
      columns: ['total_bookings', 'cancelled_count', 'cancellation_rate_pct', 'cancelled_reason', 'reason_count'],
      rows: [
        [6, 6, 100.0, 'Customer changed schedule', 5],
        [5, 5, 100.0, 'Driver delayed in heavy traffic', 5]
      ]
    },
    why_useful_in_taxi_app: 'Discovers whether customer cancellations stem from driver delays or scheduling friction.',
    dbms_concept: 'Proportion Calculation and Categorical Analysis',
    sample_use_case: 'Root cause analysis on driver no-shows and lost revenue.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_cancellation_rate'
  },

  // =========================================================================
  // 14. Vehicle Management
  // =========================================================================
  {
    id: 31,
    slug: 'available-vehicles-list',
    title: 'Fleet Availability by Vehicle Tier',
    category: 'Vehicle Management',
    concept: 'Filtering unassigned fleet assets',
    difficulty: 'Beginner',
    tags: ['Vehicle Availability', 'SELECT'],
    sql: `SELECT 
    v.vehicle_id,
    v.registration_number,
    v.model,
    v.vehicle_type,
    v.seats,
    v.status,
    d.full_name AS default_driver_name
FROM vehicles v
LEFT JOIN drivers d ON v.driver_id = d.driver_id
WHERE v.status = 'available'
ORDER BY v.vehicle_type, v.model;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects vehicle identity and specs.' },
      { line: 8, explanation: 'Filters for vehicles with available status.' },
      { line: 9, explanation: 'Orders systematically by vehicle tier.' }
    ],
    tables_involved: ['vehicles', 'drivers'],
    expected_output_description: 'Ready-to-dispatch vehicles with optional assigned driver.',
    sample_output: {
      columns: ['vehicle_id', 'registration_number', 'model', 'vehicle_type', 'seats', 'status', 'default_driver_name'],
      rows: [
        [1, 'KA-01-AB-1001', 'Maruti Suzuki WagonR', 'mini', 4, 'available', 'Suresh Kumar'],
        [2, 'KA-01-CD-2002', 'Hyundai Grand i10', 'mini', 4, 'available', 'Ramesh Yadav'],
        [4, 'KA-02-GH-4004', 'Maruti Suzuki Dzire', 'sedan', 4, 'available', 'Rajesh Hegde']
      ]
    },
    why_useful_in_taxi_app: 'Populates the assignment dropdown when admin dispatches a ride.',
    dbms_concept: 'Filtering on Enumerated Status and Left Outer Join',
    sample_use_case: 'Admin dispatch modal vehicle selection.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_vehicle_utilization'
  },
  {
    id: 32,
    slug: 'most-popular-vehicle-type',
    title: 'Most Popular Vehicle Types by Ride Demand & Revenue',
    category: 'Vehicle Management',
    concept: 'Multi-metric categorical ranking',
    difficulty: 'Intermediate',
    tags: ['Vehicle Availability', 'GROUP BY', 'Revenue Reports'],
    sql: `SELECT 
    b.vehicle_type,
    COUNT(b.booking_id) AS total_bookings_requested,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_rides,
    COALESCE(SUM(b.final_fare), 0) AS total_revenue_generated,
    ROUND(AVG(b.distance_km), 2) AS average_distance_km
FROM bookings b
GROUP BY b.vehicle_type
ORDER BY total_bookings_requested DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Vehicle tier group key.' },
      { line: 2, explanation: 'Total booking count requested in this tier.' },
      { line: 4, explanation: 'Total revenue collected.' },
      { line: 7, explanation: 'Orders highest volume tiers first.' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Comparative performance table of mini, sedan, suv, and luxury vehicles.',
    sample_output: {
      columns: ['vehicle_type', 'total_bookings_requested', 'completed_rides', 'total_revenue_generated', 'average_distance_km'],
      rows: [
        ['sedan', 17, 13, 10240.00, 20.40],
        ['suv', 17, 13, 13420.00, 22.10],
        ['mini', 16, 12, 6120.00, 18.20],
        ['luxury', 15, 12, 19840.00, 26.50]
      ]
    },
    why_useful_in_taxi_app: 'Fleet procurement strategy: dictates which vehicle types to acquire next.',
    dbms_concept: 'Multi-dimensional Group Aggregation',
    sample_use_case: 'Fleet management investment analysis.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_vehicle_utilization'
  },

  // =========================================================================
  // 15. Payment and Revenue Reports
  // =========================================================================
  {
    id: 33,
    slug: 'monthly-revenue-trends',
    title: 'Monthly Revenue & Ride Volume Trends',
    category: 'Payment and Revenue Reports',
    concept: 'Temporal Grouping by Year and Month',
    difficulty: 'Intermediate',
    tags: ['Revenue Reports', 'GROUP BY', 'SUM'],
    sql: `SELECT 
    DATE_FORMAT(b.booking_time, '%Y-%m') AS formatted_month,
    DATE_FORMAT(b.booking_time, '%M %Y') AS month_name,
    COUNT(b.booking_id) AS total_rides_booked,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_rides,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_rides,
    COALESCE(SUM(CASE WHEN p.payment_status = 'paid' THEN p.amount ELSE 0 END), 0) AS gross_revenue
FROM bookings b
LEFT JOIN payments p ON b.booking_id = p.booking_id
GROUP BY formatted_month, month_name
ORDER BY formatted_month ASC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Formats dates into sortable YYYY-MM string.' },
      { line: 2, explanation: 'Formats human-readable Month Year.' },
      { line: 3, explanation: 'Counts ride volume.' },
      { line: 6, explanation: 'Sums verified paid amounts.' },
      { line: 9, explanation: 'Groups by month intervals.' }
    ],
    tables_involved: ['bookings', 'payments'],
    expected_output_description: 'Month-over-month operational growth metrics.',
    sample_output: {
      columns: ['formatted_month', 'month_name', 'total_rides_booked', 'completed_rides', 'cancelled_rides', 'gross_revenue'],
      rows: [
        ['2026-06', 'June 2026', 6, 5, 1, 3850.00],
        ['2026-07', 'July 2026', 19, 15, 3, 11420.00],
        ['2026-08', 'August 2026', 18, 15, 3, 10780.00],
        ['2026-09', 'September 2026', 18, 14, 4, 11200.00],
        ['2026-10', 'October 2026', 4, 1, 0, 2370.00]
      ]
    },
    why_useful_in_taxi_app: 'Powers the Monthly Revenue line chart on the Admin Dashboard.',
    dbms_concept: 'Time-Series Aggregation & Date Format Functions',
    sample_use_case: 'Quarterly financial reports and board presentations.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_monthly_revenue'
  },
  {
    id: 34,
    slug: 'payment-method-distribution',
    title: 'Payment Method Breakdown (Cash vs Card vs UPI)',
    category: 'Payment and Revenue Reports',
    concept: 'Categorical distribution and settlement metrics',
    difficulty: 'Intermediate',
    tags: ['Revenue Reports', 'GROUP BY'],
    sql: `SELECT 
    payment_method,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_value,
    ROUND(SUM(amount) * 100.0 / (SELECT SUM(amount) FROM payments), 1) AS share_pct,
    SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS settled_transactions,
    SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) AS pending_transactions
FROM payments
GROUP BY payment_method
ORDER BY total_value DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Group key: payment channel (cash, card, upi).' },
      { line: 2, explanation: 'Counts transactions.' },
      { line: 4, explanation: 'Calculates monetary share using scalar subquery.' }
    ],
    tables_involved: ['payments'],
    expected_output_description: 'Comparison of rider payment preferences and settlement status.',
    sample_output: {
      columns: ['payment_method', 'transaction_count', 'total_value', 'share_pct', 'settled_transactions', 'pending_transactions'],
      rows: [
        ['card', 22, 17820.00, 36.5, 17, 2],
        ['upi', 22, 16940.00, 34.7, 18, 1],
        ['cash', 21, 14120.00, 28.9, 15, 1]
      ]
    },
    why_useful_in_taxi_app: 'Audits payment gateway fee exposure and cash collection accuracy.',
    dbms_concept: 'Payment Gateway Reconciliation & Categorical Shares',
    sample_use_case: 'Payment processing partner contract negotiations.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },

  // =========================================================================
  // 16. Advanced DBMS Queries
  // =========================================================================
  {
    id: 35,
    slug: 'window-function-driver-dense-rank',
    title: 'Window Function: DENSE_RANK() Drivers by Revenue',
    category: 'Advanced DBMS Queries',
    concept: 'Analytic Window Functions (DENSE_RANK() OVER)',
    difficulty: 'Advanced',
    tags: ['Driver Reports', 'Revenue Reports', 'ORDER BY'],
    sql: `SELECT 
    d.driver_id,
    d.full_name AS driver_name,
    COUNT(b.booking_id) AS completed_trips,
    COALESCE(SUM(b.final_fare), 0) AS total_revenue,
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(b.final_fare), 0) DESC) AS revenue_rank
FROM drivers d
JOIN bookings b ON d.driver_id = b.driver_id AND b.status = 'completed'
GROUP BY d.driver_id, d.full_name
ORDER BY revenue_rank ASC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects driver credentials.' },
      { line: 4, explanation: 'Sums completed fares.' },
      { line: 5, explanation: 'Window Function: Computes consecutive dense ranks based on total revenue.' },
      { line: 8, explanation: 'Groups before window function evaluation.' }
    ],
    tables_involved: ['drivers', 'bookings'],
    expected_output_description: 'Driver performance leaderboard with contiguous ranking ranks.',
    sample_output: {
      columns: ['driver_id', 'driver_name', 'completed_trips', 'total_revenue', 'revenue_rank'],
      rows: [
        [1, 'Suresh Kumar', 8, 6420.00, 1],
        [2, 'Ramesh Yadav', 7, 5910.00, 2],
        [3, 'Anil Gowda', 7, 5740.00, 3]
      ]
    },
    why_useful_in_taxi_app: 'Awards performance incentives without tie-ranking gaps.',
    dbms_concept: 'OLAP Window Functions & Partition Ranking',
    sample_use_case: 'Quarterly driver incentive league table.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 36,
    slug: 'case-expression-customer-segmentation',
    title: 'CASE Expression: Customer Value Segmentation',
    category: 'Advanced DBMS Queries',
    concept: 'Conditional CASE expressions for business logic segmentation',
    difficulty: 'Intermediate',
    tags: ['Customer Reports', 'GROUP BY'],
    sql: `SELECT 
    c.customer_id,
    c.full_name,
    COUNT(b.booking_id) AS total_bookings,
    COALESCE(SUM(b.final_fare), 0) AS total_spend,
    CASE 
        WHEN COUNT(b.booking_id) >= 8 THEN 'Platinum Tier'
        WHEN COUNT(b.booking_id) >= 5 THEN 'Gold Tier'
        WHEN COUNT(b.booking_id) >= 2 THEN 'Silver Tier'
        WHEN COUNT(b.booking_id) = 1 THEN 'Bronze Tier'
        ELSE 'Inactive'
    END AS customer_loyalty_segment
FROM customers c
LEFT JOIN bookings b ON c.customer_id = b.customer_id
GROUP BY c.customer_id, c.full_name
ORDER BY total_spend DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects customer identity.' },
      { line: 5, explanation: 'Evaluates CASE conditions sequentially from top to bottom.' },
      { line: 6, explanation: 'Classifies customers based on booking volume thresholds.' }
    ],
    tables_involved: ['customers', 'bookings'],
    expected_output_description: 'Customer list with automated loyalty tier classification.',
    sample_output: {
      columns: ['customer_id', 'full_name', 'total_bookings', 'total_spend', 'customer_loyalty_segment'],
      rows: [
        [1, 'Rahul Sharma', 10, 8420.00, 'Platinum Tier'],
        [2, 'Priya Patel', 8, 6240.00, 'Platinum Tier'],
        [3, 'Amit Verma', 7, 5890.00, 'Gold Tier'],
        [11, 'Arjun Mehta', 0, 0.00, 'Inactive']
      ]
    },
    why_useful_in_taxi_app: 'Drives personalized customer marketing and automated tier upgrades.',
    dbms_concept: 'Declarative Conditional Logic via CASE Expressions',
    sample_use_case: 'Dynamic loyalty program segmentation.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 37,
    slug: 'normalization-3nf-proof-query',
    title: '3NF Normalization Proof & Foreign Key Integrity',
    category: 'Advanced DBMS Queries',
    concept: 'Third Normal Form (3NF) relational design validation',
    difficulty: 'Advanced',
    tags: ['Normalization', 'Primary Key', 'Foreign Key'],
    sql: `-- Demonstrating 3NF: No Transitive Dependency (X -> Y and Y -> Z).
-- Fare calculation rules are isolated in fare_rates (vehicle_type -> rates),
-- while bookings only stores vehicle_type and references foreign keys.
SELECT 
    b.booking_id,
    b.vehicle_type,
    fr.base_fare,
    fr.per_km_rate,
    b.distance_km,
    b.estimated_fare,
    ROUND(fr.base_fare + (b.distance_km * fr.per_km_rate), 2) AS formula_base_plus_km
FROM bookings b
JOIN fare_rates fr ON b.vehicle_type = fr.vehicle_type
LIMIT 10;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Explains relational decomposition eliminating transitive functional dependency.' },
      { line: 4, explanation: 'Selects booking and joins the rate matrix relation.' },
      { line: 11, explanation: 'Joins fare_rates on candidate key vehicle_type.' }
    ],
    tables_involved: ['bookings', 'fare_rates'],
    expected_output_description: 'Comparison of booking fare against the isolated fare rate parameters.',
    sample_output: {
      columns: ['booking_id', 'vehicle_type', 'base_fare', 'per_km_rate', 'distance_km', 'estimated_fare', 'formula_base_plus_km'],
      rows: [
        [1, 'mini', 50.00, 12.00, 34.50, 567.00, 464.00],
        [2, 'sedan', 80.00, 16.00, 16.20, 394.00, 339.20]
      ]
    },
    why_useful_in_taxi_app: 'Essential viva explanation demonstrating why rates are not repeated in bookings.',
    dbms_concept: 'Functional Dependencies, 2NF, and 3NF Normalization',
    sample_use_case: 'Academic examination and viva voce discussion.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 38,
    slug: 'all-bookings-master-query',
    title: 'All Bookings Master View with Pagination and Filtering',
    category: 'Booking Management',
    concept: 'Comprehensive master query for admin operations',
    difficulty: 'Beginner',
    tags: ['Booking Reports', 'SELECT'],
    sql: `SELECT 
    b.booking_id,
    b.booking_time,
    b.status,
    b.pickup_location,
    b.destination_location,
    b.vehicle_type,
    b.distance_km,
    b.estimated_fare,
    b.final_fare,
    c.full_name AS customer_name,
    d.full_name AS driver_name
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
LEFT JOIN drivers d ON b.driver_id = d.driver_id
ORDER BY b.booking_id DESC
LIMIT 50;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects booking identifiers, route, vehicle, and rider information.' },
      { line: 12, explanation: 'Joins customers.' },
      { line: 13, explanation: 'LEFT JOINs drivers.' },
      { line: 15, explanation: 'Limits output to 50 rows.' }
    ],
    tables_involved: ['bookings', 'customers', 'drivers'],
    expected_output_description: 'Master list of bookings for the admin control console.',
    sample_output: {
      columns: ['booking_id', 'booking_time', 'status', 'pickup_location', 'destination_location', 'vehicle_type', 'distance_km', 'estimated_fare', 'final_fare', 'customer_name', 'driver_name'],
      rows: [
        [65, '2026-10-13 10:30:00', 'completed', 'Airport', 'Cyber City', 'luxury', 42.10, 1849.00, 1849.00, 'Amit Verma', 'Vijay Shettigar']
      ]
    },
    why_useful_in_taxi_app: 'Used directly by the Admin Bookings Management page.',
    dbms_concept: 'Master-Detail Relational Extraction',
    sample_use_case: 'Admin booking search and filter console.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 39,
    slug: 'average-booking-fare-by-vehicle',
    title: 'Average Fare and Trip Distance by Vehicle Category',
    category: 'Aggregate Functions',
    concept: 'Multi-column aggregations partitioned by category',
    difficulty: 'Intermediate',
    tags: ['AVG', 'Aggregate Functions', 'Vehicle Availability'],
    sql: `SELECT 
    vehicle_type,
    COUNT(*) AS total_trips,
    ROUND(AVG(distance_km), 2) AS avg_distance_km,
    ROUND(AVG(estimated_fare), 2) AS avg_estimated_fare,
    ROUND(AVG(final_fare), 2) AS avg_final_fare
FROM bookings
WHERE status = 'completed'
GROUP BY vehicle_type
ORDER BY avg_final_fare DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Groups by vehicle class.' },
      { line: 3, explanation: 'Averages trip distances.' },
      { line: 4, explanation: 'Averages estimated and final fares.' }
    ],
    tables_involved: ['bookings'],
    expected_output_description: 'Average ticket price and distance broken down per vehicle class.',
    sample_output: {
      columns: ['vehicle_type', 'total_trips', 'avg_distance_km', 'avg_estimated_fare', 'avg_final_fare'],
      rows: [
        ['luxury', 12, 26.50, 1653.33, 1653.33],
        ['suv', 13, 22.10, 1032.31, 1032.31],
        ['sedan', 13, 20.40, 787.69, 787.69],
        ['mini', 12, 18.20, 510.00, 510.00]
      ]
    },
    why_useful_in_taxi_app: 'Helps price sensitivity adjustments for different user segments.',
    dbms_concept: 'Categorical Group Aggregation and Mean Estimation',
    sample_use_case: 'Pricing elasticity and fare structure review.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 40,
    slug: 'nested-subquery-highest-rated-drivers',
    title: 'Drivers with Above-Average Customer Satisfaction Rating',
    category: 'Subqueries',
    concept: 'Nested subquery filtering drivers based on overall rating baseline',
    difficulty: 'Intermediate',
    tags: ['Subquery', 'AVG', 'Driver Reports'],
    sql: `SELECT 
    d.driver_id,
    d.full_name AS driver_name,
    d.phone,
    ROUND(AVG(r.rating), 2) AS driver_rating
FROM drivers d
JOIN reviews r ON d.driver_id = r.driver_id
GROUP BY d.driver_id, d.full_name, d.phone
HAVING AVG(r.rating) >= (
    SELECT AVG(rating) FROM reviews
)
ORDER BY driver_rating DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects driver credentials.' },
      { line: 4, explanation: 'Averages driver rating.' },
      { line: 6, explanation: 'HAVING filters drivers whose average meets or beats the global rating.' },
      { line: 7, explanation: 'Scalar subquery computes the overall platform rating average.' }
    ],
    tables_involved: ['drivers', 'reviews'],
    expected_output_description: 'Star drivers whose ratings surpass the company-wide benchmark.',
    sample_output: {
      columns: ['driver_id', 'driver_name', 'phone', 'driver_rating'],
      rows: [
        [1, 'Suresh Kumar', '+91 98111 11001', 4.75],
        [3, 'Anil Gowda', '+91 98111 11003', 4.67]
      ]
    },
    why_useful_in_taxi_app: 'Identifies drivers qualified to be dispatched for Luxury tier bookings.',
    dbms_concept: 'HAVING Clause with Nested Scalar Subquery',
    sample_use_case: 'Premium tier driver qualification.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 41,
    slug: 'inner-join-demo',
    title: 'INNER JOIN: Only Bookings with Both Driver and Vehicle Assigned',
    category: 'Joins',
    concept: 'Strict INNER JOIN discarding tuples with NULL foreign keys',
    difficulty: 'Intermediate',
    tags: ['INNER JOIN', 'JOIN', 'Driver Reports', 'Vehicle Availability'],
    sql: `SELECT 
    b.booking_id,
    b.status,
    c.full_name AS customer,
    d.full_name AS driver,
    v.model AS vehicle,
    v.registration_number
FROM bookings b
INNER JOIN customers c ON b.customer_id = c.customer_id
INNER JOIN drivers d ON b.driver_id = d.driver_id
INNER JOIN vehicles v ON b.vehicle_id = v.vehicle_id
ORDER BY b.booking_id DESC
LIMIT 20;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects booking, customer, driver, and vehicle attributes.' },
      { line: 9, explanation: 'Strict INNER JOIN requires non-null driver_id and vehicle_id.' }
    ],
    tables_involved: ['bookings', 'customers', 'drivers', 'vehicles'],
    expected_output_description: 'Only bookings where resource allocation is 100% complete.',
    sample_output: {
      columns: ['booking_id', 'status', 'customer', 'driver', 'vehicle', 'registration_number'],
      rows: [
        [65, 'completed', 'Amit Verma', 'Vijay Shettigar', 'Mahindra XUV700', 'KA-04-MN-7007'],
        [64, 'completed', 'Rahul Sharma', 'Suresh Kumar', 'Maruti WagonR', 'KA-01-AB-1001']
      ]
    },
    why_useful_in_taxi_app: 'Filters out unassigned or pending rides for driver payout processing.',
    dbms_concept: 'Relational Intersection via Multi-way INNER JOIN',
    sample_use_case: 'Driver dispatch verification.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 42,
    slug: 'left-join-demo',
    title: 'LEFT JOIN: All Vehicles Regardless of Driver Assignment',
    category: 'Joins',
    concept: 'LEFT OUTER JOIN preserving all left relation tuples',
    difficulty: 'Intermediate',
    tags: ['LEFT JOIN', 'JOIN', 'Vehicle Availability'],
    sql: `SELECT 
    v.vehicle_id,
    v.model,
    v.registration_number,
    v.vehicle_type,
    v.status AS vehicle_status,
    COALESCE(d.full_name, 'Unassigned / Spare') AS assigned_driver
FROM vehicles v
LEFT JOIN drivers d ON v.driver_id = d.driver_id
ORDER BY v.vehicle_id ASC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects vehicle details.' },
      { line: 6, explanation: 'COALESCE replaces NULL values with friendly label.' },
      { line: 8, explanation: 'LEFT JOIN ensures unassigned vehicles are never dropped.' }
    ],
    tables_involved: ['vehicles', 'drivers'],
    expected_output_description: 'Full vehicle inventory showing which cars have assigned drivers.',
    sample_output: {
      columns: ['vehicle_id', 'model', 'registration_number', 'vehicle_type', 'vehicle_status', 'assigned_driver'],
      rows: [
        [1, 'Maruti WagonR', 'KA-01-AB-1001', 'mini', 'available', 'Suresh Kumar'],
        [5, 'Hyundai Verna', 'KA-03-IJ-5005', 'sedan', 'available', 'Unassigned / Spare']
      ]
    },
    why_useful_in_taxi_app: 'Identifies unallocated vehicles sitting idle in company parking bays.',
    dbms_concept: 'Left Outer Join and Missing Information (NULL) Representation',
    sample_use_case: 'Fleet asset utilization audit.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: 'report_vehicle_utilization'
  },
  {
    id: 43,
    slug: 'unique-constraint-violation-demo',
    title: 'Inspect UNIQUE Constraints on Vehicle & User Tables',
    category: 'Constraints and Relationships',
    concept: 'Candidate Keys and UNIQUE Constraint Enforcement',
    difficulty: 'Intermediate',
    tags: ['Constraints', 'Primary Key'],
    sql: `SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    CONSTRAINT_NAME 
FROM information_schema.KEY_COLUMN_USAGE 
WHERE CONSTRAINT_SCHEMA = 'taxi_service_db' 
  AND CONSTRAINT_NAME != 'PRIMARY' 
  AND REFERENCED_TABLE_NAME IS NULL
ORDER BY TABLE_NAME;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects unique columns defined on schemas.' },
      { line: 6, explanation: 'Filters for UNIQUE indexes that are not Primary Keys or Foreign Keys.' }
    ],
    tables_involved: ['information_schema.KEY_COLUMN_USAGE'],
    expected_output_description: 'List of all candidate keys enforced with UNIQUE indexes.',
    sample_output: {
      columns: ['TABLE_NAME', 'COLUMN_NAME', 'CONSTRAINT_NAME'],
      rows: [
        ['customers', 'phone', 'phone'],
        ['drivers', 'license_number', 'license_number'],
        ['drivers', 'phone', 'phone'],
        ['users', 'email', 'email'],
        ['vehicles', 'registration_number', 'registration_number']
      ]
    },
    why_useful_in_taxi_app: 'Guarantees no two users have the same email or two vehicles the same license plate.',
    dbms_concept: 'Candidate Keys, Uniqueness Invariants, and Index Enforcement',
    sample_use_case: 'System integrity review during project evaluation.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 44,
    slug: 'view-definition-inspection',
    title: 'Inspect Database View Definition in Information Schema',
    category: 'Views and Indexes',
    concept: 'View Metaschema and Check Option settings',
    difficulty: 'Intermediate',
    tags: ['Views', 'SELECT'],
    sql: `SELECT 
    TABLE_NAME AS view_name, 
    IS_UPDATABLE, 
    CHECK_OPTION 
FROM information_schema.VIEWS 
WHERE TABLE_SCHEMA = 'taxi_service_db';`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Queries system views table.' },
      { line: 5, explanation: 'Filters for taxi_service_db.' }
    ],
    tables_involved: ['information_schema.VIEWS'],
    expected_output_description: 'Metadata regarding created database views and their updatability status.',
    sample_output: {
      columns: ['view_name', 'IS_UPDATABLE', 'CHECK_OPTION'],
      rows: [
        ['v_booking_details', 'NO', 'NONE']
      ]
    },
    why_useful_in_taxi_app: 'Confirms view is marked read-only because it joins multiple base tables.',
    dbms_concept: 'View Updatability Rules (Views with joins cannot be updated directly)',
    sample_use_case: 'DBMS architecture inspection.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 45,
    slug: 'index-coverage-audit',
    title: 'Audit All Indexes in taxi_service_db Schema',
    category: 'Views and Indexes',
    concept: 'Index Cardinality and Secondary Index Architecture',
    difficulty: 'Intermediate',
    tags: ['Indexes', 'Primary Key'],
    sql: `SELECT 
    TABLE_NAME, 
    INDEX_NAME, 
    NON_UNIQUE, 
    COLUMN_NAME, 
    SEQ_IN_INDEX, 
    INDEX_TYPE 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'taxi_service_db'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Inspects index names, column orders, and index types (BTREE).' },
      { line: 7, explanation: 'Filters statistics for taxi_service_db.' }
    ],
    tables_involved: ['information_schema.STATISTICS'],
    expected_output_description: 'Complete audit of primary, unique, and secondary performance indexes.',
    sample_output: {
      columns: ['TABLE_NAME', 'INDEX_NAME', 'NON_UNIQUE', 'COLUMN_NAME', 'SEQ_IN_INDEX', 'INDEX_TYPE'],
      rows: [
        ['bookings', 'PRIMARY', 0, 'booking_id', 1, 'BTREE'],
        ['bookings', 'idx_bookings_customer_status', 1, 'customer_id', 1, 'BTREE'],
        ['bookings', 'idx_bookings_customer_status', 1, 'status', 2, 'BTREE'],
        ['bookings', 'idx_bookings_status', 1, 'status', 1, 'BTREE']
      ]
    },
    why_useful_in_taxi_app: 'Proves presence of all required secondary performance indexes to examiner.',
    dbms_concept: 'B+ Tree Index Architecture, Composite Keys, and Search Trees',
    sample_use_case: 'Database administrator performance review.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 46,
    slug: 'stored-procedure-catalog-inspection',
    title: 'Inspect Stored Routine Routines & Parameters',
    category: 'Stored Procedures and Triggers',
    concept: 'Stored Routine Catalog in MySQL Data Dictionary',
    difficulty: 'Intermediate',
    tags: ['Stored Procedures'],
    sql: `SELECT 
    ROUTINE_NAME, 
    ROUTINE_TYPE, 
    DATA_TYPE AS return_type, 
    ROUTINE_DEFINITION 
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'taxi_service_db';`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects procedure and function names, types, and SQL body.' },
      { line: 6, explanation: 'Filters for taxi_service_db schema.' }
    ],
    tables_involved: ['information_schema.ROUTINES'],
    expected_output_description: 'Lists sp_assign_driver and sp_monthly_revenue procedures.',
    sample_output: {
      columns: ['ROUTINE_NAME', 'ROUTINE_TYPE', 'return_type', 'ROUTINE_DEFINITION'],
      rows: [
        ['sp_assign_driver', 'PROCEDURE', 'NULL', 'BEGIN DECLARE v_booking_status ... END'],
        ['sp_monthly_revenue', 'PROCEDURE', 'NULL', 'BEGIN SELECT p_year ... END']
      ]
    },
    why_useful_in_taxi_app: 'Verifies stored procedures are properly compiled inside the DBMS server.',
    dbms_concept: 'Database Programmability and Stored Code Modules',
    sample_use_case: 'Schema consistency inspection.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 47,
    slug: 'active-trips-monitoring',
    title: 'Real-Time Active Trips Monitoring (Assigned, Accepted, In Progress)',
    category: 'Booking Management',
    concept: 'Real-time state monitoring with multi-table resolution',
    difficulty: 'Beginner',
    tags: ['Booking Reports', 'Driver Reports', 'Vehicle Availability'],
    sql: `SELECT 
    b.booking_id,
    b.status,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    d.full_name AS driver_name,
    d.phone AS driver_phone,
    v.model AS vehicle_model,
    v.registration_number,
    b.pickup_location,
    b.destination_location,
    b.pickup_time
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
LEFT JOIN drivers d ON b.driver_id = d.driver_id
LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
WHERE b.status IN ('assigned', 'accepted', 'in_progress')
ORDER BY b.booking_id DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Projects active ride dispatch details.' },
      { line: 13, explanation: 'Filters for live operational stages in the state machine.' }
    ],
    tables_involved: ['bookings', 'customers', 'drivers', 'vehicles'],
    expected_output_description: 'All rides currently in transit or dispatched to a driver.',
    sample_output: {
      columns: ['booking_id', 'status', 'customer_name', 'customer_phone', 'driver_name', 'driver_phone', 'vehicle_model', 'registration_number', 'pickup_location', 'destination_location', 'pickup_time'],
      rows: [
        [63, 'in_progress', 'Amit Verma', '+91 98765 43212', 'Anil Gowda', '+91 98111 11003', 'Honda Amaze', 'KA-02-EF-3003', 'Downtown', 'Airport', '2026-10-13 10:15:00'],
        [62, 'accepted', 'Priya Patel', '+91 98765 43211', 'Ramesh Yadav', '+91 98111 11002', 'Hyundai i10', 'KA-01-CD-2002', 'Cyber City', 'Metro Mall', 'NULL']
      ]
    },
    why_useful_in_taxi_app: 'Powers the Admin live dispatch board and active rides counter.',
    dbms_concept: 'State Machine Predicates in Relational Queries',
    sample_use_case: 'Real-time dispatch operation surveillance.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  },
  {
    id: 48,
    slug: 'unpaid-pending-payments-audit',
    title: 'Audit Pending Payments for Completed Trips',
    category: 'Payment and Revenue Reports',
    concept: 'Reconciliation query identifying outstanding accounts receivable',
    difficulty: 'Intermediate',
    tags: ['Revenue Reports', 'SELECT'],
    sql: `SELECT 
    p.payment_id,
    p.booking_id,
    p.amount,
    p.payment_method,
    p.payment_status,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    b.completed_at
FROM payments p
JOIN bookings b ON p.booking_id = b.booking_id
JOIN customers c ON b.customer_id = c.customer_id
WHERE b.status = 'completed' AND p.payment_status != 'paid'
ORDER BY p.payment_id DESC;`,
    line_by_line_explanation: [
      { line: 1, explanation: 'Selects unpaid payment rows for completed rides.' },
      { line: 10, explanation: 'Enforces condition: trip completed but payment not settled.' }
    ],
    tables_involved: ['payments', 'bookings', 'customers'],
    expected_output_description: 'Discrepancy list of completed rides where cash or payment has not been confirmed.',
    sample_output: {
      columns: ['payment_id', 'booking_id', 'amount', 'payment_method', 'payment_status', 'customer_name', 'customer_phone', 'completed_at'],
      rows: []
    },
    why_useful_in_taxi_app: 'Alerts operations when cash payments haven\'t been handed over by drivers.',
    dbms_concept: 'Exception Reporting and Relational Discrepancy Audits',
    sample_use_case: 'End-of-day cash reconciliation.',
    execution_type: 'used_by_application',
    executable: true,
    report_key: null
  }
];

module.exports = {
  QUERY_CATALOG
};
