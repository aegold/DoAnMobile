import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../constants/api";
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from "../components/customAlert";

const AddDishScreen = ({ route, navigation }) => {
  const { fetchWithAuth } = useAuth();
  const { onUpdate } = route.params;
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const url = `${BASE_URL}/api/categories`;
      console.log("Đang lấy danh sách danh mục từ:", url);

      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("Trạng thái phản hồi categories:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Danh sách danh mục:", data);
        setCategories(data);
      } else {
        const errorData = await response.json();
        console.log("Lỗi khi lấy danh mục:", errorData);
        showAlert("Lỗi", "Không thể lấy danh sách danh mục");
      }
    } catch (err) {
      console.error("Chi tiết lỗi khi lấy danh mục:", err);
      if (err.message.includes("Network request failed")) {
        showAlert("Lỗi kết nối", "Không thể kết nối tới server.");
      } else {
        showAlert("Lỗi", "Có lỗi xảy ra: " + err.message);
      }
    }
  };

  const handleSelectImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false
      });
  
      if (!result.canceled) {
        const file = result.assets[0];
        setSelectedImage({
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType || 'image/jpeg',
        });
      } else {
        console.log("Chọn ảnh bị hủy");
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      showAlert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const handleAddDish = async () => {
    if (!name || !price || !categoryId) {
      showAlert("Lỗi", "Tên, giá và danh mục là bắt buộc");
      return;
    }

    try {
      const url = `${BASE_URL}/api/dishes`;
      console.log("Đang thêm món ăn mới tại:", url);

      // Chuẩn bị dữ liệu cơ bản
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('name', name);
      formData.append('description', description || '');
      formData.append('price', price);

      // Xử lý file ảnh
      if (selectedImage) {
        const localUri = selectedImage.uri;
        const filename = localUri.split('/').pop();

        // Tạo file object từ uri
        formData.append('image', {
          uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
          name: filename,
          type: 'image/jpeg'
        });
      }

      // Log request details
      console.log('Request URL:', url);
      console.log('FormData:', {
        categoryId,
        name,
        description: description || '',
        price,
        hasImage: !!selectedImage,
        imageUri: selectedImage?.uri
      });

      // Gửi request với fetchWithAuth
      const response = await fetchWithAuth(url, {
        method: 'POST',
        body: formData
      });

      const responseData = await response.json();
      console.log('Response:', responseData);

      if (response.ok) {
        showAlert(
          "Thành công", 
          "Thêm món ăn mới thành công", 
          () => {
            if (onUpdate) {
              onUpdate();
            }
            navigation.goBack();
          }
        );
      } else {
        throw new Error(responseData.error || 'Không thể thêm món ăn mới');
      }
    } catch (err) {
      console.error("Chi tiết lỗi khi thêm món:", err);
      showAlert("Lỗi", err.message || "Có lỗi xảy ra khi thêm món ăn");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm món ăn mới</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên món ăn</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên món ăn"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả món ăn"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Giá (VNĐ)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giá món ăn"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Danh mục</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={(itemValue) => setCategoryId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn danh mục" value="" />
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Hình ảnh món ăn</Text>
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={handleSelectImage}
          >
            <Ionicons name="image-outline" size={24} color="#fff" />
            <Text style={styles.imageButtonText}>Chọn ảnh từ thiết bị</Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
              />
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleAddDish}
        >
          <Text style={styles.submitButtonText}>Thêm món ăn</Text>
        </TouchableOpacity>
      </ScrollView>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#000",
    fontSize: 30,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter_700Bold",

  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  imageButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "#ddd",
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  submitButton: {
    backgroundColor: "#E60023",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddDishScreen;
