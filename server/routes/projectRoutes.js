const express = require('express');
const projectRoute = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { isProjectAdmin } = require('../middlewares/projectAuth');
const { createProject, getProjects, inviteUser } = require('../controllers/projectController');


projectRoute.use(authMiddleware) 

projectRoute 

.post('/', createProject)
.get('/', getProjects)
.post('/:id/invite', isProjectAdmin, inviteUser);

module.exports = projectRoute;