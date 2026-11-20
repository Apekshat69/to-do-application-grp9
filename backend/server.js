require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  try {
    // Verify PostgreSQL connection
    try {
      const testRes = await db.pool.query('SELECT NOW() as current_time, current_database() as database');
      console.log(`[Database] PostgreSQL connected successfully: ${testRes.rows[0].database} at ${testRes.rows[0].current_time}`);
    } catch (dbErr) {
      console.warn(`\n[Database Warning] PostgreSQL is not connected (${dbErr.message})`);
      console.warn(`[Database Warning] Server will continue starting so API endpoints and frontend remain functional.`);
      console.warn(`[Database Warning] To persist data to PostgreSQL, configure DATABASE_URL in .env or run: npm run db:init\n`);
    }

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` TaskFlow Backend Server Started Successfully `);
      console.log(` Port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Shutdown] Received ${signal}. Closing HTTP server and database pool...`);
      server.close(async () => {
        try {
          await db.pool.end();
          console.log('[Shutdown] Database pool closed. Server exited cleanly.');
          process.exit(0);
        } catch (err) {
          console.error('[Shutdown] Error while closing pool:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server Error] Failed to connect to database or start server:', error);
    process.exit(1);
  }
}

startServer();
