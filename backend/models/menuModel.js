const db = require('../db/db');

const getCategories = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Categories', [], (err, rows) => {
      if (err) reject(err);
      else {
        console.log('Categories from DB:', rows);
        resolve(rows);
      }
    });
  });
};

const createCategory = (name, image) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Categories (name, image) VALUES (?, ?)',
      [name, image],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const updateCategory = (id, name, image) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE Categories SET name = ?, image = ? WHERE id = ?',
      [name, image, id],
      (err) => (err ? reject(err) : resolve())
    );
  });
};

const deleteCategory = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM Categories WHERE id = ?', [id], (err) => (err ? reject(err) : resolve()));
  });
};

const getDishesByCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Dishes WHERE category_id = ?', [categoryId], (err, rows) => {
      if (err) reject(err);
      else {
        console.log('Dishes from DB:', rows);
        resolve(rows);
      }
    });
  });
};

const getAllDishes = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Dishes', [], (err, rows) => {
      if (err) reject(err);
      else {
        console.log('All Dishes from DB:', rows);
        resolve(rows);
      }
    });
  });
};

const createDish = (categoryId, name, description, price, image) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Dishes (category_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)',
      [categoryId, name, description, price, image],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const updateDish = (id, categoryId, name, description, price, image) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE Dishes SET category_id = ?, name = ?, description = ?, price = ?, image = ? WHERE id = ?',
      [categoryId, name, description, price, image, id],
      (err) => (err ? reject(err) : resolve())
    );
  });
};

const deleteDish = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM Dishes WHERE id = ?', [id], (err) => (err ? reject(err) : resolve()));
  });
};

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

const searchDishes = (query) => {
  return new Promise((resolve, reject) => {
    console.log('Searching with query:', query);
    db.all(
      'SELECT * FROM Dishes WHERE name LIKE ?',
      [`%${query}%`],
      (err, rows) => {
        if (err) {
          console.error('Error in search query:', err);
          reject(err);
        } else {
          console.log('Search results from DB:', rows);
          resolve(rows);
        }
      }
    );
  });
};

const createOrder = (userId, total) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Orders (user_id, total) VALUES (?, ?)',
      [userId, total],
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

const registerUser = (email, password, name, address, phone, role = 'customer') => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Users (email, password, name, address, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, name, address, phone, role],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM Users WHERE email = ? AND password = ?',
      [email, password],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

const getUserById = (userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Users WHERE id = ?', [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getAllOrders = () => {
  return new Promise((resolve, reject) => {
    // Đầu tiên lấy danh sách đơn hàng
    db.all(`
      SELECT o.*, u.name as user_name 
      FROM Orders o
      LEFT JOIN Users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `, [], (err, orders) => {
      if (err) {
        console.error('Error fetching orders:', err);
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
          console.log('All orders processed:', ordersWithItems);
          resolve(ordersWithItems);
        }
      };

      // Lấy chi tiết cho từng đơn hàng
      orders.forEach(order => {
        db.all(
          'SELECT name, quantity, price FROM OrderItems WHERE order_id = ?',
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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getDishesByCategory,
  createDish,
  updateDish,
  deleteDish,
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  searchDishes,
  createOrder,
  createOrderItem,
  registerUser,
  loginUser,
  getUserById,
  getAllDishes,
  getAllOrders,
  getDishById
};