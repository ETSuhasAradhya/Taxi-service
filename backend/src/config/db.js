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
let lastConnectionError = null;

// Remote cloud MySQL databases (TiDB Cloud, Aiven, AWS, etc.) require SSL
const isRemoteHost = process.env.DB_HOST && !['localhost', '127.0.0.1', 'db'].includes(process.env.DB_HOST.trim().toLowerCase());
const useSsl = process.env.DB_SSL === 'true' || (isRemoteHost && process.env.DB_SSL !== 'false');

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
  decimalNumbers: true,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined
});

/**
 * Test pool connectivity
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'taxi_service_db');
    connection.release();
    lastConnectionError = null;
    return true;
  } catch (error) {
    lastConnectionError = error.message;
    console.error('❌ MySQL Connection Error:', error.message);
    return false;
  }
}

function getDbStatus() {
  return {
    connected: !lastConnectionError,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'taxi_service_db',
    user: process.env.DB_USER || 'root',
    ssl: useSsl,
    error: lastConnectionError
  };
}

module.exports = {
  pool,
  testConnection,
  getDbStatus
};
