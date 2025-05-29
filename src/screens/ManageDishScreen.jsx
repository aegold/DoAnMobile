import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS, BASE_URL } from "../constants/api";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../components/customAlert";

const ManageDishesScreen = ({ navigation }) => {
  const { user, fetchWithAuth } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (user?.role !== "admin") {
      showAlert("Lỗi", "Chỉ admin mới được truy cập màn hình này", () => {
        navigation.goBack();
      });
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
      showAlert(
        "Lỗi",
        "Không thể tải danh sách món ăn. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDish = async (dishId) => {
    showAlert(
      "Xác nhận",
      "Bạn có chắc chắn muốn ẩn món ăn này không?",
      async () => {
        try {
          const response = await fetchWithAuth(`${BASE_URL}/api/dishes/${dishId}/status`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Không thể ẩn món ăn');
          }

          showAlert("Thành công", "Đã ẩn món ăn thành công", () => {
            fetchDishes();
          });
        } catch (error) {
          console.error("Lỗi khi ẩn món ăn:", error);
          showAlert(
            "Lỗi",
            "Không thể ẩn món ăn. Vui lòng thử lại sau."
          );
        }
      }
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
          style={styles.editButton}
          onPress={() => navigation.navigate("EditDish", {
            dish: item,
            onUpdate: fetchDishes,
          })}
        >
          <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteDish(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#E31837" />
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý món ăn</Text>
        <View style={styles.headerRight} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Sen_700Bold",
    textAlign: "center",
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
