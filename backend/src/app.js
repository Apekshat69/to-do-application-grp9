const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in local development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = typeof db.getDatabaseStatus === 'function' ? db.getDatabaseStatus() : { engine: 'PostgreSQL' };
  try {
    const dbTest = await db.pool.query('SELECT NOW() as current_time, current_database() as database');
    dbStatus = {
      engine: 'PostgreSQL',
      isCloud: Boolean(process.env.DATABASE_URL),
      isConnected: true,
      database: dbTest.rows[0].database,
      mode: 'PostgreSQL Persistent',
    };
  } catch (err) {
    dbStatus = {
      engine: 'PostgreSQL',
      isCloud: Boolean(process.env.DATABASE_URL),
      isConnected: false,
      error: err.message,
      mode: process.env.DATABASE_URL ? 'Connection Error' : 'In-Memory Fallback (Offline)',
    };
  }

  res.status(200).json({
    status: 'OK',
    service: 'TaskFlow REST API Backend',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'TaskFlow API Server is running',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
