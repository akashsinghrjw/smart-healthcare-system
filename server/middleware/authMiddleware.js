
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized, no token'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        message: 'Invalid token'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'User account not found'
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Not authorized, invalid or expired token'
      });
    }

    console.error('Authentication error:', error.message);

    return res.status(500).json({
      message: 'Authentication failed'
    });
  }
};

module.exports = { protect };
