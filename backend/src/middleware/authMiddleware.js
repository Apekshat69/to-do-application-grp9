const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'taskflow_jwt_secret_key_2026';

    const decoded = jwt.verify(token, secret);
    
    // Verify user exists in database and is Active
    const userResult = await db.query(
      'SELECT id, name, full_name, email, role, title, department, status, avatar, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    const user = userResult.rows[0];
    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact an administrator.',
      });
    }

    req.user = {
      id: String(user.id),
      name: user.name,
      fullName: user.full_name || user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      department: user.department,
      status: user.status,
      avatar: user.avatar,
      createdAt: user.created_at,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

module.exports = { authenticateToken };
