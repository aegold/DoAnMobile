import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BASE_URL } from "../constants/api";

const OrderDetailScreen = ({ route }) => {
  const { order } = route.params;

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Image
        source={{ uri: `${BASE_URL}${item.image}` }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString()} VNĐ</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>Chi tiết đơn hàng #{order.id}</Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.infoText}>
          Ngày đặt: {new Date(order.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.infoText}>Khách hàng: {order.user_name}</Text>
        <Text style={styles.infoText}>
          Trạng thái: {order.status === "pending" ? "Chờ xử lý" : "Đã xử lý"}
        </Text>
        <Text style={styles.totalText}>
          Tổng tiền: {order.total.toLocaleString()} VNĐ
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Danh sách món ăn</Text>
      <FlatList
        data={order.items}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có món ăn nào</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 15,
    backgroundColor: "#e91e63",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  orderInfo: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e91e63",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
    color: "#333",
  },
  orderItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: "#e91e63",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});

export default OrderDetailScreen;
