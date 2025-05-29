import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../constants/api";
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from "../components/customAlert";

const CategoriesScreen = ({ navigation }) => {
  const { fetchWithAuth } = useAuth();
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
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
      const response = await fetchWithAuth(`${BASE_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        showAlert("Lỗi", "Không thể lấy danh sách danh mục");
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err);
      showAlert("Lỗi", "Có lỗi xảy ra khi lấy danh sách danh mục");
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

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert("Lỗi", "Vui lòng nhập tên danh mục");
      return;
    }

    try {
      const url = editingCategory
        ? `${BASE_URL}/api/categories/${editingCategory.id}`
        : `${BASE_URL}/api/categories`;

      const formData = new FormData();
      formData.append("name", name.trim());

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
        name: name.trim(),
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
        method: editingCategory ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi lưu danh mục");
      }

      await fetchCategories();
      setModalVisible(false);
      resetForm();
      showAlert("Thành công", "Đã lưu danh mục thành công");
    } catch (err) {
      console.error("Chi tiết lỗi khi lưu danh mục:", err);
      showAlert("Lỗi", err.message || "Có lỗi xảy ra khi lưu danh mục");
    }
  };

  const handleDelete = async (categoryId) => {
    showAlert(
      "Xác nhận",
      "Bạn có chắc chắn muốn ẩn danh mục này?",
      async () => {
        try {
          const response = await fetchWithAuth(
            `${BASE_URL}/api/categories/${categoryId}/status`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            await fetchCategories();
            showAlert("Thành công", "Đã ẩn danh mục thành công");
          } else {
            const error = await response.json();
            showAlert("Lỗi", error.error || "Không thể ẩn danh mục");
          }
        } catch (err) {
          console.error("Lỗi khi ẩn danh mục:", err);
          showAlert("Lỗi", "Có lỗi xảy ra khi ẩn danh mục");
        }
      }
    );
  };

  const resetForm = () => {
    setName("");
    setSelectedImage(null);
    setEditingCategory(null);
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryContent}>
        <Image
          source={{ uri: `${BASE_URL}${item.image}` }}
          style={styles.categoryImage}
        />
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingCategory(item);
            setName(item.name);
            setSelectedImage(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#E60023" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Quản lý danh mục</Text>
        <View style={styles.headerRight} />
      </View>

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
        <Text style={styles.addButtonText}>Thêm món</Text>
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
              {editingCategory ? "Chỉnh sửa danh mục" : "Chỉnh sửa danh mục"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên danh mục"
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleSelectImage}
            >
              <Text style={styles.imageButtonText}>Chọn ảnh</Text>
            </TouchableOpacity>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.selectedImage}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    fontFamily: "Sen_700Bold",
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  categoryDetails: {
    marginLeft: 12,
    flex: 1,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  categoryPrice: {
    fontSize: 14,
    color: "#666",
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deleteButton: {
    backgroundColor: "#FFE5E5",
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: "#E60023",
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#E60023",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  imageButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  saveButton: {
    backgroundColor: "#E60023",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CategoriesScreen;
