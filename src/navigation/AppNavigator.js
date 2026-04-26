import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import MainTabs from './MainTabs';
import ChatScreen from '../screens/chat/ChatScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SpaceScreen from '../screens/space/SpaceScreen';
import { resolveTheme } from '../utils/theme';

const Stack = createStackNavigator();

function MainNavigator() {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: appTheme.colors.background },
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width * 0.04, 0],
                }),
              },
            ],
          },
        }),
      }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen name="Space" component={SpaceScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const token = useAuthStore(state => state.token);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: appTheme.colors.accent,
          background: appTheme.colors.background,
          card: appTheme.colors.surface,
          text: appTheme.colors.text,
          border: appTheme.colors.border,
          notification: appTheme.colors.accent,
        },
      }}>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
