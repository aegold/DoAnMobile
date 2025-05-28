import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS, BASE_URL } from "../constants/api";
import { Ionicons } from "@expo/vector-icons";

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
              fetchDishes();
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
      <View style={styles.dishContent}>
        <Image
          source={{ 
            uri: item.image ? `${BASE_URL}${item.image}` : `${BASE_URL}/public/images/default-dish.png`
          }}
          style={styles.dishImage}
          resizeMode="cover"
        />
        <View style={styles.dishInfo}>
          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.dishPrice}>{item.price.toLocaleString('vi-VN')} VND</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDish(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#E31837" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditDish", {
            dish: item,
            onUpdate: fetchDishes,
          })}
        >
          <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E31837" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý món ăn</Text>
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddDish", { onUpdate: fetchDishes })}
      >
        <Text style={styles.addButtonText}>Thêm món</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  listContainer: {
    padding: 16,
  },
  dishItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
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
  dishContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dishInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 14,
    color: "#E31837",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  editButton: {
    backgroundColor: "#FFE8E8",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: "#E31837",
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#E31837",
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
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default ManageDishesScreen;
