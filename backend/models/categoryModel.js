const db = require('../db/db');
const bcrypt = require('bcrypt');

const getCategories = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM Categories', [], (err, rows) => {
      if (err) reject(err);
      else {
        console.log('Categories from DB:', rows);
        resolve(rows);
      }
    });
  });
};

const getCategoryById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM Categories WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error getting category:', err);
        reject(err);
      } else if (!row) {
        reject(new Error('Không tìm thấy danh mục'));
      } else {
        resolve(row);
      }
    });
  });
};

const createCategory = (name, image) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Categories (name, image) VALUES (?, ?)',
      [name, image],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const updateCategory = (id, name, image) => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE Categories SET name = ?, image = ? WHERE id = ?',
      [name, image, id],
      (err) => (err ? reject(err) : resolve())
    );
  });
};

const deleteCategory = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM Categories WHERE id = ?', [id], (err) => (err ? reject(err) : resolve()));
  });
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};