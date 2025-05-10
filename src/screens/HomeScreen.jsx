import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  Pressable,
} from "react-native";
import Swiper from "react-native-swiper";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Tính chiều cao để giữ tỷ lệ 4:3 (800x600)
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
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      navigation.navigate("SearchResults", { query: searchQuery });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chào mừng đến với nhà hàng!</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Tìm kiếm món ăn..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#fff" />
        </Pressable>
      </View>

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
      <Text style={styles.description}>
        Khám phá thực đơn đa dạng với các món ăn ngon miệng!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 15,
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchButton: {
    backgroundColor: "#e91e63",
    borderRadius: 25,
    padding: 12,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  swiper: {
    marginVertical: 10,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: imageWidth,
    height: imageHeight,
    borderRadius: 15,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
    color: "#555",
    fontStyle: "italic",
  },
});

export default HomeScreen;
