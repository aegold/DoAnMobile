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
import WelcomeScreen from './src/screens/WelcomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import { FontProvider } from './src/context/FontContext';
const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <FontProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <Stack.Navigator>
                <Stack.Screen 
                name="Welcome"
                component={WelcomeScreen}
                options={{ headerShown: false }}
                />
                <Stack.Screen name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }} />
                <Stack.Screen name="Register" 
                component={RegisterScreen} 
                options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ headerShown: false }} />
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
      </FontProvider>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;