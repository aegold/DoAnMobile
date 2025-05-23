const express = require('express');

const menuModel = require('../models/menuModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');


const getUserById = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await menuModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders = await menuModel.getAllOrders();
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
}
module.exports = {
    getUserById,
    getAllOrders,
    // Thêm các hàm khác nếu cần
}