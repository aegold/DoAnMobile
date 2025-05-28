import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL, API_ENDPOINTS } from "../constants/api";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { 
  Sen_400Regular,
  Sen_700Bold,
  Sen_800ExtraBold,
} from '@expo-google-fonts/sen';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2; // 48 = padding left 16 + padding right 16 + gap 16

const MenuScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  const [fontsLoaded] = useFonts({
    Sen_400Regular,
    Sen_700Bold,
    Sen_800ExtraBold,
    Inter_400Regular,
    Inter_700Bold
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, [])
  );

  if (!fontsLoaded) {
    return null;
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Thực đơn</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderCategory = ({ item, index }) => (
    <View style={[
      styles.categoryWrapper,
      index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }
    ]}>
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => navigation.navigate("DishList", { category: item })}
      >
        <Image
          source={{ uri: `${BASE_URL}${item.image}` }}
          style={styles.categoryImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={styles.categoryName}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 35,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryWrapper: {
    width: ITEM_SIZE,
    alignItems: 'center',
  },
  categoryItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryName: {
    fontSize: 20,
    fontFamily: 'Sen_700Bold',
    color: "#000",
    marginTop: 8,
    textAlign: "center",
  },
});

export default MenuScreen;
