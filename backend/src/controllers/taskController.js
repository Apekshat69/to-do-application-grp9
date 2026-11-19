const taskModel = require('../models/taskModel');
const categoryModel = require('../models/categoryModel');

const sampleTasks = [
  {
    title: 'Finish project report',
    description: 'Compile quarterly performance metrics, frontend benchmarks, and deliverables summary.',
    dueDate: '2026-11-18',
    priority: 'High',
    category: 'Work',
    status: 'In Progress',
  },
  {
    title: 'Study Angular 20 & signals architecture',
    description: 'Review standalone component tree, signal stores, reactive forms, and routing guards.',
    dueDate: '2026-11-18',
    priority: 'Medium',
    category: 'Study',
    status: 'Completed',
  },
  {
    title: 'Go for a 30-minute evening walk',
    description: 'Refresh and take a break around the community park after the afternoon sprint.',
    dueDate: '2026-11-19',
    priority: 'Low',
    category: 'Personal',
    status: 'Pending',
  },
  {
    title: 'Read Chapter 4 of Atomic Habits',
    description: 'Focus on habit stacking and environmental cues for high productivity.',
    dueDate: '2026-11-14',
    priority: 'Low',
    category: 'Personal',
    status: 'Pending',
  },
  {
    title: 'Plan sprint deliverables',
    description: 'Map out roadmap milestones, team priorities, and ticket estimates.',
    dueDate: '2026-11-20',
    priority: 'Medium',
    category: 'Work',
    status: 'Pending',
  },
  {
    title: 'Review team pull requests',
    description: 'Inspect UI component refactoring, accessibility labels, and responsive layout styling.',
    dueDate: '2026-11-18',
    priority: 'High',
    category: 'Work',
    status: 'Completed',
  },
  {
    title: 'Data Structures practice set',
    description: 'Solve 3 graph traversal and dynamic programming algorithmic challenges.',
    dueDate: '2026-11-21',
    priority: 'Medium',
    category: 'Study',
    status: 'In Progress',
  },
  {
    title: 'Doctor annual health checkup',
    description: 'Routine general wellness exam and prescription renewal at Central Clinic.',
    dueDate: '2026-11-12',
    priority: 'High',
    category: 'Other',
    status: 'Pending',
  },
  {
    title: 'Clean workspace desk setup',
    description: 'Organize monitor cables, wipe keyboard, and declutter physical notebooks.',
    dueDate: '2026-11-19',
    priority: 'Low',
    category: 'Other',
    status: 'Completed',
  },
  {
    title: 'Prepare demo architecture presentation',
    description: 'Synthesize architecture diagrams, feature flowcharts, and component hierarchy.',
    dueDate: '2026-11-22',
    priority: 'High',
    category: 'Work',
    status: 'In Progress',
  },
];

const taskController = {
  async getTasks(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        category: req.query.category,
        search: req.query.search,
        sortBy: req.query.sortBy,
      };

      const tasks = await taskModel.findByUserId(req.user.id, filters);
      res.status(200).json({
        success: true,
        tasks,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTaskStats(req, res, next) {
    try {
      const stats = await taskModel.getStatsByUserId(req.user.id);
      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTaskById(req, res, next) {
    try {
      const task = await taskModel.findById(req.params.id, req.user.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or access denied.',
        });
      }
      res.status(200).json({
        success: true,
        task,
      });
    } catch (error) {
      next(error);
    }
  },

  async createTask(req, res, next) {
    try {
      const { title, description, dueDate, priority, category, status } = req.body;

      let categoryId = null;
      if (category) {
        const cat = await categoryModel.findOrCreate(req.user.id, category);
        categoryId = cat.id;
      }

      const newTask = await taskModel.create({
        userId: req.user.id,
        categoryId,
        title,
        description,
        status: status || 'Pending',
        priority: priority || 'Medium',
        dueDate: dueDate || null,
      });

      res.status(201).json({
        success: true,
        message: `Task "${newTask.title}" created successfully!`,
        task: newTask,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, dueDate, priority, category, status, completed } = req.body;

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (dueDate !== undefined) updates.dueDate = dueDate;
      if (priority !== undefined) updates.priority = priority;

      if (status !== undefined) {
        updates.status = status;
      } else if (completed !== undefined) {
        updates.status = completed ? 'Completed' : 'Pending';
      }

      if (category !== undefined) {
        const cat = await categoryModel.findOrCreate(req.user.id, category);
        updates.categoryId = cat.id;
      }

      const updated = await taskModel.update(id, req.user.id, updates);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or access denied.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Task updated successfully!',
        task: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
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

      const updated = await taskModel.update(id, req.user.id, { status });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or access denied.',
        });
      }

      res.status(200).json({
        success: true,
        message: `Status updated to ${status}`,
        task: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleComplete(req, res, next) {
    try {
      const { id } = req.params;
      const task = await taskModel.findById(id, req.user.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or access denied.',
        });
      }

      const nextStatus = task.completed ? 'Pending' : 'Completed';
      const updated = await taskModel.update(id, req.user.id, { status: nextStatus });

      res.status(200).json({
        success: true,
        message: `Task marked as ${nextStatus}`,
        task: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await taskModel.delete(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Task not found or access denied.',
        });
      }

      res.status(200).json({
        success: true,
        message: `Deleted "${deleted.title}"`,
      });
    } catch (error) {
      next(error);
    }
  },

  async clearCompleted(req, res, next) {
    try {
      const count = await taskModel.clearCompleted(req.user.id);
      res.status(200).json({
        success: true,
        message: count > 0 ? `Cleared ${count} completed task(s)` : 'No completed tasks to clear',
        clearedCount: count,
      });
    } catch (error) {
      next(error);
    }
  },

  async resetTasks(req, res, next) {
    try {
      // Clear existing user tasks
      const db = require('../config/db');
      await db.query('DELETE FROM tasks WHERE user_id = $1', [req.user.id]);

      // Seed categories
      await categoryModel.seedDefaultCategories(req.user.id);

      // Seed sample tasks
      for (const t of sampleTasks) {
        const cat = await categoryModel.findOrCreate(req.user.id, t.category);
        await taskModel.create({
          userId: req.user.id,
          categoryId: cat.id,
          title: t.title,
          description: t.description,
          dueDate: t.dueDate,
          priority: t.priority,
          status: t.status,
        });
      }

      const tasks = await taskModel.findByUserId(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Tasks reset to default sample dataset',
        tasks,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = taskController;
