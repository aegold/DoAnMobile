const express = require('express');
const router = express.Router();
const menuModel = require('../models/menuModel');
const orderModel = require('../models/orderModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');

// Middleware kiểm tra quyền admin
const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: 'Không tìm thấy thông tin người dùng' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Quyền bị từ chối, chỉ admin mới được phép' });
  }
  next();
};

// API tìm kiếm


// API đặt hàng
router.post('/order', async (req, res) => {
  const { userId, items, total, address, phone } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Giỏ hàng trống' });
  }

  if (!address || !phone) {
    return res.status(400).json({ error: 'Địa chỉ và số điện thoại là bắt buộc' });
  }

  try {
    const orderId = await orderModel.createOrder(userId, total, address, phone, 'Đang xử lý');
    for (const item of items) {
      await orderModel.createOrderItem(orderId, item);
    }
    res.json({ message: 'Đặt hàng thành công', orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API đăng ký
// router.post('/register', async (req, res) => {
//   const { username, password, name } = req.body;
//   if (!username || !password || !name) {
//     return res.status(400).json({ error: 'Username, mật khẩu và tên là bắt buộc' });
//   }

//   try {
//     const user = await menuModel.registerUser(username, password, name);
//     res.json({ message: 'Đăng ký thành công', user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// API đăng nhập
// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username và mật khẩu là bắt buộc' });
//   }

//   try {
//     const user = await menuModel.loginUser(username, password);
//     if (!user) {
//       return res.status(401).json({ error: 'Username hoặc mật khẩu không đúng' });
//     }
//     res.json({ message: 'Đăng nhập thành công', user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



module.exports = router;