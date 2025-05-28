import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../constants/api';
import { Ionicons } from '@expo/vector-icons';

const DishScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const { fetchWithAuth } = useAuth();
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/dishes/${category.id}`);
      if (response.ok) {
        const data = await response.json();
        setDishes(data);
      } else {
        console.error('Failed to fetch dishes');
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const handleDishPress = (dish) => {
    navigation.navigate('FoodDetail', { dish });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.name}</Text>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      <FlatList
        data={dishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.dishItem}
            onPress={() => handleDishPress(item)}
          >
            <Image
              source={{ uri: `${BASE_URL}${item.image}` }}
              style={styles.dishImage}
              resizeMode="cover"
            />
            <View style={styles.dishInfo}>
              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.dishPrice}>{item.price.toLocaleString()} VND</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E31837',
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  dishItem: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dishImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  dishInfo: {
    padding: 16,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dishPrice: {
    fontSize: 16,
    color: '#E31837',
    fontWeight: 'bold',
  },
});

export default DishScreen;