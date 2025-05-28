const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { updateUserProfile, updateAvatar, changePassword } = require('../controller/userController');
const upload = require('../middlewares/upload');

// Route cập nhật thông tin cá nhân (yêu cầu xác thực)
router.put('/profile', authenticateToken, updateUserProfile);

// Update avatar
// router.put('/avatar', authenticateToken, upload.single('image'), updateAvatar);

// Change password
router.post('/change-password', authenticateToken, changePassword);

module.exports = router; 