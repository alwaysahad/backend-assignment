const Task = require('../models/Task');
const AppError = require('../utils/AppError');

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({ title, description, status, priority, dueDate, user: req.user._id });
    res.status(201).json({ success: true, message: 'Task created', data: { task } });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (req.user.role !== 'admin') query.user = req.user._id;
    else if (req.query.userId) query.user = req.query.userId;

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Task.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { tasks, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('user', 'name email');
    if (!task) return next(AppError.notFound('Task not found'));
    if (req.user.role !== 'admin' && task.user._id.toString() !== req.user._id.toString()) {
      return next(AppError.forbidden('Access denied'));
    }
    res.status(200).json({ success: true, data: { task } });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return next(AppError.notFound('Task not found'));
    if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString()) {
      return next(AppError.forbidden('Access denied'));
    }

    const { title, description, status, priority, dueDate } = req.body;
    task = await Task.findByIdAndUpdate(req.params.id, { title, description, status, priority, dueDate }, { new: true, runValidators: true }).populate('user', 'name email');
    res.status(200).json({ success: true, message: 'Task updated', data: { task } });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(AppError.notFound('Task not found'));
    if (req.user.role !== 'admin' && task.user.toString() !== req.user._id.toString()) {
      return next(AppError.forbidden('Access denied'));
    }
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted', data: null });
  } catch (error) {
    next(error);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'admin' ? {} : { user: req.user._id };
    const stats = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: { stats: stats[0] || { total: 0, pending: 0, inProgress: 0, completed: 0, highPriority: 0 } },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getTaskStats };
