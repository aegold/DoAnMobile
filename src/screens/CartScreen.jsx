import React from "react";
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
import { API_ENDPOINTS, BASE_URL } from "../constants/api";

const CartScreen = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống, vui lòng thêm món ăn!");
      return;
    }

    try {
      const orderData = {
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
        total: getTotalPrice(),
      };

      console.log("Placing order:", orderData);
      const response = await fetch(API_ENDPOINTS.ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      console.log("Order result:", result);

      if (response.ok) {
        Alert.alert("Thành công", "Đặt hàng thành công!");
        clearCart(); // Xóa giỏ hàng sau khi đặt hàng
      } else {
        Alert.alert("Lỗi", result.error || "Đặt hàng thất bại");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      Alert.alert("Lỗi", "Không thể đặt hàng, vui lòng thử lại!");
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: `${BASE_URL}${item.image}` }}
        style={styles.cartImage}
      />
      <View style={styles.cartInfo}>
        <Text style={styles.cartName}>{item.name}</Text>
        <Text style={styles.cartPrice}>{item.price} VND</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, -1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.cartQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Text style={styles.removeButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Giỏ hàng</Text>
      {cart.length === 0 ? (
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
          />
          <View style={styles.orderContainer}>
            <Text style={styles.totalText}>
              Tổng: {getTotalPrice().toLocaleString("vi-VN")} VND
            </Text>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.orderButtonText}>Đặt hàng</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    elevation: 2,
  },
  cartImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cartInfo: {
    flex: 1,
    marginLeft: 10,
  },
  cartName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cartPrice: {
    fontSize: 14,
    color: "#e91e63",
    marginTop: 5,
  },
  cartQuantity: {
    fontSize: 14,
    color: "#333",
    marginHorizontal: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  quantityButton: {
    backgroundColor: "#e91e63",
    padding: 5,
    borderRadius: 5,
    width: 30,
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  orderContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e91e63",
    marginBottom: 10,
  },
  orderButton: {
    backgroundColor: "#e91e63",
    padding: 12,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CartScreen;
