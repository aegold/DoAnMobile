import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

const SettingScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cài đặt</Text>
      {user && (
        <>
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfo}>
              Tên: {user.name || "Chưa có thông tin"}
            </Text>
            <Text style={styles.userInfo}>
              Tên đăng nhập: {user.username || "Chưa có thông tin"}
            </Text>
            <Text style={styles.userInfo}>
              Vai trò: {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
            </Text>
          </View>

          {user.role === "admin" && (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => navigation.navigate("Admin")}
            >
              <Text style={styles.buttonText}>Quản lý</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </>
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
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  userInfoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  manageButton: {
    backgroundColor: "#e91e63",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SettingScreen;
