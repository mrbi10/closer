import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import useAuthStore from './src/store/useAuthStore';
import { theme } from './src/utils/theme';

export default function App() {
  const hydrateAuth = useAuthStore(state => state.hydrateAuth);
  const hasHydrated = useAuthStore(state => state.hasHydrated);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  if (!hasHydrated) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
