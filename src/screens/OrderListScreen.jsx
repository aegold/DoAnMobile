import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../constants/api";

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth } = useAuth();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Đang lấy danh sách đơn hàng...");
      const response = await fetchWithAuth(API_ENDPOINTS.ORDERS);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi lấy đơn hàng");
      }

      const data = await response.json();
      console.log("Dữ liệu đơn hàng:", data);
      setOrders(data);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      Alert.alert("Lỗi", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrderDetail = (order) => {
    navigation.navigate("OrderDetail", { order });
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => handleViewOrderDetail(item)}
    >
      <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
      <Text style={styles.orderDate}>
        Ngày đặt: {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <Text style={styles.orderTotal}>
        Tổng tiền: {item.total.toLocaleString()} VNĐ
      </Text>
      <Text style={styles.orderStatus}>
        Trạng thái: {item.status === "Đang xử lý" ? "Chờ xử lý" : "Đã xử lý"}
      </Text>
      <Text style={styles.viewDetail}>Nhấn để xem chi tiết</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách đơn hàng</Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 16,
    color: "#e91e63",
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  viewDetail: {
    fontSize: 14,
    color: "#e91e63",
    fontStyle: "italic",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default OrderListScreen;
