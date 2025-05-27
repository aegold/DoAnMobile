const express = require('express');

const dishesModel = require('../models/dishesModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');



const getDishesByCategory = async(req, res) => {
  const categoryId = req.params.categoryId;
  await dishesModel.getDishesByCategory(categoryId)
    .then(dishes => {
      console.log('Sending dishes to client:', dishes);
      res.json(dishes);
    })
    .catch(err => res.status(500).json({ error: err.message }));
}
const getAllDishes = async (req, res) => {
  try {
    const dishes = await dishesModel.getAllDishes();
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const createDish = async (req, res) => {
  const { categoryId, name, description, price } = req.body;
  if (!categoryId || !name || !price) {
    return res.status(400).json({ error: 'categoryId, name và price là bắt buộc' });
  }
  try {
    const image = req.file ? `/public/images/${req.file.filename}` : null;
    const dishId = await dishesModel.createDish(
      parseInt(categoryId),
      name,
      description || '',
      parseFloat(price),
      image
    );
    res.json({ message: 'Thêm món ăn thành công', id: dishId });
  } catch (err) {
    console.error('Error creating dish:', err);
    res.status(500).json({ error: err.message });
  }
}
const updateDish = async (req, res) => {
  const { id } = req.params;
  const { categoryId, name, description, price } = req.body;
  if (!categoryId || !name || price === undefined) {
    return res.status(400).json({ error: 'categoryId, name và price là bắt buộc' });
  }
  try {
    const image = req.file ? `/public/images/${req.file.filename}` : req.body.image;
    await dishesModel.updateDish(id, categoryId, name, description, price, image);
    res.json({ message: 'Cập nhật món ăn thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const deleteDish = async (req, res) => {
  const { id } = req.params;
  try {
    await dishesModel.deleteDish(id);
    res.json({ message: 'Xóa món ăn thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const searchDishes = async(req, res) => {
  console.log('Full query object:', req.query);
  const query = req.query.q || '';
  console.log('Extracted query:', query);
  await dishesModel.searchDishes(query)
    .then(results => {
      console.log('Sending search results to client:', results);
      res.json(results);
    })
    .catch(err => res.status(500).json({ error: err.message }));
}
module.exports = {
    getDishesByCategory,
    getAllDishes,
    createDish,
    updateDish,
    deleteDish,
    searchDishes
}