const express = require('express');
const cors = require('cors');
const path = require('path');
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/authRoutes');
const db = require('./db/db');
const upload = require('./middlewares/upload');

const app = express();
const PORT = 3000;

// Middleware log request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Cấu hình CORS chi tiết
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware xử lý timeout
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    console.error('Request timeout');
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Đăng ký routes
app.use('/api', menuRoutes);
app.use('/api/auth', authRoutes);

// Khởi động server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log('Các routes đã đăng ký:');
  console.log('- /api/auth/login');
  console.log('- /api/auth/register');
});