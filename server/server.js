const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { initDatabases, initDatabase } = require('./controllers/initDb.js');
const { homeRoute } = require('./routes/defaultRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

initDatabase();

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/', homeRoute);
app.use('/api/auth', authRoutes);


app.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));


app.listen(PORT,(err)=>{
   if (err) {
        console.log(err)
    }
    
    console.log(`Successfully Connected to Server at Port: ${PORT}`)
    
})