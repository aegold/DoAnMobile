import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  FlatList,
  Image,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useCart } from "../context/CartContext";
import { BASE_URL } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

const DishScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const { user, fetchWithAuth } = useAuth();
  const { addToCart } = useCart();
  const [dishes, setDishes] = useState([]);

  const fetchDishes = async () => {
    try {
      const response = await fetchWithAuth(
        `${BASE_URL}/api/dishes/${category.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setDishes(data);
      } else {
        Alert.alert("Lỗi", "Không thể lấy danh sách món ăn");
      }
    } catch (err) {
      console.error("Lỗi khi lấy món ăn:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lấy danh sách món ăn");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDishes();
    }, [])
  );

  const handleAddToCart = async (dish) => {
    try {
      // Thêm vào context trước
      addToCart(dish);

      // Sau đó gửi lên server
      const response = await fetchWithAuth(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishId: dish.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Đã thêm vào giỏ hàng",
          position: "bottom",
          visibilityTime: 2000,
        });
      } else {
        const error = await response.json();
        Toast.show({
          type: "error",
          text1: error.error || "Không thể thêm vào giỏ hàng",
          position: "bottom",
          visibilityTime: 2000,
        });
      }
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra khi thêm vào giỏ hàng",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  const renderDishItem = ({ item }) => (
    <View style={styles.dishItem}>
      <Image
        source={{ uri: `${BASE_URL}${item.image}` }}
        style={styles.dishImage}
      />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishDescription}>{item.description}</Text>
        <Text style={styles.dishPrice}>{item.price.toLocaleString()} VNĐ</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>{category.name}</Text>
      </View>
      {dishes.length === 0 ? (
        <Text style={styles.emptyText}>Không có món ăn nào</Text>
      ) : (
        <FlatList
          data={dishes}
          renderItem={renderDishItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
  dishItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    elevation: 2,
  },
  dishImage: { width: 80, height: 80, borderRadius: 10 },
  dishInfo: { flex: 1, marginLeft: 10 },
  dishName: { fontSize: 16, fontWeight: "bold" },
  dishDescription: { fontSize: 14, color: "#666" },
  dishPrice: { fontSize: 14, color: "#e91e63", marginTop: 5 },
  addButton: {
    backgroundColor: "#e91e63",
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});

export default DishScreen;
