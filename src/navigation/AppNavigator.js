import React from 'react';
<<<<<<< HEAD
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/home/HomeScreen';
import SpaceScreen from '../screens/space/SpaceScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import useAuthStore from '../store/useAuthStore';
import { theme } from '../utils/theme';

const Stack = createStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        cardStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Space" component={SpaceScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const token = useAuthStore(state => state.token);

  return <NavigationContainer>{token ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>;
=======
import HomePage from '../pages/HomePage';

export default function AppNavigator() {
  return <HomePage />;
>>>>>>> 1af36b0f8ba8debcac4f29675451e8074a03d48f
}
