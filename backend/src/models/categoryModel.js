const db = require('../config/db');

const categoryModel = {
  async findByUserId(userId) {
    const result = await db.query(
      `SELECT c.id, c.user_id, c.name, c.created_at,
              COUNT(t.id)::int AS task_count,
              COUNT(CASE WHEN t.status = 'Completed' THEN 1 END)::int AS completed_count
       FROM categories c
       LEFT JOIN tasks t ON t.category_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.id ASC`,
      [userId]
    );
    return result.rows;
  },

  async findByNameAndUserId(name, userId) {
    const result = await db.query(
      `SELECT id, user_id, name, created_at
       FROM categories
       WHERE LOWER(name) = LOWER($1) AND user_id = $2`,
      [name.trim(), userId]
    );
    return result.rows[0] || null;
  },

  async create({ userId, name }) {
    const result = await db.query(
      `INSERT INTO categories (user_id, name)
       VALUES ($1, $2)
       RETURNING id, user_id, name, created_at`,
      [userId, name.trim()]
    );
    return result.rows[0];
  },

  async findOrCreate(userId, name) {
    const categoryName = name && name.trim() ? name.trim() : 'Other';
    let cat = await this.findByNameAndUserId(categoryName, userId);
    if (!cat) {
      try {
        cat = await this.create({ userId, name: categoryName });
      } catch (err) {
        // Concurrency catch
        cat = await this.findByNameAndUserId(categoryName, userId);
      }
    }
    return cat;
  },

  async update(id, userId, name) {
    const result = await db.query(
      `UPDATE categories
       SET name = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, name, created_at`,
      [name.trim(), id, userId]
    );
    return result.rows[0] || null;
  },

  async delete(id, userId) {
    const result = await db.query(
      `DELETE FROM categories
       WHERE id = $1 AND user_id = $2
       RETURNING id, name`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async seedDefaultCategories(userId) {
    const defaultCategories = ['Work', 'Personal', 'Study', 'Other'];
    for (const name of defaultCategories) {
      await this.findOrCreate(userId, name);
    }
  },
};

module.exports = categoryModel;
