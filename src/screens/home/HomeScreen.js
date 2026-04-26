import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Vibration } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ScreenContainer from '../../components/ScreenContainer';
import SkeletonBlock from '../../components/SkeletonBlock';
import PressableScale from '../../components/PressableScale';
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';
import useSpaceStore from '../../store/useSpaceStore';
import useThemeStore from '../../store/useThemeStore';
import useXPStore from '../../store/useXPStore';
import { resolveTheme } from '../../utils/theme';

const AnimatedView = Animated.View;

const quickActions = [
  { label: 'Log Workout', route: 'Activity' },
  { label: 'Spin Now', route: 'Spin' },
  { label: 'Check-in', action: 'checkin' },
];

export default function HomeScreen({ navigation }) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const spaces = useSpaceStore(state => state.spaces);
  const currentSpace = useSpaceStore(state => state.currentSpace);
  const fetchSpaces = useSpaceStore(state => state.fetchSpaces);
  const setCurrentSpace = useSpaceStore(state => state.setCurrentSpace);
  const refreshXP = useXPStore(state => state.refreshXP);
  const totalXp = useXPStore(state => state.totalXp);
  const levelTitle = useXPStore(state => state.levelTitle);
  const currentStreak = useXPStore(state => state.currentStreak);
  const todayProgress = useXPStore(state => state.todayProgress);
  const awardPoints = useXPStore(state => state.awardPoints);
  const submitCheckIn = useXPStore(state => state.submitCheckIn);
  const refreshNotifications = useNotificationStore(state => state.refreshNotifications);
  const notifications = useNotificationStore(state => state.notifications);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  const [refreshing, setRefreshing] = useState(false);
  const [checkInState, setCheckInState] = useState('');
  const [rewardText, setRewardText] = useState('');
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(Math.max(0.12, Math.min(1, todayProgress || 0.12)), { duration: 900 });
  }, [fill, todayProgress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.round(fill.value * 100)}%`,
  }));

  const activeSpace = useMemo(() => currentSpace || spaces[0] || null, [currentSpace, spaces]);
  const notificationsPreview = notifications.slice(0, 3);

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchSpaces(), refreshXP(), refreshNotifications()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAll().catch(() => {});
  }, []);

  const handleCheckIn = async status => {
    setCheckInState(status);
    Vibration.vibrate(12);

    try {
      await submitCheckIn({ status, spaceId: activeSpace?._id || activeSpace?.id });
      const reward = await awardPoints({ source: 'check_in', xp: 10, status });
      setRewardText(`+${reward?.xp || 10} XP`);
      setTimeout(() => setRewardText(''), 1500);
    } catch {
      setRewardText('');
    }
  };

  const spaceName = activeSpace?.name || 'Your Space';

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} tintColor={appTheme.colors.accent} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.kicker, { color: appTheme.colors.muted }]}>Shared life dashboard</Text>
            <Text style={[styles.title, { color: appTheme.colors.text }]}>{spaceName}</Text>
            <Text style={[styles.subtitle, { color: appTheme.colors.muted }]}>{levelTitle}</Text>
          </View>
          <PressableScale onPress={() => logout().catch(() => {})} style={[styles.pill, { backgroundColor: appTheme.colors.chip }]}>
            <Text style={[styles.pillText, { color: appTheme.colors.accent }]}>Logout</Text>
          </PressableScale>
        </View>

        <View style={[styles.heroCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.heroLabel, { color: appTheme.colors.muted }]}>Current streak</Text>
              <Text style={[styles.heroValue, { color: appTheme.colors.text }]}>{currentStreak} days 🔥</Text>
            </View>
            <Text style={[styles.badge, { backgroundColor: appTheme.colors.chip, color: appTheme.colors.accent }]}>Strong Bond</Text>
          </View>

          <View style={[styles.progressShell, { backgroundColor: appTheme.colors.elevated }]}>
            <AnimatedView style={[styles.progressFill, progressStyle, { backgroundColor: appTheme.colors.accent }]} />
          </View>
          <Text style={[styles.progressMeta, { color: appTheme.colors.muted }]}>Today {Math.round(Math.max(0, Math.min(1, todayProgress || 0)) * 100)}% complete</Text>

          <View style={styles.metricRow}>
            <View style={[styles.metricCard, { backgroundColor: appTheme.colors.background, borderColor: appTheme.colors.border }]}>
              <Text style={[styles.metricValue, { color: appTheme.colors.text }]}>{totalXp}</Text>
              <Text style={[styles.metricLabel, { color: appTheme.colors.muted }]}>XP earned</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: appTheme.colors.background, borderColor: appTheme.colors.border }]}>
              <Text style={[styles.metricValue, { color: appTheme.colors.text }]}>{spaces.length}</Text>
              <Text style={[styles.metricLabel, { color: appTheme.colors.muted }]}>Spaces</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Quick actions</Text>
          <Text style={[styles.sectionHint, { color: appTheme.colors.muted }]}>No more than two taps</Text>
        </View>
        <View style={styles.actionRow}>
          {quickActions.map(action => (
            <PressableScale
              key={action.label}
              onPress={() => {
                if (action.route) {
                  navigation.navigate(action.route);
                } else {
                  handleCheckIn('yes');
                }
              }}
              style={[styles.actionButton, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <Text style={[styles.actionLabel, { color: appTheme.colors.text }]}>{action.label}</Text>
            </PressableScale>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Check-in</Text>
            {!!rewardText && <Text style={[styles.rewardText, { color: appTheme.colors.success }]}>{rewardText}</Text>}
          </View>
          <Text style={[styles.sectionHint, { color: appTheme.colors.muted }]}>Simple pulse to keep the shared rhythm alive.</Text>
          <View style={styles.checkinRow}>
            {['yes', 'no', 'skip'].map(option => (
              <PressableScale
                key={option}
                onPress={() => handleCheckIn(option)}
                style={[
                  styles.checkinButton,
                  { backgroundColor: option === 'yes' ? appTheme.colors.success : appTheme.colors.chip },
                ]}>
                <Text style={styles.checkinText}>{option.toUpperCase()}</Text>
              </PressableScale>
            ))}
          </View>
          {!!checkInState && <Text style={[styles.checkinState, { color: appTheme.colors.muted }]}>Last response: {checkInState}</Text>}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Notifications</Text>
            <PressableScale onPress={() => navigation.navigate('Notifications')}>
              <Text style={[styles.sectionLink, { color: appTheme.colors.accent }]}>View all</Text>
            </PressableScale>
          </View>
          {notificationsPreview.length === 0 ? (
            <SkeletonBlock style={styles.skeletonCard} />
          ) : (
            notificationsPreview.map(item => (
              <View key={String(item?.id || item?._id || item?.created_at)} style={styles.notificationRow}>
                <View style={[styles.notificationDot, { backgroundColor: item?.read || item?.isRead ? appTheme.colors.border : appTheme.colors.accent }]} />
                <Text style={[styles.notificationText, { color: appTheme.colors.text }]} numberOfLines={2}>
                  {item?.title || item?.message || item?.body || 'Notification'}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Current space</Text>
          <Text style={[styles.sectionHint, { color: appTheme.colors.muted }]}>{activeSpace ? activeSpace.name : 'Create or join a space to begin.'}</Text>
          <PressableScale
            onPress={() => activeSpace && navigation.navigate('Space', { spaceId: activeSpace._id || activeSpace.id, spaceName: activeSpace.name })}
            style={[styles.spaceButton, { backgroundColor: appTheme.colors.accent }]}>
            <Text style={styles.spaceButtonText}>{activeSpace ? 'Open space' : 'No active space'}</Text>
          </PressableScale>
          {!activeSpace && spaces.length === 0 && <SkeletonBlock style={styles.skeletonCard} />}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pillText: {
    fontWeight: '700',
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  progressShell: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressMeta: {
    marginTop: 8,
    fontSize: 12,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionHint: {
    fontSize: 12,
  },
  sectionLink: {
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionLabel: {
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  rewardText: {
    fontWeight: '800',
  },
  checkinRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  checkinButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkinText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  checkinState: {
    marginTop: 10,
    fontSize: 12,
  },
  notificationRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 5,
  },
  notificationText: {
    flex: 1,
    lineHeight: 20,
  },
  spaceButton: {
    marginTop: 14,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  skeletonCard: {
    height: 54,
    marginTop: 10,
  },
  bottomSpacer: {
    height: 18,
  },
});