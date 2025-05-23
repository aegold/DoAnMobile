const express = require('express');
const router = express.Router();
const menuModel = require('../models/menuModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const { getUserById, getAllOrders } = require('../controller/manageController');

router.get('/user/:userId', getUserById);

// API lấy danh sách đơn hàng
router.get('/orders', authenticateToken, checkRole(['admin']), getAllOrders );

module.exports = router;