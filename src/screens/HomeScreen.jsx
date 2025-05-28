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
  TouchableOpacity
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [combos, setCombos] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/api/dishes`);
      if (response.ok) {
        const data = await response.json();
        setCombos(data);
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
        data={combos}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <Swiper
              style={[styles.swiper, { height: imageHeight }]}
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
          <TouchableOpacity>
          <View style={styles.comboItem}>
            <Image
              source={{ uri: `${BASE_URL}${item.image}` }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
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
    marginBottom: 30,
    alignItems: "center",
  },
});

export default HomeScreen;
