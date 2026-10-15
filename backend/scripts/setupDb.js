const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function setupDatabase() {
  console.log('>>> Starting Database Setup...');

  const isRemote = process.env.DB_HOST && !['localhost', '127.0.0.1', 'db'].includes(process.env.DB_HOST.trim().toLowerCase());
  const useSsl = process.env.DB_SSL === 'true' || (isRemote && process.env.DB_SSL !== 'false');

  // Connect without DB first to ensure taxi_service_db exists
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log('1. Connected to MySQL Server. Creating database if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS taxi_service_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await connection.changeUser({ database: 'taxi_service_db' });

    console.log('2. Reading and executing schema.sql...');
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Remove DELIMITER $$ statements for mysql2 multipleStatements execution
    // mysql2 does not need DELIMITER keywords when executing multiple statements
    const cleanedSchema = schemaSql
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .replace(/\$\$/g, ';');

    await connection.query(cleanedSchema);
    console.log('✅ schema.sql executed successfully.');

    console.log('3. Reading and executing sample_data.sql...');
    const dataPath = path.resolve(__dirname, '../../database/sample_data.sql');
    if (fs.existsSync(dataPath)) {
      const dataSql = fs.readFileSync(dataPath, 'utf8');
      await connection.query(dataSql);
      console.log('✅ sample_data.sql loaded successfully.');
    } else {
      console.warn('⚠️ sample_data.sql not found! Generating via seed.js...');
      const { generateSampleData } = require('./seed');
      await generateSampleData();
      const dataSql = fs.readFileSync(dataPath, 'utf8');
      await connection.query(dataSql);
      console.log('✅ Generated and loaded sample_data.sql successfully.');
    }

    console.log('4. Verifying database table counts & integrity:');
    const tables = ['users', 'customers', 'drivers', 'vehicles', 'fare_rates', 'bookings', 'payments', 'reviews'];
    for (const t of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${t}`);
      console.log(`   - Table '${t}': ${rows[0].count} rows`);
    }

    const [viewRows] = await connection.query('SELECT COUNT(*) as count FROM v_booking_details');
    console.log(`   - View 'v_booking_details': ${viewRows[0].count} rows`);
    const [revViewRows] = await connection.query('SELECT COUNT(*) as count FROM v_daily_revenue');
    console.log(`   - View 'v_daily_revenue': ${revViewRows[0].count} rows`);

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during database setup:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
