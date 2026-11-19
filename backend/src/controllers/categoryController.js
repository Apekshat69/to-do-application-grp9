const categoryModel = require('../models/categoryModel');

const categoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await categoryModel.findByUserId(req.user.id);
      res.status(200).json({
        success: true,
        categories,
      });
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req, res, next) {
    try {
      const { name } = req.body;
      const category = await categoryModel.findOrCreate(req.user.id, name);
      res.status(201).json({
        success: true,
        message: `Category "${category.name}" created.`,
        category,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const updated = await categoryModel.update(id, req.user.id, name);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Category not found or you do not have permission to edit it.',
        });
      }
      res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        category: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await categoryModel.delete(id, req.user.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Category not found or already deleted.',
        });
      }
      res.status(200).json({
        success: true,
        message: `Category "${deleted.name}" deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = categoryController;
