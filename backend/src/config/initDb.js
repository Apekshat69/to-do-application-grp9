const { Client, Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbName = process.env.DB_NAME || 'taskflow_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

async function initDatabase() {
  console.log('--- Initializing TaskFlow PostgreSQL Database ---');

  // Step 1: Connect to default 'postgres' database to check/create target database
  const rootClient = new Client({
    host: dbHost,
    port: dbPort,
    database: 'postgres',
    user: dbUser,
    password: dbPassword,
  });

  try {
    await rootClient.connect();
    console.log(`Connected to PostgreSQL server at ${dbHost}:${dbPort}`);

    const checkDbRes = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDbRes.rows.length === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await rootClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('Error during database check/creation:', error.message);
    throw error;
  } finally {
    await rootClient.end();
  }

  // Step 2: Connect to the target database and execute schema & seeds
  const targetPool = new Pool({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
  });

  try {
    const client = await targetPool.connect();
    console.log(`Connected to target database "${dbName}"`);

    // Schema file paths
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('Schema tables, constraints, and indexes created successfully.');
    } else {
      console.warn('schema.sql not found at:', schemaPath);
    }

    if (fs.existsSync(seedPath)) {
      console.log('Executing seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await client.query(seedSql);
      console.log('Seed users, categories, and initial tasks populated successfully.');
    } else {
      console.warn('seed.sql not found at:', seedPath);
    }

    // Verify row counts
    const usersCount = await client.query('SELECT COUNT(*)::int AS count FROM users');
    const categoriesCount = await client.query('SELECT COUNT(*)::int AS count FROM categories');
    const tasksCount = await client.query('SELECT COUNT(*)::int AS count FROM tasks');

    console.log('\n--- Database Initialization Verification ---');
    console.log(`Users: ${usersCount.rows[0].count}`);
    console.log(`Categories: ${categoriesCount.rows[0].count}`);
    console.log(`Tasks: ${tasksCount.rows[0].count}`);
    console.log('--------------------------------------------\n');

    client.release();
  } catch (error) {
    console.error('Error executing schema/seed scripts:', error);
    throw error;
  } finally {
    await targetPool.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialization completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
