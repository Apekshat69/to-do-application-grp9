const taskModel = require('../models/taskModel');
const userModel = require('../models/userModel');

const adminController = {
  async getDashboardStats(req, res, next) {
    try {
      const stats = await taskModel.getAdminStats();
      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllTasks(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        status: req.query.status,
        priority: req.query.priority,
        search: req.query.search,
      };

      const tasks = await taskModel.getAllTasksForAdmin(filters);
      res.status(200).json({
        success: true,
        tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTaskStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['Pending', 'In Progress', 'Completed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      // Admin can update any task regardless of ownership
      const updated = await taskModel.update(id, null, { status });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Task not found in system.',
        });
      }

      res.status(200).json({
        success: true,
        message: `Task status updated to "${status}"`,
        task: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await taskModel.delete(id, null);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Task not found in system.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Task successfully deleted by administrator.',
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const userTaskStats = await userModel.getAllUsersWithTaskStats();
      res.status(200).json({
        success: true,
        users: userTaskStats,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserTasks(req, res, next) {
    try {
      const { userId } = req.params;
      const tasks = await taskModel.findByUserId(userId);
      res.status(200).json({
        success: true,
        tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMonthlyActivity(req, res, next) {
    try {
      const activity = await taskModel.getMonthlyActivity();
      res.status(200).json({
        success: true,
        activity,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStatusDoughnut(req, res, next) {
    try {
      const doughnut = await taskModel.getStatusBreakdown();
      res.status(200).json({
        success: true,
        doughnut,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminController;
