import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../constants/api";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native-gesture-handler";

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
        Alert.alert("Lỗi", "Không thể lấy danh sách danh mục");
      }
    } catch (err) {
      console.error("Chi tiết lỗi khi lấy danh mục:", err);
      if (err.message.includes("Network request failed")) {
        Alert.alert("Lỗi kết nối", "Không thể kết nối tới server.");
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra: " + err.message);
      }
    }
  };

  const handleSelectImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Ứng dụng cần quyền truy cập vào thư viện ảnh của bạn"
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
        setCurrentImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const handleUpdateDish = async () => {
    if (!name || !price || !categoryId) {
      Alert.alert("Lỗi", "Tên, giá và danh mục là bắt buộc");
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
        Alert.alert("Thành công", "Cập nhật món ăn thành công");
        if (onUpdate) {
          onUpdate();
        }
        navigation.goBack();
      } else {
        const result = await response.json();
        console.log("Lỗi khi cập nhật:", result);
        Alert.alert("Lỗi", result.error || "Không thể cập nhật món ăn");
      }
    } catch (err) {
      console.error("Chi tiết lỗi khi cập nhật:", err);
      if (err.message.includes("Network request failed")) {
        Alert.alert("Lỗi kết nối", "Không thể kết nối tới server.");
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra: " + err.message);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sửa món ăn</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên món ăn"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Giá (VNĐ)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Danh mục:</Text>
        <Picker
          selectedValue={categoryId}
          onValueChange={(itemValue) => setCategoryId(itemValue)}
          style={styles.picker}
        >
          {categories.map((category) => (
            <Picker.Item
              key={category.id}
              label={category.name}
              value={category.id.toString()}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
        <Text style={styles.buttonText}>Chọn ảnh mới</Text>
      </TouchableOpacity>

      {currentImage && (
        <Image source={{ uri: currentImage }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpdateDish}>
        <Text style={styles.buttonText}>Cập nhật món ăn</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#e91e63",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    
  },
  imageButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 5,
    marginVertical: 10,
  },
});

export default EditDishScreen;
