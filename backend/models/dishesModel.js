const db = require('../db/db');
const bcrypt = require('bcrypt');

const getDishesByCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Dishes WHERE category_id = ?', [categoryId], (err, rows) => {
      if (err) reject(err);
      else {
        console.log('Dishes from DB:', rows);
        resolve(rows);
      }
    });
  });
};

const getAllDishes = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Dishes', [], (err, rows) => {
      if (err) reject(err);
      else {
        console.log('All Dishes from DB:', rows);
        resolve(rows);
      }
    });
  });
};

const createDish = (categoryId, name, description, price, image) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Dishes (category_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)',
      [categoryId, name, description, price, image],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const updateDish = async (id, categoryId, name, description, price, image) => {
  try {
    // Lấy thông tin món ăn hiện tại
    const currentDish = await getDishById(id);
    if (!currentDish) {
      throw new Error('Không tìm thấy món ăn');
    }

    // Sử dụng ảnh cũ nếu không có ảnh mới
    const updatedImage = image || currentDish.image;

    // Cập nhật thông tin món ăn
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE Dishes SET category_id = ?, name = ?, description = ?, price = ?, image = ? WHERE id = ?',
        [categoryId, name, description, price, updatedImage, id],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              id,
              category_id: categoryId,
              name,
              description,
              price,
              image: updatedImage
            });
          }
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

const deleteDish = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM Dishes WHERE id = ?', [id], (err) => (err ? reject(err) : resolve()));
  });
};

const getDishById = (dishId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Dishes WHERE id = ?', [dishId], (err, dish) => {
      if (err) {
        console.error('Error fetching dish:', err);
        reject(err);
      } else {
        resolve(dish);
      }
    });
  });
};

const searchDishes = (query) => {
  return new Promise((resolve, reject) => {
    console.log('Searching with query:', query);
    db.all(
      'SELECT * FROM Dishes WHERE name LIKE ?',
      [`%${query}%`],
      (err, rows) => {
        if (err) {
          console.error('Error in search query:', err);
          reject(err);
        } else {
          console.log('Search results from DB:', rows);
          resolve(rows);
        }
      }
    );
  });
};

module.exports = {
  getDishesByCategory,
  getAllDishes,
  createDish,
  updateDish,
  deleteDish,
  getDishById,
  searchDishes,
}