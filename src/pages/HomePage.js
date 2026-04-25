import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A192F" />
      <Text style={styles.title}>Welcome to Closer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#E6F1FF',
    fontSize: 28,
    fontWeight: '600',
  },
});
