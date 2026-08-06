const authRoutes = require('express').Router();
const { register, login } = require('../controllers/authControllers');
const authMiddleware = require('../middlewares/authMiddleware');

authRoutes

.post('/register', register)
.post('/login', login)

module.exports = authRoutes;