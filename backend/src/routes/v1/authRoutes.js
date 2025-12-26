const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, changePassword } = require('../../controllers/authController');
const { protect } = require('../../middleware/auth');
const { registerValidation, loginValidation } = require('../../validators/authValidator');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
