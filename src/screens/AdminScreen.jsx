import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AdminScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý</Text>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Categories")}
        >
          <Ionicons name="list" size={32} color="#e91e63" />
          <Text style={styles.menuText}>Quản lý danh mục</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ManageDishes")}
        >
          <Ionicons name="restaurant" size={32} color="#e91e63" />
          <Text style={styles.menuText}>Quản lý món ăn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("OrderList")}
        >
          <Ionicons name="receipt" size={32} color="#e91e63" />
          <Text style={styles.menuText}>Xem đơn hàng</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 30,
    color: "#333",
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
  },
  menuItem: {
    backgroundColor: "#fff",
    width: "48%",
    aspectRatio: 1,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});

export default AdminScreen;
