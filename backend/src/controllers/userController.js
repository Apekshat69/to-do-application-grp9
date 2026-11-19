const userModel = require('../models/userModel');

const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found.',
        });
      }

      const joinedDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Jan 15, 2026';

      res.status(200).json({
        success: true,
        user: {
          id: String(user.id),
          name: user.name,
          fullName: user.full_name || user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          department: user.department,
          status: user.status,
          avatar: user.avatar || (user.name ? user.name[0].toUpperCase() : 'U'),
          joinedDate,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { fullName, email, role, title, department } = req.body;
      const updates = {};

      if (fullName) {
        updates.fullName = fullName.trim();
        updates.avatar = fullName.trim()[0].toUpperCase();
      }
      if (email) updates.email = email.trim().toLowerCase();
      // Notice: frontend settings sends role: string (which is actually user's title / job role in settings.component.ts)
      if (title || role) {
        updates.title = title || role;
      }
      if (department) updates.department = department.trim();

      const updated = await userModel.update(req.user.id, updates);

      const joinedDate = updated.created_at
        ? new Date(updated.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Jan 15, 2026';

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        user: {
          id: String(updated.id),
          name: updated.name,
          fullName: updated.full_name || updated.name,
          email: updated.email,
          role: updated.role,
          title: updated.title,
          department: updated.department,
          status: updated.status,
          avatar: updated.avatar || (updated.name ? updated.name[0].toUpperCase() : 'U'),
          joinedDate,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
