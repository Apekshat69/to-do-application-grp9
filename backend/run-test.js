const app = require('./src/app');
const db = require('./src/config/db');
const runTests = require('./test-backend');

const PORT = 5000;

async function execute() {
  const server = app.listen(PORT, async () => {
    console.log(`Test server started on port ${PORT}`);
    try {
      await runTests();
      console.log('Integration test suite finished with SUCCESS.');
    } catch (err) {
      console.error('Integration test suite FAILED:', err);
      process.exitCode = 1;
    } finally {
      server.close(async () => {
        await db.pool.end();
        console.log('Server and DB connection closed.');
        process.exit(process.exitCode || 0);
      });
    }
  });
}

execute();
