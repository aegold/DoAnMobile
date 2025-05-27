const express = require("express");
const router = express.Router();
const { register, login } = require("../models/userModel");
const jwt = require("jsonwebtoken");

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
      
      const response = { ...user, token };
      console.log("Đã tạo token thành công");
      res.json(response);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: error.message });
    }
  }

  module.exports = {
    registerUser,
    loginUser,
  }