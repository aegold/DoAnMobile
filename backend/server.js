const express = require('express');
const cors = require('cors');
const path = require('path');
const menuRoutes = require('./routes/menu');
const authRoutes = require('./routes/authRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const dishesRoutes = require('./routes/dishesRoutes');
const cartRoutes = require('./routes/cartRoutes');
const manageRoutes = require('./routes/manageRoutes');
const orderRoutes = require('./routes/orderRoutes');

const db = require('./db/db');
const upload = require('./middlewares/upload');

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];

// Middleware log request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Cấu hình CORS chi tiết
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true
}));

// Middleware xử lý timeout
const TIMEOUT = process.env.REQUEST_TIMEOUT || 5000;
app.use((req, res, next) => {
  res.setTimeout(TIMEOUT, () => {
    console.error('Request timeout');
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    message: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Đăng ký routes
app.use('/api', menuRoutes);
app.use('/api', dishesRoutes);
app.use('/api', categoriesRoutes);
app.use('/api', cartRoutes);
app.use('/api', manageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders/', orderRoutes);



// Khởi động server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log('Các routes đã đăng ký:');
  console.log('- /api/auth/login');
  console.log('- /api/auth/register');
});