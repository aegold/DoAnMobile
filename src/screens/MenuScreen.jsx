import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { BASE_URL, API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

const MenuScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories from:", API_ENDPOINTS.CATEGORIES);
      const response = await fetch(API_ENDPOINTS.CATEGORIES);
      const data = await response.json();
      console.log("Categories received:", data);
      setCategories(data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, [])
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => navigation.navigate("DishList", { category: item })}
    >
      <Image
        source={{ uri: `${BASE_URL}${item.image}` }}
        style={styles.categoryImage}
      />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thực đơn</Text>
      </View>
      {categories.length === 0 ? (
        <Text style={styles.emptyText}>Không có danh mục nào</Text>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  categoryItem: { flex: 1, margin: 5, alignItems: "center" },
  categoryImage: { width: 150, height: 150, borderRadius: 10 },
  categoryName: { marginTop: 5, fontSize: 16, fontWeight: "bold" },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});

export default MenuScreen;
