import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function SkeletonBlock({ style }) {
  return <View style={[styles.block, style]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
  },
});