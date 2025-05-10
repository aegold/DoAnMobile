const express = require('express');
const router = express.Router();
const menuModel = require('../models/menuModel');
const { authenticateToken, checkRole } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');

// Middleware kiểm tra quyền admin
const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ error: 'Không tìm thấy thông tin người dùng' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Quyền bị từ chối, chỉ admin mới được phép' });
  }
  next();
};

// API lấy danh sách danh mục
router.get('/categories', async (req, res) => {
  try {
    const categories = await menuModel.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API CRUD cho Categories
router.post('/categories', authenticateToken, checkRole(['admin']), upload.single('image'), async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
  }
  try {
    const image = req.file ? `/public/images/${req.file.filename}` : null;
    const categoryId = await menuModel.createCategory(name, image);
    res.json({ message: 'Thêm danh mục thành công', id: categoryId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', authenticateToken, checkRole(['admin']), upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
  }
  try {
    const image = req.file ? `/public/images/${req.file.filename}` : req.body.image;
    await menuModel.updateCategory(id, name, image);
    res.json({ message: 'Cập nhật danh mục thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await menuModel.deleteCategory(id);
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API lấy danh sách món ăn theo danh mục
router.get('/dishes/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;
  menuModel.getDishesByCategory(categoryId)
    .then(dishes => {
      console.log('Sending dishes to client:', dishes);
      res.json(dishes);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// API lấy tất cả món ăn
router.get('/dishes', async (req, res) => {
  try {
    const dishes = await menuModel.getAllDishes();
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API CRUD cho Dishes
router.post('/dishes', authenticateToken, checkRole(['admin']), upload.single('image'), async (req, res) => {
  const { categoryId, name, description, price } = req.body;
  if (!categoryId || !name || !price) {
    return res.status(400).json({ error: 'categoryId, name và price là bắt buộc' });
  }
  try {
    const image = req.file ? `/public/images/${req.file.filename}` : null;
    const dishId = await menuModel.createDish(
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
});

router.put('/dishes/:id', authenticateToken, checkRole(['admin']), upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { categoryId, name, description, price } = req.body;
  if (!categoryId || !name || price === undefined) {
    return res.status(400).json({ error: 'categoryId, name và price là bắt buộc' });
  }
  try {
    const image = req.file ? `/public/images/${req.file.filename}` : req.body.image;
    await menuModel.updateDish(id, categoryId, name, description, price, image);
    res.json({ message: 'Cập nhật món ăn thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/dishes/:id', authenticateToken, checkRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await menuModel.deleteDish(id);
    res.json({ message: 'Xóa món ăn thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API lấy giỏ hàng
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await menuModel.getCart();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API thêm món vào giỏ hàng
router.post('/cart/add', authenticateToken, async (req, res) => {
  try {
    const { dishId, quantity } = req.body;
    console.log('Adding to cart - dishId:', dishId, 'quantity:', quantity);

    const dish = await menuModel.getDishById(dishId);
    console.log('Found dish:', dish);
    
    if (!dish) {
      console.log('Dish not found with ID:', dishId);
      return res.status(404).json({ error: 'Món ăn không tồn tại' });
    }
    
    // Thêm quantity vào dish object
    dish.quantity = quantity || 1;
    
    await menuModel.addToCart(dish);
    res.json({ message: 'Đã thêm vào giỏ hàng' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// API cập nhật số lượng giỏ hàng
router.put('/cart/update', (req, res) => {
  const { dishId, change } = req.body;
  menuModel.updateCartQuantity(dishId, change)
    .then(() => res.json({ message: 'Cart updated' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// API xóa món khỏi giỏ hàng
router.delete('/cart/remove/:dishId', (req, res) => {
  const dishId = req.params.dishId;
  menuModel.removeFromCart(dishId)
    .then(() => res.json({ message: 'Removed from cart' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// API tìm kiếm
router.get('/search', (req, res) => {
  console.log('Full query object:', req.query);
  const query = req.query.q || '';
  console.log('Extracted query:', query);
  menuModel.searchDishes(query)
    .then(results => {
      console.log('Sending search results to client:', results);
      res.json(results);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// API đặt hàng
router.post('/order', async (req, res) => {
  const { userId, items, total } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Giỏ hàng trống' });
  }

  try {
    const orderId = await menuModel.createOrder(userId, total);
    for (const item of items) {
      await menuModel.createOrderItem(orderId, item);
    }
    res.json({ message: 'Đặt hàng thành công', orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API đăng ký
router.post('/register', async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, mật khẩu và tên là bắt buộc' });
  }

  try {
    const user = await menuModel.registerUser(username, password, name);
    res.json({ message: 'Đăng ký thành công', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username và mật khẩu là bắt buộc' });
  }

  try {
    const user = await menuModel.loginUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Username hoặc mật khẩu không đúng' });
    }
    res.json({ message: 'Đăng nhập thành công', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API lấy thông tin người dùng
router.get('/user/:userId', async (req, res) => {
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
});

// API lấy danh sách đơn hàng
router.get('/orders', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const orders = await menuModel.getAllOrders();
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;