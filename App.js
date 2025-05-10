import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import ManageDishesScreen from './src/screens/ManageDishScreen';
import AddDishScreen from './src/screens/AddDishScreen';
import EditDishScreen from './src/screens/EditDishScreen';
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen
                name="BottomTabNavigator"
                component={BottomTabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ManageDishes"
                component={ManageDishesScreen}
                options={{ title: 'Quản lý món ăn' }}
              />
              <Stack.Screen
                name="AddDish"
                component={AddDishScreen}
                options={{ title: 'Thêm món ăn' }}
              />
              <Stack.Screen
                name="EditDish"
                component={EditDishScreen}
                options={{ title: 'Chỉnh sửa món ăn' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;