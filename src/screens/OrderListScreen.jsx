import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS } from "../constants/api";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('Đang xử lý');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const { fetchWithAuth } = useAuth();

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);
  const handleConfirmDate = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };


  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(API_ENDPOINTS.ORDERS);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Lỗi khi lấy đơn hàng");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      Alert.alert("Lỗi", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đang xử lý':
        return '#FF9800';
      case 'Đã xác nhận':
        return '#4CAF50';
      case 'Đã hủy':
        return '#E60023';
      default:
        return '#666';
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    const isSameDay =
      orderDate.getDate() === selectedDate.getDate() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getFullYear() === selectedDate.getFullYear();

    return order.status === selectedStatus && isSameDay;
  });
  const exportToExcel = async () => {
    try {
      const exportData = orders.map((item) => ({
        "ID": item.id,
        "Ngày đặt": new Date(item.created_at).toLocaleDateString("vi-VN"),
        "Khách hàng": item.user_name,
        "Trạng thái": item.status,
        "Tổng tiền": item.total.toLocaleString("vi-VN") + " VNĐ",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn hàng");

      const excelBinary = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });

      const fileUri = FileSystem.documentDirectory + "donhang.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, excelBinary, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      Alert.alert("Lỗi", "Không thể xuất file Excel");
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate("AdminOrderDetail", { order: item })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày đặt:</Text>
          <Text style={styles.value}>
            {new Date(item.created_at).toLocaleDateString('vi-VN')}
          </Text>
          
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Khách hàng:</Text>
          <Text style={styles.value}>{item.user_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={styles.value}>{item.total.toLocaleString()} VNĐ</Text>
        </View>
      </View>

      <View style={styles.viewDetailButton}>
        <Text style={styles.viewDetailText}>Xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={20} color="#E60023" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E60023" />
      </View>
    );
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
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
        <View style={{ width: 40 }} />
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
      <View style={styles.Filter}>
      <View style={styles.dateFilter}>
        <Text style={styles.dateLabel}>Ngày:</Text>
        <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString("vi-VN")}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.exportButton} onPress={exportToExcel}>
            <Text style={styles.exportText}>Xuất Excel</Text>
          </TouchableOpacity>
      </View>
      

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            Không có đơn hàng nào ở trạng thái {selectedStatus.toLowerCase()} ngày này.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={selectedDate}
        maximumDate={new Date()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  dateFilter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: "#000",
    fontWeight: 'bold',
    marginRight: 8,
  },
  dateButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#000",
  },
  listContainer: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontFamily: 'Sen_700Bold',
    color: "#000",
  },
  orderStatus: {
    fontSize: 14,
    fontFamily: 'Sen_700Bold',
  },
  orderInfo: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
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
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  viewDetailText: {
    fontSize: 14,
    color: '#E60023',
    fontFamily: 'Sen_700Bold',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Sen_400Regular',
    textAlign: 'center',
  },
  exportButton: {
  backgroundColor: "#E60023",
  padding: 12,
  borderRadius: 8,
  marginHorizontal: 16,
  marginBottom: 8,
  alignItems: "center",
},
exportText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
},
Filter:{
  flexDirection:"row",
  justifyContent:"space-between"
}

});

export default OrderListScreen;
