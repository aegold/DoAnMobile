const express = require('express');
const categoriesModel = require("../models/categoryModel.js");
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');

//Lay categories

const getCategories = async (req, res) => {
  try {
    const categories = await categoriesModel.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
  }
  try {
    const image = req.file ? `/public/images/${req.file.filename}` : null;
    const categoryId = await categoriesModel.createCategory(name, image);
    res.json({ message: 'Thêm danh mục thành công', id: categoryId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    // Kiểm tra danh mục tồn tại
    const existingCategory = await categoriesModel.getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }

    // Kiểm tra và xác thực tên danh mục
    const updatedName = name || existingCategory.name;

    // Xử lý ảnh: giữ ảnh cũ nếu không có ảnh mới
    let updatedImage = existingCategory.image; // Mặc định giữ ảnh cũ
    if (req.file) {
      // Nếu có ảnh mới được tải lên
      updatedImage = `/public/images/${req.file.filename}`;
    }

    // Cập nhật danh mục với thông tin mới
    await categoriesModel.updateCategory(id, updatedName, updatedImage);
    res.json({ 
      message: 'Cập nhật danh mục thành công',
      category: {
        id,
        name: updatedName,
        image: updatedImage
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await categoriesModel.deleteCategory(id);
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



module.exports = {
getCategories,
createCategory,
updateCategory,
deleteCategory
}

