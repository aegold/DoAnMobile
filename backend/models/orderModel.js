const db = require('../db/db');
const bcrypt = require('bcrypt');

const createOrder = (userId, total, address, phone, status) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Orders (user_id, total, address, phone ,status) VALUES (?, ?, ?, ?, ?)',
      [userId, total, address, phone, status],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const createOrderItem = (orderId, item) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO OrderItems (order_id, dish_id, quantity, name, price) VALUES (?, ?, ?, ?, ?)',
      [orderId, item.id, item.quantity, item.name, item.price],
      (err) => (err ? reject(err) : resolve())
    );
  });
};

const getUserOrders = (userId) => {
  return new Promise((resolve, reject) => {
    // Lấy danh sách đơn hàng của user
    db.all(`
      SELECT o.*, u.fullname as user_name 
      FROM Orders o
      LEFT JOIN Users u ON o.user_id = u.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId], (err, orders) => {
      if (err) {
        console.error('Error fetching user orders:', err);
        reject(err);
        return;
      }

      if (!orders || orders.length === 0) {
        resolve([]);
        return;
      }

      // Đếm số lượng đơn hàng đã xử lý
      let processedOrders = 0;
      const ordersWithItems = [];

      // Hàm xử lý khi tất cả đơn hàng đã được xử lý
      const checkAllProcessed = () => {
        if (processedOrders === orders.length) {
          resolve(ordersWithItems);
        }
      };

      // Lấy chi tiết cho từng đơn hàng
      orders.forEach(order => {
        db.all(
          `SELECT oi.name, oi.quantity, oi.price, d.image 
           FROM OrderItems oi
           LEFT JOIN Dishes d ON oi.dish_id = d.id
           WHERE oi.order_id = ?`,
          [order.id],
          (err, items) => {
            if (err) {
              console.error('Error fetching items for order:', order.id, err);
              items = [];
            }
            
            ordersWithItems.push({
              ...order,
              items: items || []
            });
            
            processedOrders++;
            checkAllProcessed();
          }
        );
      });
    });
  });
};

const getOrderById = (orderId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM Orders WHERE id = ?',
      [orderId],
      (err, order) => {
        if (err) reject(err);
        else resolve(order);
      }
    );
  });
};

const updateOrderStatus = (orderId, status) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE Orders SET status = ? WHERE id = ?',
      [status, orderId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

module.exports = {
  createOrder,
  createOrderItem,
  getUserOrders,
  getOrderById,
  updateOrderStatus
};