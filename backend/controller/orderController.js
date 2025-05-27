const orderModel = require('../models/orderModel');

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID từ token đã xác thực
    const orders = await orderModel.getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    
    // Kiểm tra xem đơn hàng có tồn tại và thuộc về user không
    const order = await orderModel.getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    
    if (order.user_id !== userId) {
      return res.status(403).json({ error: 'Không có quyền hủy đơn hàng này' });
    }
    
    if (order.status !== 'Đang xử lý') {
      return res.status(400).json({ error: 'Chỉ có thể hủy đơn hàng đang xử lý' });
    }
    
    await orderModel.updateOrderStatus(orderId, 'Đã hủy');
    res.json({ message: 'Hủy đơn hàng thành công' });
  } catch (err) {
    console.error('Error canceling order:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUserOrders,
  cancelOrder
};