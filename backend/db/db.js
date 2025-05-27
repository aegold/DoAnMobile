const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Tạo kết nối database
const db = new sqlite3.Database(path.join(__dirname, 'foodexpo.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Đã kết nối SQLite');
  }
});

function runSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function setupDatabase() {
  try {
    // Xóa bảng cũ để đảm bảo dữ liệu mới
    // await runSQL('DROP TABLE IF EXISTS Categories');
    // await runSQL('DROP TABLE IF EXISTS Dishes');
    // await runSQL('DROP TABLE IF EXISTS cart');
    // await runSQL('DROP TABLE IF EXISTS Orders');
    // await runSQL('DROP TABLE IF EXISTS OrderItems');
    // await runSQL('DROP TABLE IF EXISTS Users');

    // Tạo bảng Categories
    // await runSQL(`
    //   CREATE TABLE IF NOT EXISTS Categories (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     name TEXT NOT NULL,
    //     image TEXT
    //   )
    // `);
    // // Tạo bảng Dishes
    // await runSQL(`
    //   CREATE TABLE IF NOT EXISTS Dishes (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     category_id INTEGER,
    //     name TEXT NOT NULL,
    //     description TEXT,
    //     price REAL,
    //     image TEXT,
    //     FOREIGN KEY (category_id) REFERENCES Categories(id)
    //   )
    // `);
    // // // Tạo bảng cart
    // await runSQL(`
    //   CREATE TABLE IF NOT EXISTS cart (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     dishId INTEGER NOT NULL,
    //     quantity INTEGER NOT NULL,
    //     name TEXT NOT NULL,
    //     price REAL NOT NULL,
    //     image TEXT NOT NULL,
    //     FOREIGN KEY (dishId) REFERENCES Dishes(id)
        
    //   )
    // `);
    // // // Tạo bảng Users
    // await runSQL(`
    //   CREATE TABLE IF NOT EXISTS Users (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     username TEXT UNIQUE NOT NULL,
    //     password TEXT NOT NULL,
    //     fullname TEXT NOT NULL,
    //     email TEXT NOT NULL UNIQUE,
    //     phone TEXT NOT NULL UNIQUE,
    //     address TEXT NOT NULL,
    //     role TEXT DEFAULT 'user'
    //   )
    // `);
    // // // Tạo bảng Orders
    // await runSQL(`
    //   CREATE TABLE IF NOT EXISTS Orders (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     user_id INTEGER,
    //     total REAL NOT NULL,
    //     created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    //     FOREIGN KEY (user_id) REFERENCES Users(id)
    //   )
    // `);
    // // // Tạo bảng OrderItems
    // await runSQL(`
    //   CREATE TABLE IF NOT EXISTS OrderItems (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     order_id INTEGER,
    //     dish_id INTEGER,
    //     quantity INTEGER NOT NULL,
    //     name TEXT NOT NULL,
    //     price REAL NOT NULL,
    //     FOREIGN KEY (order_id) REFERENCES Orders(id),
    //     FOREIGN KEY (dish_id) REFERENCES Dishes(id)
    //   )
    // `);
    // // // Thêm dữ liệu mẫu vào Categories
    // await runSQL(
    //   'INSERT INTO Categories (name, image) VALUES (?, ?)',
    //   ['Hamburger', '/public/images/hamburger-icon.png']
    // );
    // await runSQL(
    //   'INSERT INTO Categories (name, image) VALUES (?, ?)',
    //   ['Pizza', '/public/images/pizza-icon.png']
    // );
    // await runSQL ( 
    //   'INSERT INTO Categories (name, image) VALUES (?, ?)',
    //   ['Chicken', '/public/images/chicken-icon.jpg']
    // );
    // await runSQL(
    //   'INSERT INTO Categories (name, image) VALUES (?, ?)',
    //   ['Chips', '/public/images/chips-icon.png']
    // );
    // await runSQL(
    //   'INSERT INTO Categories (name, image) VALUES (?, ?)',
    //   ['Noodle', '/public/images/noodle-icon.png']
    // );
    // await runSQL(
    //   'INSERT INTO Categories (name, image) VALUES (?, ?)',
    //   ['Chips', '/public/images/chips.png']
    // );

    // // // Thêm dữ liệu mẫu vào Dishes
    // await runSQL(
    //   'INSERT INTO Dishes (category_id, name, description, price, image) VALUES ( ?, ?, ?, ?, ?)',
    //   [ 1, 'Gỏi cuốn', 'Tôm, rau sống, bún', 30000, '/public/images/goi_cuon.jpg']
    // );
    // await runSQL(
    //   'INSERT INTO Dishes (category_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)',
    //   [ 1, 'Chả giò', 'Chả giò chiên giòn', 30000, '/public/images/cha_gio.jpg']
    // );

    // await runSQL(
    //   'INSERT INTO Dishes (category_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)',
    //   [ 3, 'Combo gia đình ', '6 miếng gà', 180000, '/public/images/cha_gio.jpg']
    // );
    // Mã hóa mật khẩu cho admin và customer
    // const adminPassword = await bcrypt.hash('admin123', 10);
    // const customerPassword = await bcrypt.hash('customer123', 10);
    // // Thêm dữ liệu mẫu vào Users với mật khẩu đã mã hóa
    // await runSQL(
    //   'INSERT INTO Users (username, password, fullname, email, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
    //   ['admin', adminPassword, 'Administrator', 'admin@gmail.com', '0909090909', 'Hà Nội', 'admin']
    // );
    // await runSQL(
    //   'INSERT INTO Users (username, password, fullname, email, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
    //   ['customer', customerPassword, 'Khách hàng', 'customer@gmail.com', '0904440436', 'Hà Nội', 'user']
    // );

    console.log('Load database successfully!');
  } catch (err) {
    console.error('Lỗi:', err.message);
  }
}

setupDatabase();

module.exports = db;