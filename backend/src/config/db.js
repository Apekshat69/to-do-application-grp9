const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let isPgAvailable = null; // null: unknown, true: connected, false: offline fallback

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'taskflow_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  // Silent catch to prevent crashing when PostgreSQL is offline
  if (err.code !== 'ECONNREFUSED') {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
  }
});

// --- Resilient In-Memory Fallback Store (Used when PostgreSQL is offline) ---
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
      title: params[5] || 'Member',
      department: params[6] || 'Engineering',
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

  // Tasks: findById
  if (q.includes('FROM tasks t') && q.includes('WHERE t.id = $1')) {
    const tid = parseInt(params[0], 10);
    const task = memoryTasks.find((t) => t.id === tid);
    return { rows: task ? [task] : [] };
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
      category_name: 'Work',
    };
    memoryTasks.unshift(newTask);
    return { rows: [newTask] };
  }

  // Tasks: update
  if (q.startsWith('UPDATE tasks SET')) {
    const tid = parseInt(params[params.length - 2], 10);
    const task = memoryTasks.find((t) => t.id === tid);
    if (task) {
      if (q.includes('status =')) {
        task.status = params[0];
      }
      if (q.includes('title =')) {
        task.title = params[0];
      }
    }
    return { rows: task ? [task] : [] };
  }

  // Tasks: delete
  if (q.startsWith('DELETE FROM tasks WHERE id = $1')) {
    const tid = parseInt(params[0], 10);
    const idx = memoryTasks.findIndex((t) => t.id === tid);
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
  if (isPgAvailable === false) {
    return handleMemoryQuery(text, params);
  }

  try {
    const res = await pool.query(text, params);
    isPgAvailable = true;
    return res;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      isPgAvailable = false;
      return handleMemoryQuery(text, params);
    }
    throw err;
  }
}

module.exports = {
  pool,
  query,
  getClient: () => pool.connect(),
};
