const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Không tìm thấy token xác thực' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Kiểm tra thời gian hết hạn
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    
    // Kiểm tra user trong database
    db.get('SELECT * FROM Users WHERE id = ?', [decoded.id], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Lỗi server' });
      }
      
      if (!user) {
        return res.status(403).json({ error: 'Không tìm thấy thông tin người dùng' });
      }

      req.user = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      
      next();
    });
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    return res.status(403).json({ error: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa xác thực' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole
};