import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import ActivityScreen from '../screens/activity/ActivityScreen';
import SpaceScreen from '../screens/space/SpaceScreen';
import SpinScreen from '../screens/spin/SpinScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import useThemeStore from '../store/useThemeStore';
import { resolveTheme } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function makeStack(name, Component) {
  return function StackScreen() {
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const appTheme = resolveTheme(isDarkMode);

    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: appTheme.colors.background },
        }}>
        <Stack.Screen name={name} component={Component} />
      </Stack.Navigator>
    );
  };
}

const HomeStack = makeStack('Home', HomeScreen);
const ActivityStack = makeStack('Activity', ActivityScreen);
const SpaceStack = makeStack('SpaceTab', SpaceScreen);
const SpinStack = makeStack('Spin', SpinScreen);
const ProfileStack = makeStack('Profile', ProfileScreen);

const tabLabels = {
  Home: 'Home',
  Activity: 'Activity',
  Space: 'Space',
  Spin: 'Spin',
  Profile: 'Profile',
};

export default function MainTabs() {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.accent,
        tabBarInactiveTintColor: appTheme.colors.muted,
        tabBarStyle: {
          backgroundColor: appTheme.colors.surface,
          borderTopColor: appTheme.colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}>
      <Tab.Screen name="Home" component={HomeStack} options={{ title: tabLabels.Home }} />
      <Tab.Screen name="Activity" component={ActivityStack} options={{ title: tabLabels.Activity }} />
      <Tab.Screen name="Space" component={SpaceStack} options={{ title: tabLabels.Space }} />
      <Tab.Screen name="Spin" component={SpinStack} options={{ title: tabLabels.Spin }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: tabLabels.Profile }} />
    </Tab.Navigator>
  );
}