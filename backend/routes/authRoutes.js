const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { registerUser, loginUser} = require("../controller/authController");

// Middleware validation
const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
  }
  next();
};

// Đăng ký
router.post("/register", registerUser);

// Đăng nhập
router.post("/login", validateLogin, loginUser);

module.exports = router; 