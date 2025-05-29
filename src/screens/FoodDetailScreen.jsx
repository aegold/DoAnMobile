import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  Sen_400Regular,
  Sen_700Bold,
  Sen_800ExtraBold,
} from "@expo-google-fonts/sen";
import { BASE_URL } from "../constants/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const FoodDetailScreen = ({ route, navigation }) => {
  const { dish } = route.params;
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { fetchWithAuth } = useAuth();

  const [fontsLoaded] = useFonts({
    Sen_400Regular,
    Sen_700Bold,
    Sen_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = async () => {
    try {
      const dishWithQuantity = {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: quantity,
        totalPrice: dish.price * quantity
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
          quantity: parseInt(quantity),
        }),
      });

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: `Đã thêm ${quantity} ${dish.name} vào giỏ hàng`,
          position: "bottom",
          visibilityTime: 2000,
        });
        
        // Reset quantity back to 1 after successful add
        setQuantity(1);
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

  return (
    <ScrollView style={styles.container}>
      {/* Nút Back */}
     <TouchableOpacity 
               style={styles.backButton}
               onPress={() => navigation.goBack()}
             >
               <Ionicons name="chevron-back" size={24} color="black" />
             </TouchableOpacity>

      {/* Ảnh Món Ăn */}
      <Image
        source={{ uri: `${BASE_URL}${dish.image}` }}
        style={styles.foodImage}
        resizeMode="cover"
      />

      {/* Thông tin món ăn */}
    <View style={styles.infoContainer}>
      {/* Tên món ăn và số lượng */}
      <View style={styles.nameAndQuantityContainer}>
        <Text style={styles.foodName}>{dish.name}</Text>
        
      </View>

      {/* Mô tả món ăn */}
      <Text style={styles.foodDescription}>{dish.description || "Chưa có mô tả"}</Text>

      {/* Giá món ăn */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Giá tiền: </Text>
        <Text style={styles.foodPrice}>
          {(dish.price * quantity).toLocaleString()} VND
        </Text>
      </View>

      {/* Nút Thêm vào giỏ hàng */}
      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart} activeOpacity={0.7}>
        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

export default FoodDetailScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 10,
        marginTop: 10,
    },
    foodImage: {
      width: width - 60,
      height: width - 60,
      borderRadius: 16,
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
      marginTop: 40,
    },
    infoContainer: {
      flex: 1,
      marginTop: 20,
      padding: 15,
      justifyContent: "space-between",
    },
    nameAndQuantityContainer: {
      marginTop   : 10,
      flexDirection: "row",
      justifyContent: "space-between",
      //alignItems: "center",
    //   margin: 5,
    marginLeft: 0,
    },
    foodName: {
      fontSize: 28,
      fontFamily: "Sen_700Bold",
      color: "#000",
      flex: 1, 
      marginHorizontal: 20,
      marginBottom:10
      
    },
    quantityContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 10,
    },
    quantityText: {
      fontSize: 22,
      fontFamily: "Sen_700Bold",
      marginHorizontal: 10,
      color: "#000",
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 10,
    },
    priceLabel: {
      fontSize: 18,
      fontFamily: "Sen_700Bold",
      color: "#000",
      marginRight: 10,
    },
    foodDescription: {
      fontSize: 16,
      fontFamily: "Sen_400Regular",
      color: "#666",
      marginBottom: 20,
      marginHorizontal: 20,
      lineHeight: 22,
    },
    foodPrice: {
      fontSize: 30,
      fontFamily: "Sen_700Bold",
      color: "#d90429",
      marginHorizontal: 20,
   
    },
    addToCartButton: {
      backgroundColor: "#d90429",
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      marginHorizontal: 20,
        marginBottom: 20,
    },
    addToCartText: {
      fontSize: 20,
      fontFamily: "Sen_700Bold",
      color: "#fff",
    },
  });