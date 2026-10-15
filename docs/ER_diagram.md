# Entity-Relationship (ER) Diagram

Taxi Service Management System database model adhering strictly to Third Normal Form (3NF), InnoDB storage engine, foreign keys, cascade/restrict rules, unique constraints, and check constraints.

## Mermaid ER Diagram

```mermaid
erDiagram
    users ||--o| customers : "has profile (1:1)"
    users ||--o| drivers : "has profile (1:1)"
    customers ||--o{ bookings : "places (1:N)"
    drivers ||--o{ bookings : "operates (1:N)"
    vehicles ||--o{ bookings : "assigned to (1:N)"
    fare_rates ||..o{ bookings : "rates apply (1:N)"
    bookings ||--|| payments : "settled by (1:1)"
    bookings ||--o| reviews : "rated by (1:1)"
    customers ||--o{ reviews : "writes (1:N)"
    drivers ||--o{ reviews : "receives (1:N)"

    users {
        int user_id PK
        varchar email UK
        varchar password_hash
        enum role "ADMIN, CUSTOMER, DRIVER"
        enum status "ACTIVE, BLOCKED"
        timestamp created_at
    }

    customers {
        int customer_id PK
        int user_id FK, UK
        varchar name
        varchar phone UK
        varchar address
        timestamp created_at
    }

    drivers {
        int driver_id PK
        int user_id FK, UK
        varchar name
        varchar phone UK
        varchar license_number UK
        enum availability_status "AVAILABLE, ON_TRIP, OFFLINE"
        timestamp created_at
    }

    vehicles {
        int vehicle_id PK
        varchar plate_number UK
        varchar model
        enum vehicle_type "MINI, SEDAN, SUV"
        tinyint capacity
        enum status "AVAILABLE, ON_TRIP, MAINTENANCE"
        timestamp created_at
    }

    fare_rates {
        int rate_id PK
        enum vehicle_type UK "MINI, SEDAN, SUV"
        decimal base_fare
        decimal per_km_rate
        decimal min_fare
        timestamp updated_at
    }

    bookings {
        int booking_id PK
        int customer_id FK
        int driver_id FK "nullable"
        int vehicle_id FK "nullable"
        varchar pickup_location
        varchar drop_location
        decimal distance_km "CHECK > 0"
        enum vehicle_type "MINI, SEDAN, SUV"
        decimal estimated_fare
        decimal final_fare "nullable"
        enum status "PENDING, CONFIRMED, ONGOING, COMPLETED, CANCELLED"
        timestamp booking_time
        datetime pickup_time "nullable"
        datetime completed_at "nullable"
        varchar cancel_reason "nullable"
    }

    payments {
        int payment_id PK
        int booking_id FK, UK
        decimal amount "CHECK >= 0"
        enum method "CASH, CARD, UPI"
        enum status "PENDING, COMPLETED, FAILED"
        datetime paid_at "nullable"
    }

    reviews {
        int review_id PK
        int booking_id FK, UK
        int customer_id FK
        int driver_id FK
        tinyint rating "CHECK 1 to 5"
        text comment "nullable"
        timestamp created_at
    }
```

## Relational Schema & 3NF Rationale

1. **1NF**: All column values are atomic (e.g., individual pickup/drop strings, coordinates, single scalar fares, single enums).
2. **2NF**: No partial dependencies. In all tables with surrogate primary keys (`user_id`, `customer_id`, `booking_id`, etc.), every non-key column is fully functionally dependent on the entire primary key.
3. **3NF**: No transitive dependencies. Rider details (name, phone) are stored in `customers`, vehicle details (plate, model, capacity) are in `vehicles`, and driver credentials (license, status) are in `drivers`. `bookings` stores foreign keys referencing these entities without redundantly duplicating driver names or car models.
4. **Referential Integrity Actions**:
   - `users -> customers`: `ON DELETE CASCADE` removes rider profiles upon account deletion.
   - `users -> drivers`: `ON DELETE CASCADE` removes driver profiles upon account deletion.
   - `customers -> bookings`: `ON DELETE RESTRICT` protects financial trip history and audit logs.
   - `drivers -> bookings`: `ON DELETE RESTRICT` maintains driver performance records.
   - `vehicles -> bookings`: `ON DELETE RESTRICT` protects asset utilization logs.
   - `bookings -> payments`: `ON DELETE RESTRICT` guarantees financial ledger integrity.
   - `bookings -> reviews`: `ON DELETE RESTRICT` ensures verified rider review audits.
