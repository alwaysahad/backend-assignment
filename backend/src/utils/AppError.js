class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

AppError.badRequest = (msg = 'Bad Request') => new AppError(msg, 400);
AppError.unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401);
AppError.forbidden = (msg = 'Forbidden') => new AppError(msg, 403);
AppError.notFound = (msg = 'Not Found') => new AppError(msg, 404);
AppError.conflict = (msg = 'Conflict') => new AppError(msg, 409);

module.exports = AppError;
