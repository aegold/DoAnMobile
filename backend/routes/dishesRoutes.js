const express = require('express');
const router = express.Router();
const dishesModel = require('../models/dishesModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const { getDishesByCategory, getAllDishes, createDish, updateDish,deleteDish,searchDishes } = require('../controller/dishesController');
// API lấy danh sách món ăn theo danh mục
router.get('/dishes/:categoryId',getDishesByCategory);

// API lấy tất cả món ăn
router.get('/dishes',getAllDishes);

// API CRUD cho Dishes
router.post('/dishes', authenticateToken, checkRole(['admin']), upload.single('image'), createDish);

router.put('/dishes/:id', authenticateToken, checkRole(['admin']), upload.single('image'), updateDish );

router.delete('/dishes/:id', authenticateToken, checkRole(['admin']), deleteDish);
router.get('/search', searchDishes);

module.exports = router;