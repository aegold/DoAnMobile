const db = require('../db/db');
const bcrypt = require('bcrypt');

// Thời gian hết hạn của OTP (5 phút)
const OTP_EXPIRY = 300000;

const register = (username, password, fullname, email, phone, address, image, role = "user") => {
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
            "INSERT INTO Users (username, password, fullname, email, phone, address, image, role) VALUES (?,?,?, ?, ?, ?, ?, ?)",
            [username, hashedPassword, fullname, email, phone, address,image,role],
            function (err) {
              if (err) {
                console.error("Error creating user:", err);
                reject(err);
                return;
              }
              resolve({ id: this.lastID, username, fullname, email, phone, address,image, role });
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
            image: user.image,
            role: user.role,
          });
        });
      }
    );
  });
};

// Tạo mã OTP cho quên mật khẩu
const generateResetOTP = (email) => {
  return new Promise((resolve, reject) => {
    // Kiểm tra email tồn tại
    db.get("SELECT id FROM Users WHERE email = ?", [email], (err, user) => {
      if (err) {
        console.error("Error checking email:", err);
        reject(err);
        return;
      }

      if (!user) {
        reject(new Error("Email không tồn tại trong hệ thống"));
        return;
      }

      // Tạo mã OTP 6 số
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + OTP_EXPIRY;

      // Lưu OTP và thời gian hết hạn vào database
      db.run(
        "UPDATE Users SET resetOTP = ?, resetOTPExpiry = ? WHERE email = ?",
        [otp, otpExpiry, email],
        (err) => {
          if (err) {
            console.error("Error saving OTP:", err);
            reject(err);
            return;
          }
          resolve(otp);
        }
      );
    });
  });
};

// Xác thực mã OTP
const verifyResetOTP = (email, otp) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM Users WHERE email = ? AND resetOTP = ? AND resetOTPExpiry > ?",
      [email, otp, Date.now()],
      (err, user) => {
        if (err) {
          console.error("Error verifying OTP:", err);
          reject(err);
          return;
        }

        if (!user) {
          reject(new Error("Mã OTP không hợp lệ hoặc đã hết hạn"));
          return;
        }

        resolve(true);
      }
    );
  });
};

// Reset mật khẩu sau khi xác thực OTP
const resetPassword = (email, otp, newPassword) => {
  return new Promise((resolve, reject) => {
    // Xác thực OTP trước
    verifyResetOTP(email, otp)
      .then(() => {
        // Mã hóa mật khẩu mới
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing new password:", err);
            reject(err);
            return;
          }

          // Cập nhật mật khẩu và xóa OTP
          db.run(
            "UPDATE Users SET password = ?, resetOTP = NULL, resetOTPExpiry = NULL WHERE email = ? AND resetOTP = ?",
            [hashedPassword, email, otp],
            (err) => {
              if (err) {
                console.error("Error updating password:", err);
                reject(err);
                return;
              }
              resolve({ message: "Mật khẩu đã được cập nhật thành công" });
            }
          );
        });
      })
      .catch(reject);
  });
};

// Kiểm tra email tồn tại
const checkEmailExists = (email) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT email FROM Users WHERE email = ?", [email], (err, user) => {
      if (err) {
        console.error("Error checking email:", err);
        reject(err);
        return;
      }
      resolve(!!user);
    });
  });
};

// Cập nhật thông tin cá nhân
const updateProfile = (userId, { fullname, email, phone, address }) => {
  return new Promise((resolve, reject) => {
    // Kiểm tra email đã tồn tại chưa (trừ email hiện tại của user)
    db.get(
      "SELECT * FROM Users WHERE email = ? AND id != ?",
      [email, userId],
      (err, existingUser) => {
        if (err) {
          console.error("Error checking email:", err);
          reject(err);
          return;
        }

        if (existingUser) {
          reject(new Error("Email đã được sử dụng"));
          return;
        }

        // Cập nhật thông tin người dùng
        db.run(
          "UPDATE Users SET fullname = ?, email = ?, phone = ?, address = ? WHERE id = ?",
          [fullname, email, phone || null, address || null, userId],
          function(err) {
            if (err) {
              console.error("Error updating user:", err);
              reject(err);
              return;
            }

            // Lấy thông tin người dùng sau khi cập nhật
            db.get(
              "SELECT id, username, fullname, email, phone, address, role, image FROM Users WHERE id = ?",
              [userId],
              (err, user) => {
                if (err) {
                  console.error("Error fetching updated user:", err);
                  reject(err);
                  return;
                }

                if (!user) {
                  reject(new Error("Không tìm thấy thông tin người dùng"));
                  return;
                }

                resolve(user);
              }
            );
          }
        );
      }
    );
  });
};

module.exports = {
  register,
  login,
  generateResetOTP,
  verifyResetOTP,
  resetPassword,
  checkEmailExists,
  updateProfile
}; 