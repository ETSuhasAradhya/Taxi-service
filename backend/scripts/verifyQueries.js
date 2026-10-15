const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verifyAllQueries() {
  console.log('================================================================================');
  console.log('🔍 SQL QUERY EXPLORER VERIFICATION SUITE');
  console.log('Target Scratch DB: taxi_verify (Zero impact on primary database)');
  console.log('================================================================================\n');

  // Step 1: Connect to MySQL server
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    decimalNumbers: true
  });

  try {
    console.log('1. Setting up fresh scratch database: taxi_verify...');
    await connection.query('DROP DATABASE IF EXISTS taxi_verify;');
    await connection.query('CREATE DATABASE taxi_verify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await connection.changeUser({ database: 'taxi_verify' });

    // Step 2: Load schema into taxi_verify
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    schemaSql = schemaSql
      .replace(/taxi_service_db/g, 'taxi_verify')
      .replace(/DELIMITER \$\$/g, '')
      .replace(/DELIMITER ;/g, '')
      .replace(/\$\$/g, ';');
    await connection.query(schemaSql);

    // Step 3: Load sample data into taxi_verify
    const dataPath = path.resolve(__dirname, '../../database/sample_data.sql');
    let dataSql = fs.readFileSync(dataPath, 'utf8');
    dataSql = dataSql.replace(/taxi_service_db/g, 'taxi_verify');
    await connection.query(dataSql);
    console.log('✅ Scratch DB `taxi_verify` initialized with full schema and sample records.\n');

    // Step 4: Load queries from queryCatalog.js service
    const { QUERY_CATALOG } = require('../src/services/queryCatalog');
    const queries = QUERY_CATALOG;

    console.log(`2. Executing & Validating All ${queries.length} Queries:\n`);

    let passed = 0;
    let failed = 0;

    for (let i = 0; i < queries.length; i++) {
      const q = queries[i];
      const startTime = process.hrtime();
      let status = 'PASS';
      let details = '';

      try {
        let sql = q.sql.trim();
        // Point data dictionary queries to taxi_verify
        sql = sql.replace(/taxi_service_db/g, 'taxi_verify');

        if (sql.includes('START TRANSACTION') || sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) {
          // Transactional / DML statement execution with guaranteed rollback
          const conn = await connection;
          // Execute statements sequentially or multi-statement
          const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

          await conn.query('START TRANSACTION;');
          for (const stmt of statements) {
            if (stmt !== 'START TRANSACTION' && stmt !== 'COMMIT' && stmt !== 'ROLLBACK') {
              await conn.query(stmt);
            }
          }
          await conn.query('ROLLBACK;');
          details = 'Executed & Safely Rolled Back';
        } else {
          // SELECT, EXPLAIN, or VIEW queries
          const [rows, fields] = await connection.query(sql);
          const rowCount = Array.isArray(rows) ? rows.length : 1;
          details = `${rowCount} rows returned`;

          // Synchronize sampleOutput columns and rows with real execution results
          if (Array.isArray(rows) && rows.length > 0) {
            const columns = Object.keys(rows[0]);
            const sampleRows = rows.slice(0, 10).map(r => 
              columns.map(c => {
                const val = r[c];
                if (val === null || val === undefined) return 'NULL';
                if (val instanceof Date) return val.toISOString().slice(0, 19).replace('T', ' ');
                return String(val);
              })
            );
            q.sampleOutput = { columns, rows: sampleRows };
          }
        }
      } catch (err) {
        status = 'FAIL';
        details = `Error: ${err.message}`;
      }

      const diff = process.hrtime(startTime);
      const ms = (diff[0] * 1000 + diff[1] / 1e6).toFixed(1);

      const qIdentifier = String(q.slug || q.id);
      if (status === 'PASS') {
        passed++;
        console.log(`[PASS] #${String(i + 1).padStart(2, '0')} | ${q.category.padEnd(20)} | ${qIdentifier.padEnd(36)} | ${ms}ms | ${details}`);
      } else {
        failed++;
        console.error(`[FAIL] #${String(i + 1).padStart(2, '0')} | ${q.category.padEnd(20)} | ${qIdentifier.padEnd(36)} | ${details}`);
      }
    }

    const queriesPath = path.resolve(__dirname, '../src/data/sqlQueries.json');
    fs.writeFileSync(queriesPath, JSON.stringify(queries, null, 2), 'utf8');

    console.log('\n================================================================================');
    console.log('VERIFICATION RESULTS:');
    console.log(`Total Queries: ${queries.length}`);
    console.log(`Passed:        ${passed}`);
    console.log(`Failed:        ${failed}`);
    console.log('================================================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL QUERIES PASSED VERIFICATION AGAINST SCRATCH DB taxi_verify!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Verification script fatal error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  verifyAllQueries();
}

module.exports = { verifyAllQueries };
