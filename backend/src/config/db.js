const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

// Determine SSL configuration
// Hosted PostgreSQL providers (Neon, Supabase, Vercel Postgres, AWS RDS) require SSL.
// Local PostgreSQL typically runs without SSL.
const isCloudOrProd = Boolean(connectionString) || process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
const useSsl = process.env.DB_SSL === 'false'
  ? false
  : (process.env.DB_SSL === 'true' || isCloudOrProd ? { rejectUnauthorized: false } : false);

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: useSsl,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'taskflow_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: useSsl,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  if (err.code !== 'ECONNREFUSED') {
    console.error('[Database Pool Error] Unexpected error on idle PostgreSQL client:', err.message);
  }
});

let isPgConnected = null; // null: not checked yet, true: verified, false: offline fallback

// --- Resilient In-Memory Fallback Store (Used ONLY when local PostgreSQL is offline and NO DATABASE_URL is configured) ---
const memoryUsers = [
  {
    id: 1,
    name: 'Alex',
    full_name: 'Alex Morgan',
    email: 'alex.morgan@taskflow.dev',
    password_hash: bcrypt.hashSync('taskflow2026', 10),
    role: 'user',
    title: 'Frontend Developer',
    department: 'Engineering',
    status: 'Active',
    avatar: 'A',
    created_at: new Date('2026-01-15T00:00:00Z'),
  },
  {
    id: 2,
    name: 'Admin',
    full_name: 'TaskFlow Administrator',
    email: 'admin@taskflow.dev',
    password_hash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    title: 'System Administrator',
    department: 'Operations',
    status: 'Active',
    avatar: 'AD',
    created_at: new Date('2025-10-01T00:00:00Z'),
  },
];

const memoryCategories = [
  { id: 1, user_id: 1, name: 'Work', created_at: new Date() },
  { id: 2, user_id: 1, name: 'Study', created_at: new Date() },
  { id: 3, user_id: 1, name: 'Personal', created_at: new Date() },
  { id: 4, user_id: 1, name: 'Other', created_at: new Date() },
];

let nextTaskId = 11;
const memoryTasks = [
  {
    id: 1,
    user_id: 1,
    category_id: 1,
    category_name: 'Work',
    title: 'Finish project report',
    description: 'Compile quarterly performance metrics, frontend benchmarks, and deliverables summary.',
    due_date: '2026-11-18',
    priority: 'High',
    status: 'In Progress',
    created_at: new Date('2026-11-16T09:00:00Z'),
    updated_at: new Date('2026-11-16T09:00:00Z'),
  },
  {
    id: 2,
    user_id: 1,
    category_id: 2,
    category_name: 'Study',
    title: 'Study Angular 20 & signals architecture',
    description: 'Review standalone component tree, signal stores, reactive forms, and routing guards.',
    due_date: '2026-11-18',
    priority: 'Medium',
    status: 'Completed',
    created_at: new Date('2026-11-15T11:30:00Z'),
    updated_at: new Date('2026-11-15T11:30:00Z'),
  },
  {
    id: 3,
    user_id: 1,
    category_id: 3,
    category_name: 'Personal',
    title: 'Go for a 30-minute evening walk',
    description: 'Refresh and take a break around the community park after the afternoon sprint.',
    due_date: '2026-11-19',
    priority: 'Low',
    status: 'Pending',
    created_at: new Date('2026-11-17T14:20:00Z'),
    updated_at: new Date('2026-11-17T14:20:00Z'),
  },
  {
    id: 4,
    user_id: 1,
    category_id: 3,
    category_name: 'Personal',
    title: 'Read Chapter 4 of Atomic Habits',
    description: 'Focus on habit stacking and environmental cues for high productivity.',
    due_date: '2026-11-14',
    priority: 'Low',
    status: 'Pending',
    created_at: new Date('2026-11-10T10:00:00Z'),
    updated_at: new Date('2026-11-10T10:00:00Z'),
  },
  {
    id: 5,
    user_id: 1,
    category_id: 1,
    category_name: 'Work',
    title: 'Plan sprint deliverables',
    description: 'Map out roadmap milestones, team priorities, and ticket estimates.',
    due_date: '2026-11-20',
    priority: 'Medium',
    status: 'Pending',
    created_at: new Date('2026-11-17T16:45:00Z'),
    updated_at: new Date('2026-11-17T16:45:00Z'),
  },
];

