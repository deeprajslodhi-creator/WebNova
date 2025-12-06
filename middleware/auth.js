const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and authenticate users
 * Checks for token in Authorization header
 * Decodes token and attaches user info to request object
 */
const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token, authorization denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};

/**
 * Middleware to check if user has admin role
 * Must be used after authMiddleware
 */
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
    next();
};

/**
 * Middleware to check if user has teacher role
 * Must be used after authMiddleware
 */
const teacherMiddleware = (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Teacher only.'
        });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    teacherMiddleware
};
