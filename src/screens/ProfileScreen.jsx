import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL, API_ENDPOINTS } from '../constants/api';
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../components/customAlert";

const ProfileScreen = ({ navigation }) => {
  const { user, fetchWithAuth, updateUserData } = useAuth();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    address: ''
  });
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showAlert = (title, message, onConfirm = () => {}) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      onConfirm,
    });
  };

  const hideAlert = () => {
    setAlertConfig({
      ...alertConfig,
      visible: false,
    });
  };

  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
      return;
    }

    setFormData({
      fullname: user.fullname || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  }, [user, navigation]);

  const handleSave = async () => {
    try {
      if (!user) {
        showAlert('Lỗi', 'Vui lòng đăng nhập để tiếp tục', () => {
          navigation.replace('Login');
        });
        return;
      }

      console.log('Sending profile update request with data:', formData);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showAlert('Lỗi', 'Email không hợp lệ');
        return;
      }

      // Validate phone format if provided
      if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
        showAlert('Lỗi', 'Số điện thoại phải có 10 chữ số');
        return;
      }

      const response = await fetchWithAuth(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật thông tin');
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Update the user data in context and storage
      await updateUserData(data.user);
      
      showAlert('Thành công', 'Cập nhật thông tin thành công', () => {
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      showAlert('Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  // If user is not logged in, don't render anything
  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user.image
                ? `${BASE_URL}${user.image}`
                : `${BASE_URL}/public/images/avatar-default.png`
            }}
            style={styles.avatar}
          />
          
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={formData.fullname}
            onChangeText={(text) => setFormData({ ...formData, fullname: text })}
            placeholder="Nhập họ và tên"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Nhập email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Nhập địa chỉ"
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        onConfirm={() => {
          alertConfig.onConfirm();
          hideAlert();
        }}
      />
    </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  avatarSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#666',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  form: {
    padding: 16,
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E60023',
  },
  saveButton: {
    backgroundColor: '#E60023',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 