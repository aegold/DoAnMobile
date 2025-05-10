import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../constants/api";
import * as ImagePicker from "expo-image-picker";

const CategoriesScreen = ({ navigation }) => {
  const { fetchWithAuth } = useAuth();
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        Alert.alert("Lỗi", "Không thể lấy danh sách danh mục");
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lấy danh sách danh mục");
    }
  };

  const handleSelectImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Ứng dụng cần quyền truy cập vào thư viện ảnh"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên danh mục");
      return;
    }

    try {
      const url = editingCategory
        ? `${BASE_URL}/api/categories/${editingCategory.id}`
        : `${BASE_URL}/api/categories`;
      const method = editingCategory ? "PUT" : "POST";

      // Tạo FormData cho ảnh
      const formData = new FormData();
      formData.append("name", name.trim());

      if (selectedImage) {
        const imageUri = selectedImage.uri;
        const filename = imageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image";

        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        });
      }

      console.log("Sending data:", {
        name: name.trim(),
        hasImage: !!selectedImage,
      });

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (response.ok) {
        await fetchCategories();
        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert("Lỗi", responseData.error || "Không thể lưu danh mục");
      }
    } catch (err) {
      console.error("Lỗi khi lưu danh mục:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu danh mục");
    }
  };

  const handleDelete = async (categoryId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa danh mục này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetchWithAuth(
              `${BASE_URL}/api/categories/${categoryId}`,
              {
                method: "DELETE",
              }
            );

            if (response.ok) {
              await fetchCategories();
            } else {
              const error = await response.json();
              Alert.alert("Lỗi", error.error || "Không thể xóa danh mục");
            }
          } catch (err) {
            console.error("Lỗi khi xóa danh mục:", err);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi xóa danh mục");
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setName("");
    setSelectedImage(null);
    setEditingCategory(null);
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        {item.image && (
          <Image
            source={{ uri: `${BASE_URL}${item.image}` }}
            style={styles.categoryImage}
          />
        )}
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            setEditingCategory(item);
            setName(item.name);
            setSelectedImage(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Thêm danh mục mới</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên danh mục"
              value={name}
              onChangeText={setName}
            />
            {selectedImage && (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.selectedImage}
              />
            )}
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleSelectImage}
            >
              <Text style={styles.buttonText}>
                {selectedImage ? "Thay đổi ảnh" : "Chọn ảnh"}
              </Text>
            </TouchableOpacity>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  categoryItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  categoryActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#2196F3",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#9e9e9e",
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CategoriesScreen;
