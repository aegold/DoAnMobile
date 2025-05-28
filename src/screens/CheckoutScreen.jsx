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
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, BASE_URL } from '../constants/api';
import { Sen_700Bold } from '@expo-google-fonts/sen';
import { useFonts } from 'expo-font';
import * as WebBrowser from 'expo-web-browser';

const PaymentMethodCard = ({ selected, onSelect, icon, title, description }) => (
  <TouchableOpacity
    style={[
      styles.paymentMethodCard,
      selected && styles.selectedPaymentMethodCard,
    ]}
    onPress={onSelect}
  >
    <View style={styles.paymentMethodContent}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodIcon}>
          {icon}
        </View>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodTitle}>{title}</Text>
          <Text style={styles.paymentMethodDescription}>{description}</Text>
        </View>
      </View>
      <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
        <View style={selected ? styles.radioButtonInner : null} />
      </View>
    </View>
  </TouchableOpacity>
);

const CheckoutScreen = ({ navigation }) => {
  const { cart, getTotalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  useEffect(() => {
    const handleDeepLink = async (event) => {
      try {
        setIsProcessingPayment(true);
        let url = event.url || event;
        console.log('Received URL:', url);

        // Parse URL manually
        const urlParts = url.split('?');
        if (urlParts.length > 1) {
          const searchParams = new URLSearchParams(urlParts[1]);
          const responseCode = searchParams.get('vnp_ResponseCode');
          console.log('Response code:', responseCode);

          if (url.includes('payment/vnpay')) {
            if (responseCode === '00') {
              Alert.alert('Thành công', 'Thanh toán VNPay thành công!', [
                {
                  text: 'OK',
                  onPress: () => {
                    clearCart();
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'BottomTabNavigator' }],
                    });
                  },
                },
              ]);
            } else {
              Alert.alert('Thất bại', 'Thanh toán VNPay không thành công!', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'BottomTabNavigator' }],
                    });
                  },
                },
              ]);
            }
          }
        }
      } catch (error) {
        console.error('Deep link handling error:', error);
        Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setIsProcessingPayment(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation, clearCart]);

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

  const handleVNPayPayment = async (orderId, amount) => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/payment/create_payment_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount),
          bankCode: '',
          language: 'vn',
          orderId: orderId,
          orderInfo: `Thanh toan don hang #${orderId}`,
          orderType: 'other'
        }),
      });

      const result = await response.text();
      console.log('VNPay URL:', result);
      
      if (response.ok && result) {
        if (result.includes('vnpayment.vn')) {
          const supported = await Linking.canOpenURL(result);
          if (supported) {
            // Đăng ký lắng nghe sự kiện URL trước khi mở trang thanh toán
            const urlListener = Linking.addEventListener('url', ({ url }) => {
              console.log('URL received:', url);
              handleDeepLink(url);
              // Hủy đăng ký listener sau khi xử lý
              urlListener.remove();
            });

            // Mở URL thanh toán
            await Linking.openURL(result);
          } else {
            console.error('Cannot open URL:', result);
            Alert.alert('Lỗi', 'Không thể mở trang thanh toán');
          }
        } else {
          console.error('Invalid VNPay URL:', result);
          Alert.alert('Lỗi', 'URL thanh toán không hợp lệ');
        }
      } else {
        console.error('VNPay error response:', result);
        Alert.alert('Lỗi', 'Không thể khởi tạo thanh toán VNPay');
      }
    } catch (error) {
      console.error('VNPay payment error:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện thanh toán qua VNPay');
    } finally {
      setLoading(false);
    }
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
        paymentMethod: paymentMethod,
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
        if (paymentMethod === 'vnpay') {
          await handleVNPayPayment(result.orderId, totalAmount);
        } else {
          Alert.alert('Thành công', 'Đặt hàng thành công!', [
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                navigation.navigate('BottomTabNavigator');
              },
            },
          ]);
        }
      } else {
        Alert.alert('Lỗi', result.error || 'Đặt hàng thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt hàng, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (isProcessingPayment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E60023" />
        <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
      </View>
    );
  }

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          
          <PaymentMethodCard
            selected={paymentMethod === 'cod'}
            onSelect={() => setPaymentMethod('cod')}
            icon={<MaterialCommunityIcons name="cash-multiple" size={24} color="#E60023" />}
            title="Thanh toán khi nhận hàng"
            description="Thanh toán bằng tiền mặt khi nhận hàng"
          />

          <PaymentMethodCard
            selected={paymentMethod === 'vnpay'}
            onSelect={() => setPaymentMethod('vnpay')}
            icon={<Image source={require('../../assets/vnpay-logo.png')} style={styles.vnpayLogo} />}
            title="Thanh toán qua VNPay"
            description="Thanh toán online qua cổng VNPay"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, loading && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.checkoutButtonText}>
            {paymentMethod === 'vnpay' ? 'Thanh toán qua VNPay' : 'Đặt hàng'}
          </Text>
          <Text style={styles.totalAmount}>
            {totalAmount.toLocaleString()} VND
          </Text>
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
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  paymentMethodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPaymentMethodCard: {
    borderColor: '#E60023',
    backgroundColor: '#FFF5F5',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: '#000',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#E60023',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E60023',
  },
  vnpayLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  totalAmount: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default CheckoutScreen; 