import React from "react";
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
import { API_ENDPOINTS, BASE_URL } from "../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { Sen_700Bold } from '@expo-google-fonts/sen';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

const CartScreen = ({ navigation }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } =
    useCart();

  const [fontsLoaded] = useFonts({
    Sen_700Bold,
  });

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống, vui lòng thêm món ăn!");
      return;
    }

    try {
      const orderData = {
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
        total: getTotalPrice(),
      };

      console.log("Placing order:", orderData);
      const response = await fetch(API_ENDPOINTS.ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      const result = await response.json();
      console.log("Order result:", result);

      if (response.ok) {
        Alert.alert("Thành công", "Đặt hàng thành công!");
        clearCart();
      } else {
        Alert.alert("Lỗi", result.error || "Đặt hàng thất bại");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      Alert.alert("Lỗi", "Không thể đặt hàng, vui lòng thử lại!");
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: `${BASE_URL}${item.image}` }}
        style={styles.cartImage}
      />
      <View style={styles.cartInfo}>
        <Text style={styles.cartName}>{item.name}</Text>
        <Text style={styles.cartPrice}>{item.price.toLocaleString()} VND</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, -1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.cartQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
        >
          <Text style={styles.removeButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  const EmptyCartContent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.redBackground}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: 'white' }]}>Giỏ Hàng</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
      
      <View style={styles.emptyContentCard}>
        <View style={styles.emptyImageContainer}>
          <Image 
            source={require('../../assets/img/no-cart.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.emptyText}>Không có sản phẩm</Text>
      </View>

      <TouchableOpacity 
        style={styles.startOrderButton}
        onPress={() => navigation.navigate('Menu')}
      >
        <Text style={styles.startOrderButtonText}>Bắt đầu chọn món</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar style="light" />
      {cart.length === 0 ? (
        <EmptyCartContent />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Giỏ Hàng</Text>
            <View style={{ width: 40 }} />
          </View>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
          />
          <View style={styles.orderContainer}>
            <Text style={styles.totalText}>
              Tổng: {getTotalPrice().toLocaleString()} VND
            </Text>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.orderButtonText}>Đặt hàng</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  redBackground: {
    backgroundColor: "#FF0000",
    height: height * 0.25,
    width: '100%',
    position: 'absolute',
    top: 0,
    borderBottomStartRadius:50,
    borderBottomEndRadius:100,
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
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContentCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: height * 0.15,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyImageContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: '100%',
    height: '100%',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Sen_700Bold',
    color: "#000",
    marginTop: 16,
  },
  startOrderButton: {
    backgroundColor: "#FF0000",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartName: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: "#000",
  },
  cartPrice: {
    fontSize: 14,
    color: "#FF0000",
    fontFamily: 'Sen_700Bold',
    marginTop: 4,
  },
  cartQuantity: {
    fontSize: 16,
    color: "#000",
    marginHorizontal: 16,
    fontFamily: 'Sen_700Bold',
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: "#FF0000",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
  },
  removeButton: {
    backgroundColor: "#FF0000",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontFamily: 'Sen_700Bold',
  },
  orderContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalText: {
    fontSize: 18,
    fontFamily: 'Sen_700Bold',
    color: "#FF0000",
    marginBottom: 12,
  },
  orderButton: {
    backgroundColor: "#FF0000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
  },
});

export default CartScreen;
