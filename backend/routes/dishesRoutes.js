const express = require('express');
const router = express.Router();
const dishesModel = require('../models/dishesModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const { getDishesByCategory, getAllDishes, createDish, updateDish, updateDishStatus, searchDishes } = require('../controller/dishesController');
// API lấy danh sách món ăn theo danh mục
router.get('/dishes/:categoryId',getDishesByCategory);

// API lấy tất cả món ăn
router.get('/dishes',getAllDishes);

// API CRUD cho Dishes
router.post('/dishes', authenticateToken, checkRole(['admin']), upload.single('image'), createDish);

router.put('/dishes/:id', authenticateToken, checkRole(['admin']), upload.single('image'), updateDish );

// Cập nhật status của món ăn
router.put('/dishes/:id/status', authenticateToken, checkRole(['admin']), updateDishStatus);

router.get('/search', searchDishes);

module.exports = router;