import React, { useState } from "react";
import { Searchbar } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

const MySearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const onChangeSearch = (query) => setSearchQuery(query);

  return (
    <View style={styles.searchContainer}>
      <StatusBar style="auto" />
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 10,
  },
  searchBar: {
    borderRadius: 5,
    elevation: 2,
  },
});

export default MySearch;
