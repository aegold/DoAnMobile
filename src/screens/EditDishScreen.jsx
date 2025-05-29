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
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../components/customAlert";

const EditDishScreen = ({ route, navigation }) => {
  const { fetchWithAuth } = useAuth();
  const { dish, onUpdate } = route.params;
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState(dish.name || "");
  const [description, setDescription] = useState(dish.description || "");
  const [price, setPrice] = useState(dish.price ? dish.price.toString() : "");
  const [categoryId, setCategoryId] = useState(
    dish.category_id ? dish.category_id.toString() : ""
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(dish.image || "");
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
        setCurrentImage(file.uri);
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      showAlert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const handleUpdateDish = async () => {
    if (!name || !price || !categoryId) {
      showAlert("Lỗi", "Tên, giá và danh mục là bắt buộc");
      return;
    }

    try {
      const url = `${BASE_URL}/api/dishes/${dish.id}`;
      console.log("Đang cập nhật món ăn tại:", url);

      const formData = new FormData();
      formData.append("categoryId", parseInt(categoryId));
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", parseFloat(price));

      if (selectedImage) {
        const imageUri = selectedImage.uri;
        const filename = imageUri.split("/").pop();

        // Đảm bảo type luôn được set đúng
        let type = "image/jpeg";
        if (filename) {
          const match = /\.(\w+)$/.exec(filename);
          if (match) type = `image/${match[1].toLowerCase()}`;
        }

        // Xử lý URI cho cả Android và iOS
        const finalUri =
          Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri;

        formData.append("image", {
          uri: finalUri,
          type: type,
          name: filename || `image_${Date.now()}.jpg`,
        });
      }

      console.log("FormData:", {
        categoryId: parseInt(categoryId),
        name,
        description,
        price: parseFloat(price),
        hasImage: !!selectedImage,
        imageInfo: selectedImage
          ? {
              uri: selectedImage.uri,
              type: selectedImage.type,
              name: selectedImage.name,
            }
          : null,
      });

      const response = await fetchWithAuth(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      console.log("Trạng thái phản hồi cập nhật:", response.status);
      if (response.ok) {
        showAlert("Thành công", "Cập nhật món ăn thành công", () => {
          if (onUpdate) {
            onUpdate();
          }
          navigation.goBack();
        });
      } else {
        const result = await response.json();
        console.log("Lỗi khi cập nhật:", result);
        showAlert("Lỗi", result.error || "Không thể cập nhật món ăn");
      }
    } catch (err) {
      console.error("Chi tiết lỗi khi cập nhật:", err);
      if (err.message.includes("Network request failed")) {
        showAlert("Lỗi kết nối", "Không thể kết nối tới server.");
      } else {
        showAlert("Lỗi", "Có lỗi xảy ra: " + err.message);
      }
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
        <Text style={styles.headerTitle}>Sửa món ăn</Text>
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
            <Text style={styles.imageButtonText}>Chọn ảnh mới</Text>
            
          </TouchableOpacity>

          {currentImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: `${BASE_URL}${currentImage}` }}
                style={styles.previewImage}
              />
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleUpdateDish}
        >
          <Text style={styles.submitButtonText}>Cập nhật món ăn</Text>
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
    backgroundColor: "#fff",
  },
  header: {
    
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
   
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

export default EditDishScreen;
