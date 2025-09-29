import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { Stack } from "expo-router";

export default function PlayerScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "My Music App" }} />
      <SafeAreaView style={styles.container} testID="player-safe-area">
        <StatusBar barStyle="light-content" />
        <View style={styles.header} testID="player-header">
          <Text style={styles.title} testID="player-title">🎵 My Music App</Text>
        </View>
        <View style={styles.content} testID="player-content">
          <Text style={styles.placeholder} testID="player-placeholder">
            Your music player UI will go here.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    color: "#aaa",
    fontSize: 16,
  },
});
