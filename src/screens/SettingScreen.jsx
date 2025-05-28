import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL } from "../constants/api";

const SettingScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  const menuItems = [
    {
      section: "account",
      items: [
        {
          icon: "person-outline",
          title: "Thông tin cá nhân",
          onPress: () => navigation.navigate("Profile"),
          showArrow: true,
        },
        {
          icon: "lock-closed-outline",
          title: "Đổi mật khẩu",
          onPress: () => navigation.navigate("ChangePassword"),
          showArrow: true,
        }
      ]
    },
    {
      section: "orders",
      items: [
        {
          icon: "receipt-outline",
          title: "Lịch sử đơn hàng",
          onPress: () => navigation.navigate("OrderHistory"),
          showArrow: true,
        },
        {
          icon: "log-out-outline",
          title: "Đăng xuất",
          onPress: handleLogout,
          showArrow: true,
          color: '#E60023'
        }
      ]
    },
    ...(user?.role === 'admin' ? [{
      section: "admin",
      items: [
        {
          icon: "settings-outline",
          title: "Quản lý",
          onPress: () => navigation.navigate("Admin"),
          showArrow: true,
          color: '#E60023'
        }
      ]
    }] : []),
    
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: user?.image
                ? `${BASE_URL}${user.image}`
                : `${BASE_URL}/public/images/avatar-default.png`
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullname || "Chưa có thông tin"}</Text>
            <Text style={styles.userSubtitle}>
              {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View 
            key={section.section} 
            style={[
              styles.menuSection,
              sectionIndex > 0 && { marginTop: 16 }
            ]}
          >
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === section.items.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={item.color || '#000'} 
                  />
                  <Text 
                    style={[
                      styles.menuItemText,
                      item.color && { color: item.color }
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                {item.showArrow && (
                  <Ionicons 
                    name="chevron-forward" 
                    size={24} 
                    color={item.color || '#000'} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#E60023',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#FFDBDB'
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
});

export default SettingScreen;
