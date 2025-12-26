const User = require('../models/User');
const Task = require('../models/Task');
const AppError = require('../utils/AppError');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { users, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(AppError.notFound('User not found'));
    const taskCount = await Task.countDocuments({ user: user._id });
    res.status(200).json({ success: true, data: { user, taskCount } });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;

    if (req.params.id === req.user._id.toString() && role && role !== 'admin') {
      return next(AppError.badRequest('Cannot change own role'));
    }

    const user = await User.findByIdAndUpdate(req.params.id, { name, email, role, isActive }, { new: true, runValidators: true });
    if (!user) return next(AppError.notFound('User not found'));

    res.status(200).json({ success: true, message: 'User updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return next(AppError.badRequest('Cannot delete own account'));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(AppError.notFound('User not found'));

    await Task.deleteMany({ user: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted', data: null });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [userStats, taskStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          },
        },
      ]),
      Task.aggregate([
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            pendingTasks: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: userStats[0] || { totalUsers: 0, activeUsers: 0, adminUsers: 0 },
        tasks: taskStats[0] || { totalTasks: 0, pendingTasks: 0, completedTasks: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, updateUser, deleteUser, getDashboardStats };
