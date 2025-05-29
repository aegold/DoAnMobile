import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../constants/api';
import { useCart } from "../context/CartContext";
import { Ionicons } from '@expo/vector-icons';
import { 
  Sen_400Regular,
  Sen_700Bold,
  Sen_800ExtraBold,
} from '@expo-google-fonts/sen';
import Toast from 'react-native-toast-message';

const DishScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const { addToCart } = useCart();
  const { fetchWithAuth } = useAuth();
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/dishes/${category.id}`);
      if (response.ok) {
        const data = await response.json();
        setDishes(data);
      } else {
        console.error('Failed to fetch dishes');
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const handleDishPress = (dish) => {
    navigation.navigate('FoodDetail', { dish });
  };

  const handleAddToCart = async (dish) => {
    try {
      const dishWithQuantity = {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: 1,
        totalPrice: dish.price
      };

      // Add to local cart context
      addToCart(dishWithQuantity);

      // Add to server cart
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
          text1: `Đã thêm ${dish.name} vào giỏ hàng`,
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

  const renderDishItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dishItem}
      onPress={() => handleDishPress(item)}
    >
      <Image
        source={{ uri: `${BASE_URL}${item.image}` }}
        style={styles.dishImage}
        resizeMode="cover"
      />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.dishPrice}>{item.price.toLocaleString()} VND</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation(); // Ngăn không cho bubble up tới onPress của card
              handleAddToCart(item);
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{category.name}</Text>
        {/* <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color="#000" />
        </TouchableOpacity> */}
      </View>

      <FlatList
        key="_2columns"
        data={dishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDishItem}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;
const itemWidth = (windowWidth - (16 * 3)) / 2; // 16 is horizontal padding, 3 spaces

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#000',
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 40, // To offset the back button and keep title centered
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginTop:50
  },
  dishItem: {
    width: itemWidth * 0.9,
    height: 150,
    marginBottom: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,

  },
  dishImage: {
    width: 140,
    height: 120,
    borderRadius: 20,
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    bottom: 80,
    marginBottom:5
  },
  dishInfo: {
    width: '100%',
    height: 80,
    paddingBottom: 8,
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dishName: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Sen_700Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dishPrice: {
    fontSize: 14,
    color: '#E60023',
    fontFamily: 'Sen_400Regular',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E60023',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DishScreen;