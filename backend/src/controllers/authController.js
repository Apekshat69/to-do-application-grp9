const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const categoryModel = require('../models/categoryModel');

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'taskflow_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      userId: String(user.id),
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
}

function formatUserResponse(user) {
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Jan 15, 2026';

  return {
    id: String(user.id),
    name: user.name,
    fullName: user.full_name || user.name,
    email: user.email,
    role: user.role,
    title: user.title || 'Product Member',
    department: user.department || 'Product',
    status: user.status || 'Active',
    joinedDate,
    avatar: user.avatar || (user.name ? user.name[0].toUpperCase() : 'U'),
  };
}

const authController = {
  async register(req, res, next) {
    try {
      const { fullName, email, password } = req.body;

      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const firstName = fullName.trim().split(' ')[0] || 'User';
      const avatar = firstName[0].toUpperCase();

      const newUser = await userModel.create({
        name: firstName,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: 'user',
        title: 'Product Member',
        department: 'Product',
        avatar,
      });

      // Automatically seed default categories for the new user
      await categoryModel.seedDefaultCategories(newUser.id);

      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: `Account created successfully! Welcome, ${newUser.name}.`,
        token,
        user: formatUserResponse(newUser),
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      if (user.status === 'Inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your account is currently inactive. Please contact support.',
        });
      }

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: formatUserResponse(user),
      });
    } catch (error) {
      next(error);
    }
  },

  async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid administrative credentials.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid administrative credentials.',
        });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Administrator privileges are required for this portal.',
        });
      }

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Admin authentication successful! Access granted.',
        token,
        user: formatUserResponse(user),
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.',
        });
      }
      res.status(200).json({
        success: true,
        user: formatUserResponse(user),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
