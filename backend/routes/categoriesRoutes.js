const express = require('express');
const router = express.Router();
const categoriesModel = require("../models/categoryModel.js");
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const { getCategories,createCategory,updateCategory,deleteCategory} = require('../controller/categoriesController');

router.get('/categories', getCategories);
router.post('/categories', authenticateToken, checkRole(['admin']), upload.single('image'),createCategory);
router.put('/categories/:id', authenticateToken, checkRole(['admin']), upload.single('image'),updateCategory );
router.delete('/categories/:id', authenticateToken, checkRole(['admin']),deleteCategory );

module.exports = router;