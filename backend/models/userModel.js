const db = require('../db/db');
const bcrypt = require('bcrypt');

const register = (username, password, name, role = "user") => {
  return new Promise((resolve, reject) => {
    // Kiểm tra username đã tồn tại chưa
    db.get("SELECT * FROM Users WHERE username = ?", [username], (err, user) => {
      if (err) {
        console.error("Error checking username:", err);
        reject(err);
        return;
      }

      if (user) {
        reject(new Error("Tên đăng nhập đã tồn tại"));
        return;
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
          "INSERT INTO Users (username, password, name, role) VALUES (?, ?, ?, ?)",
          [username, hashedPassword, name, role],
          function (err) {
            if (err) {
              console.error("Error creating user:", err);
              reject(err);
              return;
            }
            resolve({ id: this.lastID, username, name, role });
          }
        );
      });
    });
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
            name: user.name,
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