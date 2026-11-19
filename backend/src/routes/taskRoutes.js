const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateTask } = require('../middleware/validationMiddleware');

router.use(authenticateToken);

// User Task Endpoints
router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.post('/', validateTask, taskController.createTask);
router.delete('/completed', taskController.clearCompleted);
router.post('/reset', taskController.resetTasks);

router.get('/:id', taskController.getTaskById);
router.put('/:id', validateTask, taskController.updateTask);
router.patch('/:id/status', taskController.updateStatus);
router.patch('/:id/toggle', taskController.toggleComplete);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
