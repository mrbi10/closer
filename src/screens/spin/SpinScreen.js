import React, { useEffect, useMemo, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Modal, StyleSheet, Text, View, Vibration } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ScreenContainer from '../../components/ScreenContainer';
import PressableScale from '../../components/PressableScale';
import useSpaceStore from '../../store/useSpaceStore';
import useThemeStore from '../../store/useThemeStore';
import { getSpinPrompts, recordSpinResult } from '../../services/spinService';
import { resolveTheme } from '../../utils/theme';

const categories = [
  { label: 'fun', color: '#3B82F6' },
  { label: 'romance', color: '#EC4899' },
  { label: 'fitness', color: '#22C55E' },
  { label: 'finance', color: '#F59E0B' },
];

const fallbackPrompts = [
  'Do a 10-min workout together',
  'Plan a budget check-in',
  'Send one appreciation message',
  'Share a future date idea',
];

export default function SpinScreen() {
  const currentSpace = useSpaceStore(state => state.currentSpace);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);
  const rotation = useSharedValue(0);

  const [prompts, setPrompts] = useState(fallbackPrompts);
  const [result, setResult] = useState('');
  const [resultOpen, setResultOpen] = useState(false);

  useEffect(() => {
    getSpinPrompts()
      .then(payload => {
        const next = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.prompts)
            ? payload.prompts
            : Array.isArray(payload?.data)
              ? payload.data
              : fallbackPrompts;
        setPrompts(next.length > 0 ? next : fallbackPrompts);
      })
      .catch(() => {});
  }, []);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  const spin = () => {
    const nextRotation = rotation.value + 720 + Math.random() * 360;
    rotation.value = withTiming(nextRotation, { duration: 1200 }, finished => {
      if (finished) {
        const chosen = prompts[Math.floor(Math.random() * prompts.length)] || fallbackPrompts[0];
        runOnJS(setResult)(chosen);
        runOnJS(setResultOpen)(true);
      }
    });
    Vibration.vibrate(12);
  };

  const pan = useMemo(
    () =>
      Gesture.Pan().onEnd(event => {
        if (Math.abs(event.velocityX) + Math.abs(event.velocityY) > 120) {
          runOnJS(spin)();
        }
      }),
    [prompts],
  );

  const tap = useMemo(() => Gesture.Tap().onEnd(() => runOnJS(spin)()), [prompts]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: appTheme.colors.text }]}>Spin</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.muted }]}>{currentSpace ? currentSpace.name : 'Pick a space first'}</Text>
      </View>

      <GestureDetector gesture={Gesture.Simultaneous(pan, tap)}>
        <Animated.View style={[styles.wheel, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }, wheelStyle]}>
          {categories.map((category, index) => (
            <View key={category.label} style={[styles.segment, { transform: [{ rotate: `${index * 90}deg` }] }]}>
              <Text style={[styles.segmentText, { color: category.color }]}>{category.label}</Text>
            </View>
          ))}
        </Animated.View>
      </GestureDetector>

      <Text style={[styles.tip, { color: appTheme.colors.muted }]}>Drag or tap the wheel to spin.</Text>

      <PressableScale onPress={spin} style={[styles.spinButton, { backgroundColor: appTheme.colors.accent }]}>
        <Text style={styles.spinButtonText}>Spin now</Text>
      </PressableScale>

      <Modal visible={resultOpen} transparent animationType="fade" onRequestClose={() => setResultOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
            <Text style={[styles.modalLabel, { color: appTheme.colors.muted }]}>Result</Text>
            <Text style={[styles.result, { color: appTheme.colors.text }]}>{result}</Text>
            <View style={styles.actionRow}>
              <PressableScale onPress={() => setResultOpen(false)} style={[styles.secondaryButton, { backgroundColor: appTheme.colors.chip }]}>
                <Text style={[styles.secondaryText, { color: appTheme.colors.text }]}>Skip</Text>
              </PressableScale>
              <PressableScale
                onPress={() => {
                  recordSpinResult({ spaceId: currentSpace?._id || currentSpace?.id, result }).catch(() => {});
                  setResultOpen(false);
                }}
                style={[styles.primaryButton, { backgroundColor: appTheme.colors.success }]}>
                <Text style={styles.primaryText}>Accept</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
  },
  wheel: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  segment: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 18,
  },
  segmentText: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tip: {
    textAlign: 'center',
    marginBottom: 16,
  },
  spinButton: {
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 18,
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  modalLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 12,
  },
  result: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: {
    fontWeight: '800',
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});