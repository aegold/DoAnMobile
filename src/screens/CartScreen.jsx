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
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const [fontsLoaded] = useFonts({
    Sen_700Bold,
  });

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống, vui lòng thêm món ăn!");
      return;
    }
    navigation.navigate("Checkout");
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: `${BASE_URL}${item.image}` }}
        style={styles.cartImage}
      />
      <View style={styles.cartInfo}>
        <View style={styles.cartHeader}>
          <View style={styles.cartTitleContainer}>
            <Text style={styles.cartName}>{item.name}</Text>
            
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="#E60023" />
          </TouchableOpacity>
        </View>
        <View style={styles.cartFooter}>
          <Text style={styles.cartPrice}>{item.price.toLocaleString()} VND</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, -1)}
            >
              <Ionicons name="remove" size={20} color="#E60023" />
            </TouchableOpacity>
            <Text style={styles.cartQuantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, 1)}
            >
              <Ionicons name="add" size={20} color="#E60023" />
            </TouchableOpacity>
          </View>
        </View>
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
            contentContainerStyle={styles.cartList}
          />
          <View style={styles.orderContainer}>
            <Text style={styles.totalText}>
              Tổng: {getTotalPrice().toLocaleString()} VND
            </Text>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={handleCheckout}
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
    backgroundColor: "#fff",
  },
  redBackground: {
    backgroundColor: "#E60023",
    height: height * 0.45,
    width: '100%',
    position: 'absolute',
    top: 0,
    borderBottomStartRadius: 60,
    borderBottomEndRadius: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
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
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
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
  cartImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cartTitleContainer: {
    flex: 1,
  },
  cartName: {
    fontSize: 18,
    fontFamily: 'Sen_700Bold',
    color: "#000",
    marginBottom: 4,
  },
  cartCategory: {
    fontSize: 14,
    color: "#666",
    fontFamily: 'Sen_700Bold',
  },
  cartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cartPrice: {
    fontSize: 16,
    color: "#E60023",
    fontFamily: 'Sen_700Bold',
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    padding: 4,
  },
  cartQuantity: {
    fontSize: 16,
    color: "#000",
    marginHorizontal: 12,
    fontFamily: 'Sen_700Bold',
    minWidth: 24,
    textAlign: 'center',
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
    color: "#E60023",
    marginBottom: 12,
  },
  orderButton: {
    backgroundColor: "#E60023",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContentCard: {
    backgroundColor: 'white',
    marginHorizontal: 60,
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
    width: width ,
    height: width ,
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
    backgroundColor: "#E60023",
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
});

export default CartScreen;
