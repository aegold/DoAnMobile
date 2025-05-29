import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../constants/api';
import Toast from 'react-native-toast-message';

const ChangePasswordScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Kiểm tra user khi màn hình được mount
  useEffect(() => {
    if (!user || !user.token) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Bạn cần đăng nhập lại để thực hiện chức năng này',
      });
      navigation.replace('Login');
    }
  }, [user]);

  const handleChangePassword = async () => {
    try {
      console.log('Starting password change process...');
      
      // Kiểm tra user và token trước khi thực hiện
      if (!user || !user.token) {
        throw new Error('Bạn cần đăng nhập lại để thực hiện chức năng này');
      }
      
      // Validate inputs
      if (!oldPassword || !newPassword || !confirmPassword) {
        console.log('Validation failed: Missing required fields');
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Vui lòng điền đầy đủ thông tin',
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        console.log('Validation failed: New passwords do not match');
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Mật khẩu mới không khớp',
        });
        return;
      }

      if (newPassword.length < 6) {
        console.log('Validation failed: Password too short');
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Mật khẩu mới phải có ít nhất 6 ký tự',
        });
        return;
      }

      console.log('Making API request to:', API_ENDPOINTS.CHANGE_PASSWORD);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token?.substring(0, 10)}...`
      });

      const requestBody = {
        oldPassword,
        newPassword,
        confirmPassword,
      };
      console.log('Request body:', { ...requestBody, oldPassword: '***', newPassword: '***', confirmPassword: '***' });

      const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('JSON Parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        console.log('Request failed with status:', response.status);
        // Kiểm tra nếu token không hợp lệ
        if (data.error === 'Token không hợp lệ' || response.status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
          });
          await logout(); // Đăng xuất user
          navigation.replace('Login');
          return;
        }
        throw new Error(data.error || data.message || 'Lỗi không xác định từ server');
      }

      console.log('Password change successful');
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: data.message,
      });

      // Clear inputs
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Navigate back
      navigation.goBack();

    } catch (error) {
      console.error('Password change error:', error);
      console.error('Error stack:', error.stack);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Có lỗi xảy ra khi đổi mật khẩu',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          {/* Old Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu cũ</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Nhập mật khẩu cũ"
                secureTextEntry={!showOldPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowOldPassword(!showOldPassword)}
              >
                <Ionicons
                  name={showOldPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: "Sen_700Bold",
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E60023',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 12,
  },
  submitButton: {
    backgroundColor: '#E60023',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen; 