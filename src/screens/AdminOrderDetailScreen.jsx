import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL, API_ENDPOINTS } from '../constants/api';
import { useAuth } from '../context/AuthContext';

const AdminOrderDetailScreen = ({ navigation, route }) => {
  const { order } = route.params;
  const { fetchWithAuth } = useAuth();
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const handleUpdateStatus = async (newStatus) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${newStatus === 'Đã hủy' ? 'hủy' : 'xác nhận'} đơn hàng này?`,
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Có',
          onPress: async () => {
            try {
              console.log('Calling API:', API_ENDPOINTS.UPDATE_ORDER_STATUS(order.id));
              const response = await fetchWithAuth(API_ENDPOINTS.UPDATE_ORDER_STATUS(order.id), {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Không thể cập nhật trạng thái đơn hàng');
              }

              const data = await response.json();
              setCurrentStatus(newStatus);
              Alert.alert(
                'Thành công', 
                `Đã ${newStatus === 'Đã hủy' ? 'hủy' : 'xác nhận'} đơn hàng thành công`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error updating order status:', error);
              Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Quản lý đơn hàng</Text>
        <View style={styles.rightHeader} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mã đơn hàng:</Text>
            <Text style={styles.value}>#{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngày đặt:</Text>
            <Text style={styles.value}>
              {new Date(order.created_at).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Trạng thái:</Text>
            <Text style={[
              styles.statusText,
              { 
                color: currentStatus === 'Đã hủy' ? '#E60023' : 
                      currentStatus === 'Đã xác nhận' ? '#4CAF50' : '#FF9800'
              }
            ]}>
              {currentStatus}
            </Text>
          </View>
          
          {currentStatus === 'Đang xử lý' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => handleUpdateStatus('Đã xác nhận')}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Xác nhận đơn</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleUpdateStatus('Đã hủy')}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Hủy đơn</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.deliveryInfo}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Người nhận:</Text>
            <Text style={styles.value}>{order.user_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại:</Text>
            <Text style={styles.value}>{order.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Địa chỉ:</Text>
            <Text style={styles.value}>{order.address}</Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Món ăn đã đặt</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Image
                source={
                  item.image
                    ? { uri: `${BASE_URL}${item.image}` }
                    : require('../../assets/img/default-food.png')
                }
                style={styles.itemImage}
                defaultSource={require('../../assets/img/default-food.png')}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Số lượng: x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {item.price.toLocaleString()} VND
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>
            {order.total.toLocaleString()} VND
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#E60023',
    elevation: 4,
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
    width: 40,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Sen_700Bold',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#E60023',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Sen_700Bold',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Sen_700Bold',
  },
  deliveryInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Sen_700Bold',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
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
  totalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: '#000',
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: 'Sen_700Bold',
    color: '#E60023',
  },
});

export default AdminOrderDetailScreen; 