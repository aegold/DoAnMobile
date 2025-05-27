const express = require('express');
const router = express.Router();
const { getUserOrders, cancelOrder } = require('../controller/orderController');
const { isAdmin } = require('../middlewares/auth');
const orderModel = require('../models/orderModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');

// API lấy lịch sử đơn hàng của user đã đăng nhập
router.get('/history', authenticateToken, getUserOrders);

// API hủy đơn hàng (cho user)
router.put('/:id/cancel', authenticateToken, cancelOrder);

// API cập nhật trạng thái đơn hàng (cho admin)
router.put('/admin/orders/:id/status', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Trạng thái không được để trống' });
    }

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ['Đang xử lý', 'Đã xác nhận', 'Đã hủy'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    // Kiểm tra đơn hàng tồn tại
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    // Cập nhật trạng thái
    await orderModel.updateOrderStatus(orderId, status);
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 