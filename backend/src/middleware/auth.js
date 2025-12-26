const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(AppError.unauthorized('No token provided'));

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) return next(AppError.unauthorized('User not found'));
    if (!user.isActive) return next(AppError.unauthorized('Account deactivated'));

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return next(AppError.unauthorized('Invalid token'));
    if (error.name === 'TokenExpiredError') return next(AppError.unauthorized('Token expired'));
    next(error);
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(AppError.forbidden('Permission denied'));
  }
  next();
};

module.exports = { protect, authorize };