function handleMemoryQuery(text, params = []) {
  const q = text.trim();

  // Test / health check
  if (q.includes('SELECT NOW()')) {
    return { rows: [{ current_time: new Date().toISOString(), database: 'taskflow_in_memory_fallback' }] };
  }

  // Users: findByEmail
  if (q.includes('FROM users') && q.includes('LOWER(email) = LOWER($1)')) {
    const email = String(params[0]).trim().toLowerCase();
    const user = memoryUsers.find((u) => u.email.toLowerCase() === email);
    return { rows: user ? [user] : [] };
  }

  // Users: findById
  if (q.includes('FROM users') && q.includes('WHERE id = $1')) {
    const id = parseInt(params[0], 10);
    const user = memoryUsers.find((u) => u.id === id);
    return { rows: user ? [user] : [] };
  }

  // Users: create
  if (q.startsWith('INSERT INTO users')) {
    const newUser = {
      id: memoryUsers.length + 1,
      name: params[0],
      full_name: params[1],
      email: params[2],
      password_hash: params[3],
      role: params[4] || 'user',
      title: params[5] || 'Product Member',
      department: params[6] || 'Product',
      status: 'Active',
      avatar: params[7] || (params[0] ? params[0][0].toUpperCase() : 'U'),
      created_at: new Date(),
    };
    memoryUsers.push(newUser);
    return { rows: [newUser] };
  }

  // Users: update
  if (q.startsWith('UPDATE users SET')) {
    const id = parseInt(params[params.length - 1], 10);
    const user = memoryUsers.find((u) => u.id === id);
    if (user) {
      if (params[0]) user.full_name = params[0];
      if (params[1]) user.email = params[1];
    }
    return { rows: user ? [user] : [] };
  }

  // Users: getAll
  if (q.includes('FROM users u') || (q.includes('FROM users') && !q.includes('WHERE'))) {
    return { rows: memoryUsers };
  }

  // Categories: findByUserId
  if (q.includes('FROM categories c') && q.includes('WHERE c.user_id = $1')) {
    const uid = parseInt(params[0], 10);
    const cats = memoryCategories.filter((c) => c.user_id === uid);
    return { rows: cats };
  }

  // Categories: findByNameAndUserId
  if (q.includes('FROM categories') && q.includes('LOWER(name) = LOWER($1)')) {
    const name = String(params[0]).trim().toLowerCase();
    const uid = parseInt(params[1], 10);
    const cat = memoryCategories.find((c) => c.user_id === uid && c.name.toLowerCase() === name);
    return { rows: cat ? [cat] : [] };
  }

  // Categories: create
  if (q.startsWith('INSERT INTO categories')) {
    const newCat = {
      id: memoryCategories.length + 1,
      user_id: parseInt(params[0], 10),
      name: params[1],
      created_at: new Date(),
    };
    memoryCategories.push(newCat);
    return { rows: [newCat] };
  }

  // Tasks: findByUserId
  if (q.includes('FROM tasks t') && q.includes('WHERE t.user_id = $1')) {
    const uid = parseInt(params[0], 10);
    const tasks = memoryTasks.filter((t) => t.user_id === uid);
    return { rows: tasks };
  }

  // Tasks: findById (with optional user_id ownership check)
  if (q.includes('FROM tasks t') && q.includes('WHERE t.id = $1')) {
    const tid = parseInt(params[0], 10);
    let task = memoryTasks.find((t) => t.id === tid);
    if (task && q.includes('AND t.user_id = $2') && params.length > 1) {
      const uid = parseInt(params[1], 10);
      if (task.user_id !== uid) {
        task = null;
      }
    }
    return { rows: task ? [task] : [] };
  }

  // Admin Tasks: getAllTasksForAdmin
  if (q.includes('FROM tasks t') && q.includes('WHERE 1=1')) {
    let tasks = [...memoryTasks];
    if (q.includes('AND t.user_id = $') && params.length > 0) {
      const uid = parseInt(params[0], 10);
      tasks = tasks.filter((t) => t.user_id === uid);
    }
    const populated = tasks.map((t) => {
      const u = memoryUsers.find((user) => user.id === t.user_id);
      return {
        ...t,
        user_name: u ? u.name : 'User',
        user_full_name: u ? u.full_name : 'User',
        user_email: u ? u.email : '',
        user_avatar: u ? u.avatar : 'U',
      };
    });
    return { rows: populated };
  }

  // Tasks: stats
  if (q.includes('COUNT(*)::int AS total')) {
    const uid = parseInt(params[0], 10);
    const userTasks = memoryTasks.filter((t) => t.user_id === uid);
    const todayStr = new Date().toISOString().split('T')[0];
    const total = userTasks.length;
    const completed = userTasks.filter((t) => t.status === 'Completed').length;
    const pending = userTasks.filter((t) => t.status === 'Pending').length;
    const inProgress = userTasks.filter((t) => t.status === 'In Progress').length;
    const overdue = userTasks.filter((t) => t.due_date && t.due_date < todayStr && t.status !== 'Completed').length;
    const today = userTasks.filter((t) => t.due_date === todayStr).length;

    return {
      rows: [
        {
          total,
          completed,
          pending,
          in_progress: inProgress,
          overdue,
          today,
        },
      ],
    };
  }

  // Tasks: create
  if (q.startsWith('INSERT INTO tasks')) {
    const newTask = {
      id: nextTaskId++,
      user_id: parseInt(params[0], 10),
      category_id: params[1] ? parseInt(params[1], 10) : null,
      title: params[2],
      description: params[3] || '',
      status: params[4] || 'Pending',
      priority: params[5] || 'Medium',
      due_date: params[6] || null,
      created_at: new Date(),
      updated_at: new Date(),
      category_name: 'Work',
    };
    memoryTasks.unshift(newTask);
    return { rows: [newTask] };
  }

  // Tasks: update (with strict user ownership verification)
  if (q.startsWith('UPDATE tasks SET')) {
    let tid;
    let uid = null;
    if (q.includes('AND user_id = $')) {
      uid = parseInt(params[params.length - 1], 10);
      tid = parseInt(params[params.length - 2], 10);
    } else {
      tid = parseInt(params[params.length - 1], 10);
    }

    const task = memoryTasks.find((t) => t.id === tid);
    if (!task || (uid !== null && task.user_id !== uid)) {
      return { rows: [] };
    }

    const setPart = q.substring(q.indexOf('SET ') + 4, q.indexOf(' WHERE'));
    const assignments = setPart.split(',').map((s) => s.trim());
    let pIdx = 0;
    for (const a of assignments) {
      if (a.includes('=')) {
        const [col, paramPlaceholder] = a.split('=').map((s) => s.trim());
        if (paramPlaceholder && paramPlaceholder.startsWith('$')) {
          const val = params[pIdx++];
          if (col === 'title') task.title = val;
          if (col === 'description') task.description = val;
          if (col === 'status') task.status = val;
          if (col === 'priority') task.priority = val;
          if (col === 'due_date') task.due_date = val;
          if (col === 'category_id') task.category_id = val;
        }
      }
    }
    task.updated_at = new Date();
    return { rows: [{ id: task.id }] };
  }

  // Tasks: delete (with strict user ownership verification)
  if (q.startsWith('DELETE FROM tasks WHERE id = $1')) {
    const tid = parseInt(params[0], 10);
    const uid = (q.includes('AND user_id = $2') && params.length > 1) ? parseInt(params[1], 10) : null;
    const idx = memoryTasks.findIndex((t) => t.id === tid && (uid === null || t.user_id === uid));
    if (idx !== -1) {
      const removed = memoryTasks.splice(idx, 1);
      return { rows: removed };
    }
    return { rows: [] };
  }

  // Tasks: clear completed
  if (q.includes("WHERE user_id = $1 AND status = 'Completed'")) {
    const uid = parseInt(params[0], 10);
    let count = 0;
    for (let i = memoryTasks.length - 1; i >= 0; i--) {
      if (memoryTasks[i].user_id === uid && memoryTasks[i].status === 'Completed') {
        memoryTasks.splice(i, 1);
        count++;
      }
    }
    return { rowCount: count };
  }

  return { rows: [] };
}

