const path = require('path');
const fs = require('fs');

/**
 * Xử lý upload ảnh cho các entity khác nhau (Category, Dish, User)
 * @param {Object} options - Các tùy chọn xử lý ảnh
 * @param {Express.Multer.File} options.file - File được upload
 * @param {string} options.type - Loại entity ('Category', 'Dishes', 'User')
 * @param {string} options.oldImagePath - Đường dẫn ảnh cũ (nếu có)
 * @returns {string} Đường dẫn ảnh mới
 */
const handleImageUpload = async ({ file, type, oldImagePath = null }) => {
  if (!file) return null;

  // Tạo thư mục nếu chưa tồn tại
  const imageDir = path.join(__dirname, '..', 'public', 'images', type);
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  // Xóa ảnh cũ nếu có
  if (oldImagePath) {
    const fullOldPath = path.join(__dirname, '..', oldImagePath);
    if (fs.existsSync(fullOldPath)) {
      fs.unlinkSync(fullOldPath);
    }
  }

  // Tạo tên file mới
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newFilename = `${type}-${randomNum}.png`;
  
  // Di chuyển file mới vào
  const oldPath = file.path;
  const newPath = path.join(imageDir, newFilename);
  
  console.log(`Xử lý ảnh ${type}:`);
  console.log('- Đường dẫn file tạm:', oldPath);
  console.log('- Đường dẫn file mới:', newPath);
  
  fs.renameSync(oldPath, newPath);
  
  // Trả về đường dẫn tương đối để lưu vào DB
  return `/public/images/${type}/${newFilename}`;
};

module.exports = {
  handleImageUpload
}; 