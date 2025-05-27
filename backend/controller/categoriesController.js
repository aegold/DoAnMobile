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
  if (!name) {
    return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
  }
  try {
    const image = req.file ? `/public/images/${req.file.filename}` : req.body.image;
    await categoriesModel.updateCategory(id, name, image);
    res.json({ message: 'Cập nhật danh mục thành công' });
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

