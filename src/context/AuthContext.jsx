import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Error loading user from storage:", err);
      }
    };
    loadUser();
  }, []);

  const login = async (data) => {
    try {
      console.log("Dữ liệu nhận được từ server:", data);
      const userData = {
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role,
        token: data.token,
      };
      console.log("Dữ liệu người dùng sau khi xử lý:", userData);
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      console.log("Đã lưu thông tin người dùng vào AsyncStorage");
    } catch (error) {
      console.error("Lỗi khi xử lý đăng nhập:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem("user");
      console.log("Đã đăng xuất và xóa thông tin người dùng");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    try {
      if (!user?.token) {
        throw new Error("Chưa đăng nhập");
      }

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${user.token}`,
      };

      // Chỉ set Content-Type nếu không phải FormData
      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      console.log("Gửi request với headers:", headers);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token hết hạn hoặc không hợp lệ
        await logout();
        throw new Error("Phiên đăng nhập đã hết hạn");
      }

      return response;
    } catch (error) {
      console.error("Lỗi trong fetchWithAuth:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
