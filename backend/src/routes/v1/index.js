const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/tasks', require('./taskRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
