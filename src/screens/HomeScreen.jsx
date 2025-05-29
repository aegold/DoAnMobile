import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  Pressable,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import Swiper from "react-native-swiper";
import { BASE_URL } from "../constants/api";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const imageWidth = width - 40;
const imageHeight = (imageWidth * 3) / 4;

// Load ảnh
let img1, img2, img3;
try {
  img1 = require("../../assets/img/img1.jpg");
  img2 = require("../../assets/img/img2.jpg");
  img3 = require("../../assets/img/img3.jpg");
} catch (error) {
  console.error("Error loading images:", error);
}

const HomeScreen = ({ navigation }) => {
  const { fetchWithAuth } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [comboDishes, setComboDishes] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchComboDishes();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchComboDishes = async () => {
    try {
      console.log('Fetching combo dishes...');
      // Lấy danh sách món ăn từ danh mục Combo
      const response = await fetchWithAuth(`${BASE_URL}/api/categories`);
      console.log('Categories response status:', response.status);

      const responseText = await response.text();
      console.log('Categories raw response:', responseText);

      const categories = JSON.parse(responseText);
      console.log('Parsed categories:', categories);

      // Tìm category có tên là "Combo"
      const comboCategory = categories.find(cat => cat.name.toLowerCase() === 'combo');
      
      if (!comboCategory) {
        console.log('Không tìm thấy danh mục Combo');
        return;
      }

      console.log('Found Combo category:', comboCategory);

      // Lấy dishes từ danh mục Combo
      const dishesResponse = await fetchWithAuth(`${BASE_URL}/api/dishes/${comboCategory.id}`);
      console.log('Dishes response status:', dishesResponse.status);

      const dishesText = await dishesResponse.text();
      console.log('Dishes raw response:', dishesText);

      if (dishesResponse.ok) {
        try {
          const dishes = JSON.parse(dishesText);
          console.log('Parsed combo dishes:', dishes);
          setComboDishes(dishes);
        } catch (parseError) {
          console.error('JSON Parse error:', parseError);
          console.error('Invalid JSON response:', dishesText);
          Alert.alert('Lỗi', 'Định dạng dữ liệu không hợp lệ');
        }
      } else {
        console.error('API Error Response:', dishesText);
        Alert.alert('Lỗi', 'Không thể lấy danh sách combo');
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách combo:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lấy danh sách combo");
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      navigation.navigate("SearchResults", { query: searchQuery });
    }
  };

  const handleDishPress = (dish) => {
    navigation.navigate("FoodDetail", { dish });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate("DishScreen", { category });
  };

  const renderCategorySlide = (category) => (
    <TouchableOpacity 
      style={styles.slide}
      onPress={() => handleCategoryPress(category)}
      key={category.id}
    >
      <Image 
        source={{ uri: `${BASE_URL}${category.image}` }} 
        style={styles.image} 
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.leftHeader} />
          <Image
            source={require('../../assets/img/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Ionicons name="cart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={() => searchInputRef.current?.focus()}
        >
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comboDishes}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
             <Swiper
        style={[styles.swiper, { height: imageHeight + 20 }]}
        autoplay
        loop
      >
        <View style={styles.slide}>
          <Image source={img1} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.slide}>
          <Image source={img2} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.slide}>
          <Image source={img3} style={styles.image} resizeMode="cover" />
        </View>
      </Swiper>
            <Text style={styles.comboTitle}>COMBO</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.comboItem}
            onPress={() => handleDishPress(item)}
          >
            <Image
              source={{ uri: `${BASE_URL}${item.image}` }}
              style={styles.comboImage}
              resizeMode="cover"
            />
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
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#E31837",
    height: 100
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  leftHeader: {
    width: 40,
  },
  logo: {
    width: 120,
    height: 120,
    position: 'absolute',
    left: '50%',
    marginLeft: -40,
  },
  cartButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE8E8",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 0,
  },
  swiper: {
    marginVertical: 20,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: imageWidth,
    height: imageHeight,
    borderRadius: 15,
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  categoryName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  comboTitle: {
    fontSize: 35,
    fontWeight: "bold",
    marginVertical: 10,
    marginTop: 50,
    color: "#E60023",
    alignSelf: "center",
    justifyContent: "center",
  },
  comboItem: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  comboImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  comboInfo: {
    padding: 15,
  },
  comboName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  comboPrice: {
    fontSize: 16,
    color: '#E60023',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
