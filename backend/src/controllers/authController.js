const User = require('../models/User');
const { createTokenResponse } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return next(AppError.conflict('Email already registered'));

    const userRole = role === 'admin' && req.user?.role === 'admin' ? 'admin' : 'user';
    const user = await User.create({ name, email, password, role: userRole });
    const tokenResponse = createTokenResponse(user);

    res.status(201).json({ success: true, message: 'User registered', data: tokenResponse });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) return next(AppError.unauthorized('Invalid credentials'));
    if (!user.isActive) return next(AppError.unauthorized('Account deactivated'));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(AppError.unauthorized('Invalid credentials'));

    const tokenResponse = createTokenResponse(user);
    res.status(200).json({ success: true, message: 'Login successful', data: tokenResponse });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } },
    });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (email && email !== req.user.email) {
      const exists = await User.findOne({ email });
      if (exists) return next(AppError.conflict('Email in use'));
    }

    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true });
    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return next(AppError.unauthorized('Current password incorrect'));

    user.password = newPassword;
    await user.save();

    const tokenResponse = createTokenResponse(user);
    res.status(200).json({ success: true, message: 'Password changed', data: tokenResponse });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateMe, changePassword };
