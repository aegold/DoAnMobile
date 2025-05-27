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

module.exports = {
createOrder,
  createOrderItem,
  
}