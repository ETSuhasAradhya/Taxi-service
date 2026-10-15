const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.warn(`⚠️ Warning: MySQL database connection to '${process.env.DB_HOST || '127.0.0.1'}' failed. Please verify environment settings.`);
  } else {
    // Automatically initialize schema & demo data if tables don't exist yet
    try {
      const { pool } = require('./config/db');
      const [rows] = await pool.query("SHOW TABLES LIKE 'users'");
      if (rows.length === 0) {
        console.log('🔄 First boot detected with empty database! Automatically initializing schema & sample data...');
        const { setupDatabase } = require('../scripts/setupDb');
        await setupDatabase();
      }
    } catch (err) {
      console.warn('⚠️ Auto-init check error:', err.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚖 Taxi Service Backend API running on http://localhost:${PORT}`);
    console.log(`📚 Database: ${process.env.DB_NAME || 'taxi_service_db'} (MySQL 8)`);
    console.log(`🔍 SQL Query Explorer enabled at /api/admin/sql-queries`);
    console.log(`================================================================`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
