const db = require('../config/db');

function formatDate(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }
  if (dateVal instanceof Date) {
    const yyyy = dateVal.getFullYear();
    const mm = String(dateVal.getMonth() + 1).padStart(2, '0');
    const dd = String(dateVal.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}

function mapTaskRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description || '',
    dueDate: formatDate(row.due_date),
    priority: row.priority,
    category: row.category_name || 'Other',
    status: row.status,
    completed: row.status === 'Completed',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    userId: String(row.user_id),
    ...(row.user_name && {
      userName: row.user_full_name || row.user_name,
      userEmail: row.user_email,
      userAvatar: row.user_avatar || row.user_name[0].toUpperCase(),
    }),
  };
}

const taskModel = {
  async findByUserId(userId, filters = {}) {
    let query = `
      SELECT t.id, t.user_id, t.category_id, t.title, t.description, t.status, t.priority,
             t.due_date, t.created_at, t.updated_at,
             c.name AS category_name
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [userId];
    let idx = 2;

    if (filters.status && filters.status !== 'all') {
      query += ` AND t.status = $${idx++}`;
      params.push(filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      query += ` AND t.priority = $${idx++}`;
      params.push(filters.priority);
    }

    if (filters.category && filters.category !== 'all') {
      query += ` AND LOWER(c.name) = LOWER($${idx++})`;
      params.push(filters.category);
    }

    if (filters.search) {
      query += ` AND (t.title ILIKE $${idx} OR t.description ILIKE $${idx})`;
      params.push(`%${filters.search}%`);
      idx++;
    }

    // Default sorting
    if (filters.sortBy === 'dueDateAsc') {
      query += ` ORDER BY t.due_date ASC NULLS LAST, t.id DESC`;
    } else if (filters.sortBy === 'dueDateDesc') {
      query += ` ORDER BY t.due_date DESC NULLS LAST, t.id DESC`;
    } else if (filters.sortBy === 'titleAsc') {
      query += ` ORDER BY t.title ASC`;
    } else if (filters.sortBy === 'priorityDesc') {
      query += ` ORDER BY CASE t.priority WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 1 ELSE 0 END DESC, t.id DESC`;
    } else {
      query += ` ORDER BY t.id DESC`;
    }

    const result = await db.query(query, params);
    return result.rows.map(mapTaskRow);
  },

  async findById(id, userId = null) {
    let query = `
      SELECT t.id, t.user_id, t.category_id, t.title, t.description, t.status, t.priority,
             t.due_date, t.created_at, t.updated_at,
             c.name AS category_name,
             u.name AS user_name, u.full_name AS user_full_name, u.email AS user_email, u.avatar AS user_avatar
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `;
    const params = [id];
    if (userId) {
      query += ` AND t.user_id = $2`;
      params.push(userId);
    }
    const result = await db.query(query, params);
    return result.rows[0] ? mapTaskRow(result.rows[0]) : null;
  },

  async create({ userId, categoryId, title, description, status = 'Pending', priority = 'Medium', dueDate }) {
    const result = await db.query(
      `INSERT INTO tasks (user_id, category_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, category_id, title, description, status, priority, due_date, created_at, updated_at`,
      [userId, categoryId || null, title.trim(), description ? description.trim() : null, status, priority, dueDate || null]
    );

    // Fetch complete joined record
    return this.findById(result.rows[0].id);
  },

  async update(id, userId, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(updates.title.trim());
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description ? updates.description.trim() : null);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push(`priority = $${idx++}`);
      values.push(updates.priority);
    }
    if (updates.dueDate !== undefined) {
      fields.push(`due_date = $${idx++}`);
      values.push(updates.dueDate || null);
    }
    if (updates.categoryId !== undefined) {
      fields.push(`category_id = $${idx++}`);
      values.push(updates.categoryId || null);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);
    let query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx++}`;
    if (userId) {
      query += ` AND user_id = $${idx++}`;
      values.push(userId);
    }
    query += ` RETURNING id`;

    const result = await db.query(query, values);
    if (result.rows.length === 0) return null;

    return this.findById(id);
  },

  async delete(id, userId = null) {
    let query = `DELETE FROM tasks WHERE id = $1`;
    const params = [id];
    if (userId) {
      query += ` AND user_id = $2`;
      params.push(userId);
    }
    query += ` RETURNING id, title`;
    const result = await db.query(query, params);
    return result.rows[0] || null;
  },

  async clearCompleted(userId) {
    const result = await db.query(
      `DELETE FROM tasks WHERE user_id = $1 AND status = 'Completed' RETURNING id`,
      [userId]
    );
    return result.rowCount;
  },

  async getStatsByUserId(userId) {
    const today = new Date().toISOString().split('T')[0];
    const query = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::int AS completed,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END)::int AS in_progress,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int AS pending,
        COUNT(CASE WHEN due_date < $2::date AND status != 'Completed' THEN 1 END)::int AS overdue,
        COUNT(CASE WHEN due_date = $2::date THEN 1 END)::int AS today
      FROM tasks
      WHERE user_id = $1
    `;
    const result = await db.query(query, [userId, today]);
    const row = result.rows[0];
    const total = row.total || 0;
    const completed = row.completed || 0;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending: row.pending || 0,
      inProgress: row.in_progress || 0,
      overdue: row.overdue || 0,
      today: row.today || 0,
      progressPercentage,
    };
  },

  // Admin Methods
  async getAllTasksForAdmin(filters = {}) {
    let query = `
      SELECT t.id, t.user_id, t.category_id, t.title, t.description, t.status, t.priority,
             t.due_date, t.created_at, t.updated_at,
             c.name AS category_name,
             u.name AS user_name, u.full_name AS user_full_name, u.email AS user_email, u.avatar AS user_avatar
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (filters.userId && filters.userId !== 'ALL') {
      query += ` AND t.user_id = $${idx++}`;
      params.push(filters.userId);
    }

    if (filters.status && filters.status !== 'ALL') {
      query += ` AND t.status = $${idx++}`;
      params.push(filters.status);
    }

    if (filters.priority && filters.priority !== 'ALL') {
      query += ` AND t.priority = $${idx++}`;
      params.push(filters.priority);
    }

    if (filters.search) {
      query += ` AND (t.title ILIKE $${idx} OR t.description ILIKE $${idx} OR u.name ILIKE $${idx} OR u.full_name ILIKE $${idx})`;
      params.push(`%${filters.search}%`);
      idx++;
    }

    query += ` ORDER BY t.id DESC`;

    const result = await db.query(query, params);
    return result.rows.map(mapTaskRow);
  },

  async getAdminStats() {
    const today = new Date().toISOString().split('T')[0];
    const taskQuery = `
      SELECT 
        COUNT(*)::int AS total_tasks,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::int AS completed_tasks,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END)::int AS in_progress_tasks,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int AS pending_tasks,
        COUNT(CASE WHEN due_date < $1::date AND status != 'Completed' THEN 1 END)::int AS overdue_tasks
      FROM tasks
    `;
    const userCountQuery = `SELECT COUNT(*)::int AS total_users FROM users`;

    const [taskRes, userRes] = await Promise.all([
      db.query(taskQuery, [today]),
      db.query(userCountQuery),
    ]);

    const taskRow = taskRes.rows[0];
    const totalUsers = userRes.rows[0].total_users || 0;
    const totalTasks = taskRow.total_tasks || 0;
    const completedTasks = taskRow.completed_tasks || 0;
    const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalUsers,
      totalTasks,
      pendingTasks: taskRow.pending_tasks || 0,
      inProgressTasks: taskRow.in_progress_tasks || 0,
      completedTasks,
      overdueTasks: taskRow.overdue_tasks || 0,
      overallCompletionRate,
    };
  },

  async getMonthlyActivity() {
    const query = `
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') AS month,
        DATE_TRUNC('month', created_at) AS month_date,
        COUNT(*)::int AS created,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::int AS completed
      FROM tasks
      GROUP BY month, month_date
      ORDER BY month_date ASC
      LIMIT 12
    `;
    const result = await db.query(query);
    return result.rows.map((row) => ({
      month: row.month,
      created: row.created,
      completed: row.completed,
    }));
  },

  async getStatusBreakdown() {
    const query = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END)::int AS completed,
        COUNT(CASE WHEN status = 'In Progress' THEN 1 END)::int AS in_progress,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int AS pending
      FROM tasks
    `;
    const result = await db.query(query);
    const row = result.rows[0];
    const total = row.total || 0;

    if (total === 0) {
      return { slices: [], total: 0, hasData: false };
    }

    const slices = [
      {
        label: 'Completed',
        count: row.completed,
        percentage: Math.round((row.completed / total) * 100),
        color: '#10B981',
        dotColor: 'bg-emerald-500',
      },
      {
        label: 'In Progress',
        count: row.in_progress,
        percentage: Math.round((row.in_progress / total) * 100),
        color: '#5243E4',
        dotColor: 'bg-[#5243E4]',
      },
      {
        label: 'Pending',
        count: row.pending,
        percentage: Math.round((row.pending / total) * 100),
        color: '#94A3B8',
        dotColor: 'bg-slate-400',
      },
    ];

    return { slices, total, hasData: true };
  },
};

module.exports = taskModel;
