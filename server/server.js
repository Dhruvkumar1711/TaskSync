const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { initDatabases, initDatabase } = require('./controllers/initDb.js');
const { homeRoute } = require('./routes/defaultRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const { isProjectMember, isProjectAdmin } = require('./middlewares/projectAuth.js');
const projectRoute = require('./routes/projectRoutes');
const taskRoute = require('./routes/taskRoutes');
const {updateTask} = require('./controllers/taskController.js');


initDatabase();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/', homeRoute);
app.use('/api/auth', authRoutes);
app.use('/api/projects',projectRoute)
app.use('/api/projects/:id/tasks', taskRoute);


app.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));

app.get('/api/projects/:id/test-member', authMiddleware, isProjectMember, (req, res) => {
     res.json({ message: 'You are a member, access granted' });
});

app.get('/api/projects/:id/test-admin', authMiddleware, isProjectAdmin, (req, res) => {
     res.json({ message: 'You are an admin, access granted' });
});

app.put('/api/tasks/:taskId', authMiddleware, updateTask);


app.listen(PORT,(err)=>{
   if (err) {
        console.log(err)
    }
    
    console.log(`Successfully Connected to Server at Port: ${PORT}`)
    
})