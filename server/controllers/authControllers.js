const db = require('../models/connection.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {JWT_SECRET} = process.env;

const register = async (req, res) => {
  const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
             error: 'All fields are required' 
        });
    }

     try {
       const hash = await bcrypt.hash(password, 10);

       const registerQuery = `
            INSERT INTO userDetails (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email
        `;
       
       const result = await db.query(registerQuery,[username, email, hash]);
       res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result.rows[0]
       });
    } catch (err) {
       console.error('Register error:', err);
       if (err.code === '23505') {
         return res.status(409).json({ error: 'Username or email already taken' });
       }
       return res.status(500).json({ error: 'Something went wrong' });
     }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!JWT_SECRET) {
      console.error('Missing JWT_SECRET env configuration');
      return res.status(500).json({ error: 'Authentication configuration error' });
    }

    try {
      const userQuery = 'SELECT * FROM userDetails WHERE email = $1';
      const result = await db.query(userQuery, [email]);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '7d',
      });

     res.cookie('token', token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       maxAge: 7 * 24 * 60 * 60 * 1000,
     });

     res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email 
    });
    }
    catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
   
};

module.exports = {register,login};
