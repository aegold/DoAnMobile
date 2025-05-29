import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, BASE_URL } from '../constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Sen_400Regular, Sen_700Bold } from '@expo-google-fonts/sen';

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Đang xử lý');
  const { fetchWithAuth, user } = useAuth();

  const [fontsLoaded] = useFonts({
    Sen_400Regular,
    Sen_700Bold,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(API_ENDPOINTS.ORDER_HISTORY);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => order.status === selectedStatus);

  const getStatusColor = (status) => {
    return status === 'Đang xử lý' ? '#FF9800' : status === 'Đã xác nhận' ? '#4CAF50' : '#E60023';
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate(
        user?.role === 'admin' ? 'AdminOrderDetail' : 'UserOrderDetail',
        { order: item }
      )}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
          <Text style={[
            styles.orderStatus,
            { 
              color: getStatusColor(item.status)
            }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày đặt:</Text>
          <Text style={styles.value}>
            {new Date(item.created_at).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={styles.value}>{item.total.toLocaleString()} VND</Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Image
              source={
                orderItem.image
                  ? { uri: `${BASE_URL}${orderItem.image}` }
                  : require('../../assets/img/default-food.png')
              }
              style={styles.itemImage}
              defaultSource={require('../../assets/img/default-food.png')}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{orderItem.name}</Text>
              <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {orderItem.price.toLocaleString()} VND
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
    </View>
  );

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#E60023" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử đơn hàng</Text>
        <View style={styles.rightHeader} />
      </View>

      <View style={styles.statusTabs}>
        {['Đang xử lý', 'Đã xác nhận', 'Đã hủy'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusTab,
              selectedStatus === status && styles.selectedTab
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.statusTabText,
              selectedStatus === status && styles.selectedTabText
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightHeader: {
    width: 40, // Để cân bằng với backButton
  },
  title: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'Sen_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    elevation: 2,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedTab: {
    backgroundColor: '#E60023',
  },
  statusTabText: {
    fontFamily: 'Sen_400Regular',
    fontSize: 14,
    color: '#666',
  },
  selectedTabText: {
    color: '#fff',
    fontFamily: 'Sen_700Bold',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: '#000',
  },
  orderStatus: {
    fontSize: 14,
    fontFamily: 'Sen_700Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Sen_400Regular',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Sen_700Bold',
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 12,
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontFamily: 'Sen_700Bold',
    color: '#000',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Sen_400Regular',
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'Sen_700Bold',
    color: '#E60023',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontFamily: 'Sen_400Regular',
  },
});

export default OrderHistoryScreen; 