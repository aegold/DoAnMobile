const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from auth middleware
        const { fullname, email, phone, address } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ' });
        }

        // Validate phone format if provided
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Số điện thoại phải có 10 chữ số' });
        }

        // Check if email already exists for other users
        const checkEmailQuery = 'SELECT * FROM Users WHERE email = ? AND id != ?';
        db.get(checkEmailQuery, [email, userId], (err, existingUser) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Lỗi server khi kiểm tra email' });
            }

            if (existingUser) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }

            // Update user profile
            const updateQuery = `
                UPDATE Users 
                SET fullname = ?, email = ?, phone = ?, address = ?
                WHERE id = ?
            `;
            
            db.run(updateQuery, [fullname, email, phone, address, userId], function(err) {
                if (err) {
                    console.error('Update error:', err);
                    return res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin' });
                }

                // Get updated user data
                db.get(
                    'SELECT id, username, fullname, email, phone, address, role, image FROM Users WHERE id = ?',
                    [userId],
                    (err, updatedUser) => {
                        if (err) {
                            console.error('Error fetching updated user:', err);
                            return res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng' });
                        }

                        if (!updatedUser) {
                            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
                        }

                        res.status(200).json({
                            message: 'Cập nhật thông tin thành công',
                            user: updatedUser
                        });
                    }
                );
            });
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin' });
    }
};

// Update user avatar
const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn ảnh' });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);

        // Delete old avatar if it exists
        if (user.image) {
            const oldAvatarPath = path.join(__dirname, '..', 'public', user.image);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Update user with new avatar path
        const avatarPath = '/uploads/' + req.file.filename;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { image: avatarPath },
            { new: true, select: '-password' }
        );

        res.status(200).json({
            message: 'Cập nhật ảnh đại diện thành công',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update avatar error:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật ảnh đại diện' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validate password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Mật khẩu mới không khớp' });
        }

        // Validate password length
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        // Get user's current password
        const getUserQuery = 'SELECT password FROM Users WHERE id = ?';
        db.get(getUserQuery, [userId], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Lỗi server khi kiểm tra mật khẩu' });
            }

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Verify old password
            const isValidPassword = await bcrypt.compare(oldPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            const updateQuery = 'UPDATE Users SET password = ? WHERE id = ?';
            db.run(updateQuery, [hashedPassword, userId], (err) => {
                if (err) {
                    console.error('Update password error:', err);
                    return res.status(500).json({ message: 'Lỗi server khi cập nhật mật khẩu' });
                }

                res.status(200).json({ message: 'Đổi mật khẩu thành công' });
            });
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' });
    }
};

module.exports = {
    updateUserProfile,
    updateAvatar,
    changePassword
};
