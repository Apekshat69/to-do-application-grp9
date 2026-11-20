const { Client, Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Accept connection string from CLI argument OR environment variable
const cliArgUrl = process.argv[2];
const rawConnectionString = cliArgUrl || process.env.DATABASE_URL;
const connectionString = rawConnectionString ? rawConnectionString.trim().replace(/^["']|["']$/g, '') : null;

async function initDatabase() {
  console.log('===================================================');
  console.log('   TaskFlow PostgreSQL Database Initialization    ');
  console.log('===================================================\n');

  // Check if user accidentally pasted the documentation placeholder
  if (connectionString && (connectionString.includes('ep-cool-frost') || connectionString.includes('your_password') || connectionString.includes('ep-sample-host'))) {
    console.error('[Error] You passed the example placeholder connection string!');
    console.error('Please create a real database on https://neon.tech and paste your actual connection string.');
    console.error('\nUsage:');
    console.error('  node src/config/initDb.js "postgresql://user:real_password@ep-real-host.neon.tech/neondb?sslmode=require"\n');
    process.exit(1);
  }

  let targetPool;

  if (connectionString) {
    console.log('[Database] Connecting via DATABASE_URL to cloud PostgreSQL provider...');
    targetPool = new Pool({
      connectionString,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
  } else {
    const dbHost = process.env.DB_HOST || '127.0.0.1';
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    const dbName = process.env.DB_NAME || 'taskflow_db';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';

    console.log(`[Database] Attempting connection to local PostgreSQL on ${dbHost}:${dbPort}...`);

    // Step 1: Connect to default 'postgres' database to check/create target database locally
    const rootClient = new Client({
      host: dbHost,
      port: dbPort,
      database: 'postgres',
      user: dbUser,
      password: dbPassword,
      connectionTimeoutMillis: 3000,
    });

    try {
      await rootClient.connect();
      console.log(`[Database] Connected to local PostgreSQL server at ${dbHost}:${dbPort}`);

      const checkDbRes = await rootClient.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );

      if (checkDbRes.rows.length === 0) {
        console.log(`[Database] Database "${dbName}" does not exist. Creating...`);
        await rootClient.query(`CREATE DATABASE "${dbName}"`);
        console.log(`[Database] Database "${dbName}" created successfully.`);
      } else {
        console.log(`[Database] Database "${dbName}" already exists.`);
      }
    } catch (error) {
      console.error(`\n[Database Error] Could not connect to local PostgreSQL on ${dbHost}:${dbPort} (${error.message})`);
      console.error('\nIf you are setting up a cloud database (e.g. Neon / Supabase), please provide your connection string:');
      console.error('  Option A (Command line argument):');
      console.error('    node src/config/initDb.js "postgresql://user:password@host/dbname?sslmode=require"');
      console.error('  Option B (In backend/.env file):');
      console.error('    Add DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require');
      console.error('  Option C (Local PostgreSQL):');
      console.error('    Ensure your local PostgreSQL service is started on port 5432.\n');
      process.exit(1);
    } finally {
      try {
        await rootClient.end();
      } catch (e) {}
    }

    targetPool = new Pool({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword,
    });
  }

  // Step 2: Connect to the target database and execute schema & seeds
  try {
    const client = await targetPool.connect();
    console.log(`[Database] Connected to target PostgreSQL database successfully!\n`);

    // Schema file paths
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('[Schema] Executing database/schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('[Schema] Tables, columns, constraints, and indexes created/verified successfully.');
    } else {
      console.warn('[Schema Warning] schema.sql not found at:', schemaPath);
    }

    if (fs.existsSync(seedPath)) {
      console.log('[Seed] Executing database/seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('[Seed] Default users, categories, and sample tasks populated successfully.');
    } else {
      console.warn('[Seed Warning] seed.sql not found at:', seedPath);
    }

    // Verify row counts
    const usersCount = await client.query('SELECT COUNT(*)::int AS count FROM users');
    const categoriesCount = await client.query('SELECT COUNT(*)::int AS count FROM categories');
    const tasksCount = await client.query('SELECT COUNT(*)::int AS count FROM tasks');

    console.log('\n===================================================');
    console.log('       Database Setup Verified Successfully!       ');
    console.log('===================================================');
    console.log(` Total Users in DB:      ${usersCount.rows[0].count}`);
    console.log(` Total Categories in DB: ${categoriesCount.rows[0].count}`);
    console.log(` Total Tasks in DB:      ${tasksCount.rows[0].count}`);
    console.log('===================================================\n');

    client.release();
  } catch (error) {
    console.error('\n[Database Error] Failed while executing schema or seed scripts:', error.message);
    throw error;
  } finally {
    await targetPool.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('[Success] Database initialization completed cleanly!');
      process.exit(0);
    })
    .catch((err) => {
      process.exit(1);
    });
}

module.exports = initDatabase;
