import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AdminScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý</Text>
        <View style={{ width: 24 }} />
      </View>


      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Categories")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant-outline" size={24} color="#E60023" />
          </View>
          <Text style={styles.menuText}>Quản lý danh mục</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("ManageDishes")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="fast-food-outline" size={24} color="#E60023" />
          </View>
          <Text style={styles.menuText}>Quản lý món ăn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("OrderList")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="document-text-outline" size={24} color="#E60023" />
          </View>
          <Text style={styles.menuText}>Xem đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 35,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Sen_700Bold",
    textAlign: "center",
  },
  menuContainer: {
    padding: 16,
    gap: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFE5E5",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#E60023",
    fontFamily: "Sen_700Bold",
  },
});

export default AdminScreen;
