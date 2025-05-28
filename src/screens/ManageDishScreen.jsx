import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator
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
      const response = await fetchWithAuth(`${BASE_URL}/api/dishes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách món ăn');
      }

      const data = await response.json();
      setDishes(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách món ăn:", error);
      Alert.alert(
        "Lỗi",
        "Không thể tải danh sách món ăn. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa món ăn này không?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetchWithAuth(`${BASE_URL}/api/dishes/${dishId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể xóa món ăn');
              }

              Alert.alert("Thành công", "Xóa món ăn thành công");
              fetchDishes(); // Tải lại danh sách sau khi xóa
            } catch (error) {
              console.error("Lỗi khi xóa món ăn:", error);
              Alert.alert(
                "Lỗi",
                "Không thể xóa món ăn. Vui lòng thử lại sau."
              );
            }
          }
        }
      ]
    );
  };

  const renderDishItem = ({ item }) => (
    <View style={styles.dishItem}>
      <Image
        source={{ 
          uri: item.image ? `${BASE_URL}${item.image}` : `${BASE_URL}/public/images/default-dish.png`
        }}
        style={styles.dishImage}
        resizeMode="cover"
      />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishPrice}>{item.price.toLocaleString('vi-VN')} VNĐ</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditDish", {
            dish: item,
            onUpdate: fetchDishes,
          })}
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E60023" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddDish", { onUpdate: fetchDishes })}
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
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  listContainer: {
    padding: 12,
  },
  addButton: {
    backgroundColor: "#E60023",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dishItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dishInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#E60023",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default ManageDishesScreen;
