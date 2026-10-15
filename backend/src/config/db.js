const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * MySQL Connection Pool Configuration
 * Using connection pool avoids the overhead of creating a new TCP connection on every query.
 * mysql2/promise provides clean async/await syntax.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taxi_service_db',
  waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS !== 'false',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
  charset: 'utf8mb4',
  timezone: '+00:00',
  decimalNumbers: true
});

/**
 * Test pool connectivity
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'taxi_service_db');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
