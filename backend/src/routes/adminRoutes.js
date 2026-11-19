const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// Enforce both authentication and administrator role on all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Admin Dashboard & Overview
router.get('/stats', adminController.getDashboardStats);
router.get('/analytics/monthly', adminController.getMonthlyActivity);
router.get('/analytics/status', adminController.getStatusDoughnut);

// Admin Task Auditing & Moderation
router.get('/tasks', adminController.getAllTasks);
router.patch('/tasks/:id/status', adminController.updateTaskStatus);
router.delete('/tasks/:id', adminController.deleteTask);

// Admin User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId/tasks', adminController.getUserTasks);

module.exports = router;
