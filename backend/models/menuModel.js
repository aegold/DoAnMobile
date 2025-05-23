const db = require('../db/db');
const bcrypt = require('bcrypt');



// const registerUser = (username, password, name, role = 'user') => {
//   return new Promise((resolve, reject) => {
//     // Kiểm tra username đã tồn tại chưa
//     db.get('SELECT * FROM Users WHERE username = ?', [username], (err, user) => {
//       if (err) {
//         console.error('Error checking username:', err);
//         reject(err);
//         return;
//       }

//       if (user) {
//         reject(new Error('Tên đăng nhập đã tồn tại'));
//         return;
//       }

//       // Mã hóa mật khẩu
//       bcrypt.hash(password, 10, (err, hashedPassword) => {
//         if (err) {
//           console.error('Error hashing password:', err);
//           reject(err);
//           return;
//         }

//         // Thêm user mới
//         db.run(
//           'INSERT INTO Users (username, password, name, role) VALUES (?, ?, ?, ?)',
//           [username, hashedPassword, name, role],
//           function (err) {
//             if (err) {
//               console.error('Error creating user:', err);
//               reject(err);
//               return;
//             }
//             resolve({ id: this.lastID, username, name, role });
//           }
//         );
//       });
//     });
//   });
// };

// const loginUser = (username, password) => {
//   return new Promise((resolve, reject) => {
//     db.get(
//       'SELECT * FROM Users WHERE username = ?',
//       [username],
//       (err, user) => {
//         if (err) {
//           console.error('Error finding user:', err);
//           reject(err);
//           return;
//         }

//         if (!user) {
//           reject(new Error('Tên đăng nhập không tồn tại'));
//           return;
//         }

//         bcrypt.compare(password, user.password, (err, isMatch) => {
//           if (err) {
//             console.error('Error comparing passwords:', err);
//             reject(err);
//             return;
//           }

//           if (!isMatch) {
//             reject(new Error('Mật khẩu không đúng'));
//             return;
//           }

//           resolve({
//             id: user.id,
//             username: user.username,
//             name: user.name,
//             role: user.role
//           });
//         });
//       }
//     );
//   });
// };

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

module.exports = {
  // registerUser,
  // loginUser,
  getUserById,
  getAllOrders,
};