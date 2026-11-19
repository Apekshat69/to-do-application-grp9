const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public Auth Endpoints
router.post('/register', validateRegister, authController.register);
router.post('/signup', validateRegister, authController.register); // Alias for signup
router.post('/login', validateLogin, authController.login);
router.post('/admin/login', validateLogin, authController.adminLogin);

// Protected Auth Endpoint
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
