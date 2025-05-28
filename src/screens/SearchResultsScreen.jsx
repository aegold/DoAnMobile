import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { API_ENDPOINTS, BASE_URL } from "../constants/api";
import { useCart } from "../context/CartContext";
import Toast from "react-native-toast-message";

const SearchResultsScreen = ({ route }) => {
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
      <Image
        source={{ uri: `${BASE_URL}${item.image}` }}
        style={styles.dishImage}
      />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishPrice}>{item.price} VNĐ</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Thêm giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kết quả tìm kiếm cho: "{query}"</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderDish}
          keyExtractor={(item) => item.id.toString()}
          style={styles.searchResults}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy món ăn</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  searchResults: {
    paddingHorizontal: 5,
  },
  dishItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 5,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  dishInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  dishName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  dishPrice: {
    fontSize: 14,
    color: "#e91e63",
    marginTop: 5,
  },
  addButton: {
    backgroundColor: "#e91e63",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    padding: 10,
    color: "#666",
  },
  errorText: {
    textAlign: "center",
    padding: 10,
    color: "#e91e63",
  },
});

export default SearchResultsScreen;
