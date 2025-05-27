import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  Sen_400Regular,
  Sen_700Bold,
  Sen_800ExtraBold,
} from "@expo-google-fonts/sen";
import { BASE_URL } from "../constants/api";

const { width } = Dimensions.get("window");

const FoodDetailScreen = ({ route, navigation }) => {
  const { dish } = route.params;
  const [quantity, setQuantity] = useState(1);

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

  const handleAddToCart = () => {
    console.log(`Đã thêm ${quantity} ${dish.name} vào giỏ hàng`);
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={decreaseQuantity}>
            <Ionicons name="remove-circle" size={32} color="#d90429" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={increaseQuantity}>
            <Ionicons name="add-circle" size={32} color="#d90429" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mô tả món ăn */}
      <Text style={styles.foodDescription}>Mô tả món</Text>

      {/* Giá món ăn */}
      <Text style={styles.foodPrice}>
        {dish.price.toLocaleString()} VND
      </Text>

      {/* Nút Thêm vào giỏ hàng */}
      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
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
    foodDescription: {
      fontSize: 16,
      fontFamily: "Sen_400Regular",
      color: "#666",
      //textAlign: "center",
      marginBottom: 10,
      marginHorizontal: 20,
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