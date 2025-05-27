import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../constants/api";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import Modal from "react-native-modal";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const { login } = useAuth();
  const navigation = useNavigation();

  const showCustomAlert = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      showCustomAlert("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await login(data);
        navigation.navigate("BottomTabNavigator");
      } else {
        showCustomAlert(data.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      showCustomAlert("Không thể kết nối đến server, vui lòng thử lại!");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Welcome")}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Đăng Nhập HiHi</Text>
          <Text style={styles.subtitle}>Đăng nhập tài khoản của bạn</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Custom Alert Modal */}
      <Modal isVisible={modalVisible}>
        <View style={styles.modalContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#E60023" />
          <Text style={styles.modalText}>{modalMessage}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { padding: 8 },
  content: { flex: 1, paddingHorizontal: 24, marginTop: 40 },
  titleContainer: { marginBottom: 32, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: "#E60023", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#000" },
  form: { gap: 24 },
  inputContainer: { gap: 8 },
  label: { fontSize: 14, color: "#000", marginBottom: 4 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E60023",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  passwordContainer: { position: "relative" },
  passwordInput: { paddingRight: 50 },
  eyeIcon: { position: "absolute", right: 16, top: 12 },
  forgotPassword: { alignSelf: "flex-end" },
  forgotPasswordText: { color: "#E31837", fontSize: 14 },
  loginButton: {
    backgroundColor: "#E60023",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: { color: "#000", fontSize: 14 },
  registerLink: { color: "#E31837", fontSize: 14, fontWeight: "bold" },

  // Modal Styles
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 16,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#E60023",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LoginScreen;
