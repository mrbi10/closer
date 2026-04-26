import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PressableScale({ children, style, onPressIn, onPressOut, ...rest }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={event => {
        scale.value = withSpring(0.96, { damping: 12, stiffness: 220 });
        onPressIn?.(event);
      }}
      onPressOut={event => {
        scale.value = withSpring(1, { damping: 12, stiffness: 220 });
        onPressOut?.(event);
      }}
      style={[animatedStyle, style]}>
      {children}
    </AnimatedPressable>
  );
}