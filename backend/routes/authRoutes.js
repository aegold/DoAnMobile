const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { 
  registerUser, 
  loginUser, 
  requestOTP, 
  verifyOTP, 
  resetPasswordWithOTP 
} = require("../controller/authController");

// Middleware validation
const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
  }
  next();
};

// Middleware kiểm tra email
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Vui lòng nhập email" });
  }
  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email không hợp lệ" });
  }
  next();
};

// Middleware kiểm tra OTP
const validateOTP = (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ error: "Vui lòng nhập mã OTP" });
  }
  // Kiểm tra OTP có phải là 6 số
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: "Mã OTP không hợp lệ" });
  }
  next();
};

// Middleware kiểm tra mật khẩu mới
const validateNewPassword = (req, res, next) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: "Vui lòng nhập mật khẩu mới" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
  }
  next();
};

// Đăng ký
router.post("/register", registerUser);

// Đăng nhập
router.post("/login", validateLogin, loginUser);

// Yêu cầu mã OTP để reset mật khẩu
router.post("/forgot-password", validateEmail, requestOTP);

// Xác thực mã OTP
router.post("/verify-otp", validateEmail, validateOTP, verifyOTP);

// Đặt lại mật khẩu với OTP
router.post(
  "/reset-password", 
  validateEmail, 
  validateOTP, 
  validateNewPassword, 
  resetPasswordWithOTP
);

module.exports = router; 