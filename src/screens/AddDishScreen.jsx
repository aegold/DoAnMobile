import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/AuthContext";
import { BASE_URL } from "../constants/api";
import * as ImagePicker from "expo-image-picker";

const AddDishScreen = ({ route, navigation }) => {
  const { fetchWithAuth } = useAuth();
  const { onUpdate } = route.params;
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

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
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const handleAddDish = async () => {
    if (!name || !price || !categoryId) {
      Alert.alert("Lỗi", "Tên, giá và danh mục là bắt buộc");
      return;
    }

    try {
      const url = `${BASE_URL}/api/dishes`;
      console.log("Đang thêm món ăn mới tại:", url);

      const formData = new FormData();
      formData.append("categoryId", categoryId);
      formData.append("name", name.trim());
      formData.append("description", description ? description.trim() : "");
      formData.append("price", price);

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

      console.log("FormData:", {
        categoryId,
        name: name.trim(),
        description: description ? description.trim() : "",
        price,
        hasImage: !!selectedImage,
      });

      const response = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      console.log("Trạng thái phản hồi thêm món:", response.status);
      if (response.ok) {
        Alert.alert("Thành công", "Thêm món ăn mới thành công");
        if (onUpdate) {
          onUpdate();
        }
        navigation.goBack();
      } else {
        const result = await response.json();
        console.log("Lỗi khi thêm món:", result);
        Alert.alert("Lỗi", result.error || "Không thể thêm món ăn mới");
      }
    } catch (err) {
      console.error("Chi tiết lỗi khi thêm món:", err);
      if (err.message.includes("Network request failed")) {
        Alert.alert("Lỗi kết nối", "Không thể kết nối tới server.");
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra: " + err.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thêm món ăn mới</Text>
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

      <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
        <Text style={styles.buttonText}>Chọn ảnh từ thiết bị</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image
          source={{ uri: selectedImage.uri }}
          style={styles.previewImage}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleAddDish}>
        <Text style={styles.buttonText}>Thêm món ăn</Text>
      </TouchableOpacity>
    </View>
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

export default AddDishScreen;
