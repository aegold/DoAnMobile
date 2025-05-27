import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS ,BASE_URL} from '../constants/api';
import { Sen_700Bold } from '@expo-google-fonts/sen';
import { useFonts } from 'expo-font';

const CheckoutScreen = ({ navigation }) => {
  const { cart, getTotalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Khởi tạo giá trị mặc định từ thông tin user
  useEffect(() => {
    if (user) {
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const [fontsLoaded] = useFonts({
    Sen_700Bold,
  });

  const shippingFee = 20000;
  const tax = getTotalPrice() * 0.08; // 8% VAT
  const totalAmount = getTotalPrice() + shippingFee + tax;

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: () => removeFromCart(itemId),
          style: 'destructive',
        },
      ]
    );
  };

  const handlePlaceOrder = async () => {
    if (!address.trim() || !phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin giao hàng');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        userId: user.id,
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
        address,
        phone,
        total: totalAmount,
      };

      const response = await fetch(API_ENDPOINTS.ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Thành công', 'Đặt hàng thành công!', [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              navigation.navigate('BottomTabNavigator');
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', result.error || 'Đặt hàng thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt hàng, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Đặt hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <TouchableOpacity>
              <Ionicons name="location-outline" size={20} color="#E60023" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ giao hàng"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Số điện thoại</Text>
            <TouchableOpacity>
              <Ionicons name="call-outline" size={20} color="#E60023" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image 
                source={{ uri: `${BASE_URL}${item.image}` }}
                style={styles.productImage}
              />
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E60023" />
                  </TouchableOpacity>
                </View>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>
                    {item.price.toLocaleString()} VND
                  </Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={20} color="#E60023" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
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
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng</Text>
            <Text style={styles.priceValue}>
              {getTotalPrice().toLocaleString()} VND
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>VAT (8%)</Text>
            <Text style={styles.priceValue}>{Math.round(tax).toLocaleString()} VND</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giao hàng</Text>
            <Text style={styles.priceValue}>
              {shippingFee.toLocaleString()} VND
            </Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toLocaleString()} VND
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.checkoutButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Sen_700Bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: '#E60023',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: '#000',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: '#E60023',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    marginHorizontal: 12,
  },
  deleteButton: {
    padding: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Sen_700Bold',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Sen_700Bold',
    color: '#E60023',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  checkoutButton: {
    backgroundColor: '#E60023',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default CheckoutScreen; 