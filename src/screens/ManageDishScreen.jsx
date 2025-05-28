import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS, BASE_URL } from "../constants/api";

const ManageDishesScreen = ({ navigation }) => {
  const { user, fetchWithAuth } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") {
      Alert.alert("Lỗi", "Chỉ admin mới được truy cập màn hình này");
      navigation.goBack();
      return;
    }

    fetchDishes();
  }, [user, navigation]);

  const fetchDishes = async () => {
    setIsLoading(true);
    try {
      const url = `${BASE_URL}/api/dishes`;
      console.log("Đang kết nối tới:", url);

      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000, // 10 giây timeout
      });

      console.log("Trạng thái phản hồi:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Dữ liệu món ăn từ API:", JSON.stringify(data, null, 2));
        setDishes(data);
      } else {
        const errorData = await response.json();
        console.log("Phản hồi lỗi:", errorData);
        Alert.alert("Lỗi kết nối", "Không thể kết nối tới server");
      }
    } catch (err) {
      console.error("Chi tiết lỗi:", err);
      if (err.message.includes("Network request failed")) {
        Alert.alert("Lỗi kết nối", "Không thể kết nối tới server.");
      } else {
        Alert.alert("Lỗi", "Có lỗi xảy ra: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    try {
      console.log("Deleting dish with ID:", dishId);
      const response = await fetchWithAuth(
        `${API_ENDPOINTS.BASE_URL}/api/dishes/${dishId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        Alert.alert("Thành công", "Xóa món ăn thành công");
        fetchDishes();
      } else {
        const result = await response.json();
        console.log("Delete error response:", result);
        Alert.alert("Lỗi", result.error || "Không thể xóa món ăn");
      }
    } catch (err) {
      console.error("Error deleting dish:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const renderDishItem = ({ item }) => {
    console.log("Dữ liệu item trong renderDishItem:", item);
    return (
      <View style={styles.dishItem}>
        <Image
          source={{ uri: `${BASE_URL}${item.image}` }}
          style={styles.dishImage}
          resizeMode="cover"
        />
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishPrice}>{item.price} VNĐ</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditDish", {
                dish: item,
                onUpdate: fetchDishes,
              })
            }
          >
            <Text style={styles.buttonText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteDish(item.id)}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý món ăn</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate("AddDish", { onUpdate: fetchDishes })
          }
        >
          <Text style={styles.addButtonText}>+ Thêm món</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={dishes}
        renderItem={renderDishItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có món ăn nào</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#e91e63",
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dishItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dishName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dishPrice: {
    fontSize: 16,
    color: "#666",
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default ManageDishesScreen;
