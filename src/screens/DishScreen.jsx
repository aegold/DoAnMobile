import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  FlatList,
  Image,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useCart } from "../context/CartContext";
import { BASE_URL } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { Sen_700Bold } from '@expo-google-fonts/sen';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 90) / 2;

const DishScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const { user, fetchWithAuth } = useAuth();
  const { addToCart } = useCart();
  const [dishes, setDishes] = useState([]);

  const [fontsLoaded] = useFonts({
    Sen_700Bold,
  });

  const fetchDishes = async () => {
    try {
      const response = await fetchWithAuth(
        `${BASE_URL}/api/dishes/${category.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setDishes(data);
      } else {
        Alert.alert("Lỗi", "Không thể lấy danh sách món ăn");
      }
    } catch (err) {
      console.error("Lỗi khi lấy món ăn:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lấy danh sách món ăn");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDishes();
    }, [])
  );

  const handleAddToCart = async (dish) => {
    try {
      addToCart(dish);
      const response = await fetchWithAuth(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishId: dish.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Đã thêm vào giỏ hàng",
          position: "bottom",
          visibilityTime: 2000,
        });
      } else {
        const error = await response.json();
        Toast.show({
          type: "error",
          text1: error.error || "Không thể thêm vào giỏ hàng",
          position: "bottom",
          visibilityTime: 2000,
        });
      }
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra khi thêm vào giỏ hàng",
        position: "bottom",
        visibilityTime: 2000,
      });
    }
  };

  const renderDishItem = ({ item, index }) => (
    <View style={[
      styles.dishItem,
      index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }
    ]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `${BASE_URL}${item.image}` }}
          style={styles.dishImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.dishPrice}>{item.price.toLocaleString()} VND</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{category.name}</Text>
        <View style={{ width: 40 }} />
      </View>
      {dishes.length === 0 ? (
        <Text style={styles.emptyText}>Không có món ăn nào</Text>
      ) : (
        <FlatList
          data={dishes}
          renderItem={renderDishItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
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
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Sen_700Bold',
    color: "#000",
  },
  listContainer: {
    padding: 35,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dishItem: {
    width: ITEM_SIZE,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: ITEM_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dishImage: {
    width: "100%",
    height: "100%",
  },
  dishInfo: {
    padding: 12,
  },
  dishName: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: "#000",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishPrice: {
    fontSize: 14,
    color: "#FF0000",
    fontFamily: 'Sen_700Bold',
  },
  addButton: {
    width: 24,
    height: 24,
    backgroundColor: "#FF0000",
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: -2,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    textAlign: "center",
    marginTop: 20,
  },
});

export default DishScreen;
