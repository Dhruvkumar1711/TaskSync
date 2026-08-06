const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;

const authMiddleware = (req, res, next) => {

    const cookie = req.cookies.token;
    const token = cookie || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'Failed',
            message: 'Access Denied. No token provided.',
        });
    }

    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not configured');
        return res.status(500).json({
            status: 'Failed',
            message: 'Authentication configuration error',
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({
            status: 'Failed',
            message: 'Invalid Token',
        });
    }
};

module.exports = authMiddleware;