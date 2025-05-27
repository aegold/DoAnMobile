const db = require('../db/db');
const bcrypt = require('bcrypt');

const register = (username, password, fullname, email, phone, address, role = "user") => {
  return new Promise((resolve, reject) => {
    // Kiểm tra username, email và số điện thoại đã tồn tại chưa
    db.get(
      "SELECT username, email, phone FROM Users WHERE username = ? OR email = ? OR phone = ?",
      [username, email, phone],
      (err, existingUser) => {
        if (err) {
          console.error("Error checking user data:", err);
          reject(err);
          return;
        }

        if (existingUser) {
          if (existingUser.username === username) {
            reject(new Error("Tên đăng nhập đã tồn tại"));
            return;
          }
          if (existingUser.email === email) {
            reject(new Error("Email đã được sử dụng"));
            return;
          }
          if (existingUser.phone === phone) {
            reject(new Error("Số điện thoại đã được sử dụng"));
            return;
          }
        }

        // Mã hóa mật khẩu
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
            reject(err);
            return;
          }

          // Thêm user mới
          db.run(
            "INSERT INTO Users (username, password, fullname, email, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [username, hashedPassword, fullname, email, phone, address, role],
            function (err) {
              if (err) {
                console.error("Error creating user:", err);
                reject(err);
                return;
              }
              resolve({ id: this.lastID, username, fullname, email, phone, address, role });
            }
          );
        });
      }
    );
  });
};

const login = (username, password) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM Users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) {
          console.error("Error finding user:", err);
          reject(err);
          return;
        }

        if (!user) {
          reject(new Error("Tên đăng nhập không tồn tại"));
          return;
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            reject(err);
            return;
          }

          if (!isMatch) {
            reject(new Error("Mật khẩu không đúng"));
            return;
          }

          resolve({
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
          });
        });
      }
    );
  });
};

module.exports = {
  register,
  login
}; 