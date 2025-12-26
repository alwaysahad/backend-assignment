const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(AppError.badRequest(errors.array().map((e) => e.msg).join('. ')));
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ min: 2, max: 50 }).withMessage('Name 2-50 chars'),
  body('email').trim().notEmpty().withMessage('Email required').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  validate,
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email required').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
  validate,
];

module.exports = { registerValidation, loginValidation };
