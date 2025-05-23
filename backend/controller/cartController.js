
const cartModel = require('../models/cartModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');
const getCart = async (req, res) => {
  try {
    const cart = await cartModel.getCart();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const addToCart = async (req, res) => {
  try {
    const { dishId, quantity } = req.body;
    console.log('Adding to cart - dishId:', dishId, 'quantity:', quantity);

    const dish = await cartModel.getDishById(dishId);
    console.log('Found dish:', dish);
    
    if (!dish) {
      console.log('Dish not found with ID:', dishId);
      return res.status(404).json({ error: 'Món ăn không tồn tại' });
    }
    
    // Thêm quantity vào dish object
    dish.quantity = quantity || 1;
    
    await cartModel.addToCart(dish);
    res.json({ message: 'Đã thêm vào giỏ hàng' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message });
  }
}
const updateCart = async (req, res) => {
  const { dishId, change } = req.body;
  await cartModel.updateCartQuantity(dishId, change)
    .then(() => res.json({ message: 'Cart updated' }))
    .catch(err => res.status(500).json({ error: err.message }));
}
const deleteFromCart = async (req, res) => {
  const dishId = req.params.dishId;
  await cartModel.removeFromCart(dishId)
    .then(() => res.json({ message: 'Removed from cart' }))
    .catch(err => res.status(500).json({ error: err.message }));
}
module.exports = {
    getCart,
    addToCart,
    updateCart,
    deleteFromCart
}



