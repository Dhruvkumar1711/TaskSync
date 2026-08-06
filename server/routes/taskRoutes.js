const express = require('express');
const taskRoute = express.Router({ mergeParams: true });
const authMiddleware = require('../middlewares/authMiddleware');
const { isProjectMember } = require('../middlewares/projectAuth');
const { createTask, getTasks } = require('../controllers/taskController');

taskRoute.use(authMiddleware);

taskRoute.get('/',authMiddleware, isProjectMember, getTasks);
taskRoute.post('/', authMiddleware, isProjectMember, createTask);

module.exports = taskRoute;

