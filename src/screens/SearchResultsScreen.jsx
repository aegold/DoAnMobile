import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { API_ENDPOINTS, BASE_URL } from "../constants/api";
import { useCart } from "../context/CartContext";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const SearchResultsScreen = ({ route, navigation }) => {
  const { query } = route.params;
  const { addToCart } = useCart();
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        console.log("Fetching kq tìm:", query);
        const response = await fetch(API_ENDPOINTS.SEARCH(query));
        const data = await response.json();
        console.log("Dữ liệu đã nhận:", data);
        setSearchResults(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Không thể tải kết quả tìm kiếm");
      }
    };

    fetchSearchResults();
  }, [query]);

  const handleAddToCart = (item) => {
    try {
      addToCart(item);
      Toast.show({
        type: 'success',
        text1: 'Thêm vào giỏ hàng thành công',
        text2: `Đã thêm ${item.name} vào giỏ hàng`,
        position: 'bottom',
        visibilityTime: 2000,
        autoHide: true,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thêm món ăn vào giỏ hàng',
        position: 'bottom',
        visibilityTime: 2000,
        autoHide: true,
      });
    }
  };

  const renderDish = ({ item }) => (
    <View style={styles.dishItem}>
      <View style={styles.dishContent}>
        <Image
          source={{ uri: `${BASE_URL}${item.image}` }}
          style={styles.dishImage}
          resizeMode="cover"
        />
        <View style={styles.dishInfo}>
          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.dishPrice}>{item.price.toLocaleString('vi-VN')} VNĐ</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Ionicons name="cart-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchQueryContainer}>
        <Text style={styles.searchQueryText}>Kết quả cho: "{query}"</Text>
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderDish}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Không tìm thấy món ăn</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  searchQueryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchQueryText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
  },
  dishItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dishImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dishInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  dishPrice: {
    fontSize: 14,
    color: "#E60023",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#E60023",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#E60023",
    textAlign: "center",
  },
});

export default SearchResultsScreen;
