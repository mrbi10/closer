import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import useThemeStore from '../store/useThemeStore';
import { resolveTheme } from '../utils/theme';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: appTheme.colors.background },
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
