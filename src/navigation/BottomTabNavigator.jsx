import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import CartScreen from "../screens/CartScreen";
import SettingScreen from "../screens/SettingScreen";
import MenuScreen from "../screens/MenuScreen";
import DishScreen from "../screens/DishScreen";
import SearchResultsScreen from "../screens/SearchResultsScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import AdminScreen from "../screens/AdminScreen";
import ManageDishScreen from "../screens/ManageDishScreen";
import AddDishScreen from "../screens/AddDishScreen";
import EditDishScreen from "../screens/EditDishScreen";
import OrderListScreen from "../screens/OrderListScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MenuStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MenuList" component={MenuScreen} />
    <Stack.Screen
      name="DishList"
      component={DishScreen}
      options={({ route }) => ({
        headerShown: true,
        title: route.params?.category?.name || "Danh sách món",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      })}
    />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen
      name="SearchResults"
      component={SearchResultsScreen}
      options={{
        headerShown: true,
        title: "Kết quả tìm kiếm",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
  </Stack.Navigator>
);

const SettingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingMain" component={SettingScreen} />
    <Stack.Screen
      name="Admin"
      component={AdminScreen}
      options={{
        headerShown: true,
        title: "Quản lý",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
    <Stack.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{
        headerShown: true,
        title: "Quản lý danh mục",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
    <Stack.Screen
      name="ManageDishes"
      component={ManageDishScreen}
      options={{
        headerShown: true,
        title: "Quản lý món ăn",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
    <Stack.Screen
      name="AddDish"
      component={AddDishScreen}
      options={{
        headerShown: true,
        title: "Thêm món ăn",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
    <Stack.Screen
      name="EditDish"
      component={EditDishScreen}
      options={{
        headerShown: true,
        title: "Chỉnh sửa món ăn",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
    <Stack.Screen
      name="OrderList"
      component={OrderListScreen}
      options={{
        headerShown: true,
        title: "Danh sách đơn hàng",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
    <Stack.Screen
      name="OrderDetail"
      component={OrderDetailScreen}
      options={{
        headerShown: true,
        title: "Chi tiết đơn hàng",
        headerStyle: { backgroundColor: "#e91e63" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
  </Stack.Navigator>
);

const BottomTabNavigator = ({ navigation }) => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: "#e91e63",
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={{
          tabBarLabel: "Thực đơn",
          tabBarIcon: ({ color }) => (
            <Ionicons name="menu" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: "Giỏ hàng",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingStack}
        options={{
          tabBarLabel: "Cài đặt",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
