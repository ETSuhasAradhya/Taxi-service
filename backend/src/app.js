const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security & Body Parsing Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
const { getDbStatus } = require('./config/db');
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Taxi Service Management System API (DBMS Project)',
    database: dbStatus
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/drivers', require('./routes/driver.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/fare-rates', require('./routes/fareRate.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/reports', require('./routes/report.routes'));

// SQL Query Explorer (Admin-only read-only educational catalog)
app.use('/api/admin/sql-queries', require('./routes/sqlExplorer.routes'));
app.use('/api/sql-explorer', require('./routes/sqlExplorer.routes'));

// Serve Static Frontend Assets in Production
const path = require('path');
const fs = require('fs');
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Route Handler for unmatched /api routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' does not exist.`
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource '${req.method} ${req.originalUrl}' does not exist.`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
