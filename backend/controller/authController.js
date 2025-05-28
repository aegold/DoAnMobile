const express = require("express");
const router = express.Router();
const { register, login, generateResetOTP, verifyResetOTP, resetPassword } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const transporter = require('../config/emailConfig');
const path = require('path');

// Hàm gửi email OTP
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: 'buithaibao2k4@gmail.com',
      to: email,
      subject: 'Mã OTP đặt lại mật khẩu - Foodie',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="cid:logo" alt="Foodie Logo" style="width: 200px; height: 100px">
          <h2 style="color: #E60023;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Xin chào,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ bạn.</p>
          <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #E60023;">${otp}</strong></p>
          <p>Mã này sẽ hết hạn sau 5 phút.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,<br>Đội ngũ Foodie</p>
        </div>
      `,
      attachments: [{
        filename: 'logo2.png',
        path: path.join(__dirname, '../public/images/logo2.png'),
        cid: 'logo'
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log('Email OTP đã được gửi thành công đến:', email);
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email OTP');
  }
};

const registerUser = async (req, res) => {
    try {
      console.log("Đang xử lý đăng ký:", req.body);
      const { username, password, fullname,email,phone, address} = req.body;
      const user = await register(username, password, fullname,email, phone, address);
      console.log("Đăng ký thành công:", user);
      res.json(user);
    } catch (error) {
      console.error("Register error:", error);
      res.status(400).json({ error: error.message });
    }
  }
const loginUser = async (req, res) => {
    try {
      console.log("Đang xử lý đăng nhập:", req.body);
      const { username, password } = req.body;
      const user = await login(username, password);
      console.log("Đăng nhập thành công, đang tạo token...");
      
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      
      const response = { 
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        token 
      };
      
      console.log("Đã tạo token thành công");
      res.json(response);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: error.message });
    }
  }

// Controller yêu cầu gửi mã OTP
const requestOTP = async (req, res) => {
  try {
    console.log("Đang xử lý yêu cầu OTP:", req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Vui lòng nhập email" });
    }

    const otp = await generateResetOTP(email);
    
    // Gửi OTP qua email
    await sendOTPEmail(email, otp);
    
    res.json({ 
      message: "Mã OTP đã được gửi đến email của bạn",
      email: email
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    res.status(400).json({ error: error.message });
  }
}

// Controller xác thực mã OTP
const verifyOTP = async (req, res) => {
  try {
    console.log("Đang xác thực OTP:", req.body);
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    await verifyResetOTP(email, otp);
    console.log("Xác thực OTP thành công cho email:", email);

    res.json({ 
      message: "Mã OTP hợp lệ",
      email: email,
      verified: true
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(400).json({ error: error.message });
  }
}

// Controller đặt lại mật khẩu
const resetPasswordWithOTP = async (req, res) => {
  try {
    console.log("Đang xử lý đặt lại mật khẩu:", req.body);
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const result = await resetPassword(email, otp, newPassword);
    console.log("Đặt lại mật khẩu thành công cho email:", email);

    res.json({ 
      message: "Đặt lại mật khẩu thành công",
      success: true
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  requestOTP,
  verifyOTP,
  resetPasswordWithOTP
};