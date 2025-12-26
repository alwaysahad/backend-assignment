const AppError = require('../utils/AppError');

const handleCastError = (err) => AppError.badRequest(`Invalid ${err.path}: ${err.value}`);
const handleDuplicateKey = (err) => AppError.conflict(`${Object.keys(err.keyValue)[0]} already exists`);
const handleValidation = (err) => AppError.badRequest(Object.values(err.errors).map((e) => e.message).join('. '));

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  let error = { ...err, message: err.message };
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidation(err);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.isOperational ? error.message : 'Something went wrong',
  });
};

module.exports = errorHandler;
