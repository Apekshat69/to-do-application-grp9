const db = require('../config/db');

const userModel = {
  async findByEmail(email) {
    const result = await db.query(
      `SELECT id, name, full_name, email, password_hash, role, title, department, status, avatar, created_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await db.query(
      `SELECT id, name, full_name, email, role, title, department, status, avatar, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ name, fullName, email, passwordHash, role = 'user', title = 'Frontend Developer', department = 'Engineering', avatar }) {
    const derivedName = name || (fullName ? fullName.split(' ')[0] : email.split('@')[0]);
    const derivedFullName = fullName || name || email.split('@')[0];
    const derivedAvatar = avatar || (derivedName ? derivedName[0].toUpperCase() : 'U');

    const result = await db.query(
      `INSERT INTO users (name, full_name, email, password_hash, role, title, department, status, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active', $8)
       RETURNING id, name, full_name, email, role, title, department, status, avatar, created_at`,
      [derivedName, derivedFullName, email.trim().toLowerCase(), passwordHash, role, title, department, derivedAvatar]
    );
    return result.rows[0];
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.fullName !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(updates.fullName);
      fields.push(`name = $${idx++}`);
      values.push(updates.fullName.split(' ')[0]);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(updates.email.trim().toLowerCase());
    }
    if (updates.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(updates.title);
    }
    if (updates.department !== undefined) {
      fields.push(`department = $${idx++}`);
      values.push(updates.department);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.avatar !== undefined) {
      fields.push(`avatar = $${idx++}`);
      values.push(updates.avatar);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await db.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING id, name, full_name, email, role, title, department, status, avatar, created_at`,
      values
    );
    return result.rows[0] || null;
  },

  async getAllUsers() {
    const result = await db.query(
      `SELECT id, name, full_name, email, role, title, department, status, avatar, created_at
       FROM users
       ORDER BY id ASC`
    );
    return result.rows;
  },

  async getAllUsersWithTaskStats() {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.full_name, 
        u.email, 
        u.role, 
        u.title, 
        u.department, 
        u.status, 
        u.avatar, 
        u.created_at,
        COUNT(t.id)::int AS total_tasks,
        COUNT(CASE WHEN t.status = 'Completed' THEN 1 END)::int AS completed_tasks,
        COUNT(CASE WHEN t.status = 'In Progress' THEN 1 END)::int AS in_progress_tasks,
        COUNT(CASE WHEN t.status = 'Pending' THEN 1 END)::int AS pending_tasks
      FROM users u
      LEFT JOIN tasks t ON t.user_id = u.id
      GROUP BY u.id
      ORDER BY u.id ASC
    `;
    const result = await db.query(query);
    return result.rows.map((row) => {
      const total = row.total_tasks || 0;
      const completed = row.completed_tasks || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        user: {
          id: String(row.id),
          name: row.name,
          fullName: row.full_name || row.name,
          email: row.email,
          role: row.role,
          title: row.title,
          department: row.department,
          status: row.status,
          avatar: row.avatar || (row.name ? row.name[0].toUpperCase() : 'U'),
          joinedDate: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 15, 2026',
        },
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: row.pending_tasks || 0,
        inProgressTasks: row.in_progress_tasks || 0,
        progressPercentage: progress,
      };
    });
  },

  async countTotal() {
    const result = await db.query('SELECT COUNT(*)::int AS total FROM users');
    return result.rows[0].total;
  },
};

module.exports = userModel;