async function query(text, params = []) {
  try {
    const res = await pool.query(text, params);
    if (isPgConnected !== true) {
      isPgConnected = true;
    }
    return res;
  } catch (err) {
    // When DATABASE_URL is configured, PostgreSQL persistence is explicitly expected.
    // NEVER silently fall back to in-memory store when a real database connection was specified!
    if (connectionString) {
      console.error(`[Database Error] PostgreSQL query failed on connected database: ${err.message}`);
      throw err;
    }

    // When NO DATABASE_URL is set and local PostgreSQL is offline on 127.0.0.1:
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      if (isPgConnected !== false) {
        console.warn(`\n[Database Warning] PostgreSQL is offline on localhost (${err.message}).`);
        console.warn(`[Database Warning] Operating in temporary in-memory demo mode. DATA WILL NOT PERSIST!`);
        console.warn(`[Database Warning] To persist data, configure DATABASE_URL in .env or start local PostgreSQL.\n`);
        isPgConnected = false;
      }
      return handleMemoryQuery(text, params);
    }

    // Any SQL syntax, constraint, or schema error must be thrown directly
    console.error(`[Database Error] SQL query error: ${err.message}`);
    throw err;
  }
}

function getDatabaseStatus() {
  return {
    engine: 'PostgreSQL',
    isCloud: Boolean(connectionString),
    isConnected: isPgConnected === true,
    mode: isPgConnected === true ? 'PostgreSQL Persistent' : (isPgConnected === false ? 'In-Memory Fallback (Offline)' : 'Pending Verification'),
  };
}

module.exports = {
  pool,
  query,
  getClient: () => pool.connect(),
  getDatabaseStatus,
};
