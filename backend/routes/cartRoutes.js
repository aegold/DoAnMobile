const express = require('express');
const router = express.Router();
const cartModel = require('../models/cartModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const { getCart,addToCart,updateCart,deleteFromCart} = require('../controller/cartController');

// API lấy giỏ hàng
router.get('/cart', authenticateToken, getCart);

// API thêm món vào giỏ hàng
router.post('/cart/add', authenticateToken,addToCart );

// API cập nhật số lượng giỏ hàng
router.put('/cart/update',updateCart);

// API xóa món khỏi giỏ hàng
router.delete('/cart/remove/:dishId',deleteFromCart);

module.exports = router;