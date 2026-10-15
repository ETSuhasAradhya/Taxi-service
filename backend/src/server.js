const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.warn('⚠️ Warning: MySQL database connection failed. Please ensure MySQL is running on port 3306.');
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
