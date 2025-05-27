const db = require('../db/db');
const bcrypt = require('bcrypt');

const getCart = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM cart', [], (err, rows) => {
      if (err) reject(err);
      else {
        console.log('Cart from DB:', rows);
        resolve(rows);
      }
    });
  });
};

const addToCart = (dish) => {
  return new Promise((resolve, reject) => {
    console.log('Adding to cart:', dish);
    
    // Kiểm tra xem món đã có trong giỏ hàng chưa
    db.get('SELECT * FROM cart WHERE dishId = ?', [dish.id], (err, existingItem) => {
      if (err) {
        console.error('Error checking cart:', err);
        reject(err);
        return;
      }

      if (existingItem) {
        // Nếu món đã có, cập nhật số lượng
        const newQuantity = existingItem.quantity + (dish.quantity || 1);
        db.run(
          'UPDATE cart SET quantity = ? WHERE dishId = ?',
          [newQuantity, dish.id],
          (err) => {
            if (err) {
              console.error('Error updating cart:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      } else {
        // Nếu món chưa có, thêm mới
        db.run(
          'INSERT INTO cart (dishId, quantity, name, price, image) VALUES (?, ?, ?, ?, ?)',
          [dish.id, dish.quantity || 1, dish.name, dish.price, dish.image],
          (err) => {
            if (err) {
              console.error('Error adding to cart:', err);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      }
    });
  });
};

const updateCartQuantity = (dishId, change) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT quantity FROM cart WHERE dishId = ?', [dishId], (err, row) => {
      if (err) reject(err);
      else if (row) {
        const newQuantity = Math.max(0, row.quantity + change);
        db.run(
          'UPDATE cart SET quantity = ? WHERE dishId = ?',
          [newQuantity, dishId],
          (err) => (err ? reject(err) : resolve())
        );
      } else resolve();
    });
  });
};

const removeFromCart = (dishId) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM cart WHERE dishId = ?', [dishId], (err) => (err ? reject(err) : resolve()));
  });
};
const getDishById = (dishId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Dishes WHERE id = ?', [dishId], (err, dish) => {
      if (err) {
        console.error('Error fetching dish:', err);
        reject(err);
      } else {
        resolve(dish);
      }
    });
  });
};
module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
getDishById,
}