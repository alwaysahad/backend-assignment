const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(AppError.badRequest(errors.array().map((e) => e.msg).join('. ')));
  }
  next();
};

const createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Title required').isLength({ min: 3, max: 100 }).withMessage('Title 3-100 chars'),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601(),
  validate,
];

const updateTaskValidation = [
  param('id').isMongoId().withMessage('Invalid ID'),
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601(),
  validate,
];

const taskIdValidation = [param('id').isMongoId().withMessage('Invalid ID'), validate];

const listTasksValidation = [
  query('status').optional().isIn(['pending', 'in-progress', 'completed']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
];

module.exports = { createTaskValidation, updateTaskValidation, taskIdValidation, listTasksValidation };
