const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser, getDashboardStats } = require('../../controllers/adminController');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.route('/users').get(getUsers);
router.route('/users/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
