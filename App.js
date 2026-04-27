import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import useAuthStore from './src/store/useAuthStore';
import useThemeStore from './src/store/useThemeStore';
import { resolveTheme } from './src/utils/theme';

export default function App() {
  const hydrateAuth = useAuthStore(state => state.hydrateAuth);
  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const hydrateTheme = useThemeStore(state => state.hydrateTheme);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  useEffect(() => {
    hydrateAuth();
    hydrateTheme();
  }, [hydrateAuth, hydrateTheme]);

  if (!hasHydrated) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <View style={[styles.loaderContainer, { backgroundColor: appTheme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appTheme.colors.background} />
            <ActivityIndicator color={appTheme.colors.accent} size="large" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={appTheme.colors.background} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
