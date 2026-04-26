import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Vibration } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import PressableScale from '../../components/PressableScale';
import useAuthStore from '../../store/useAuthStore';
import useNotificationStore from '../../store/useNotificationStore';
import useSpaceStore from '../../store/useSpaceStore';
import useThemeStore from '../../store/useThemeStore';
import useXPStore from '../../store/useXPStore';
import { resolveTheme } from '../../utils/theme';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const refreshXP = useXPStore(state => state.refreshXP);
  const totalXp = useXPStore(state => state.totalXp);
  const level = useXPStore(state => state.level);
  const currentStreak = useXPStore(state => state.currentStreak);
  const refreshNotifications = useNotificationStore(state => state.refreshNotifications);
  const notifications = useNotificationStore(state => state.notifications);
  const refreshSpaces = useSpaceStore(state => state.fetchSpaces);
  const spaces = useSpaceStore(state => state.spaces);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const appTheme = resolveTheme(isDarkMode);

  useEffect(() => {
    refreshXP().catch(() => {});
    refreshNotifications().catch(() => {});
    refreshSpaces().catch(() => {});
  }, []);

  const refresh = async () => {
    await Promise.all([refreshXP(), refreshNotifications(), refreshSpaces()]);
  };

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={appTheme.colors.accent} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: appTheme.colors.text }]}>Profile</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.muted }]}>{user?.name || user?.email || 'Closer user'}</Text>

        <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>User info</Text>
          <Text style={[styles.rowText, { color: appTheme.colors.text }]}>{user?.email || 'No email'}</Text>
          <Text style={[styles.rowText, { color: appTheme.colors.muted }]}>Level {level}</Text>
        </View>

        <View style={[styles.statsRow, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: appTheme.colors.text }]}>{totalXp}</Text>
            <Text style={[styles.statLabel, { color: appTheme.colors.muted }]}>Total XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: appTheme.colors.text }]}>{currentStreak}</Text>
            <Text style={[styles.statLabel, { color: appTheme.colors.muted }]}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: appTheme.colors.text }]}>{spaces.length}</Text>
            <Text style={[styles.statLabel, { color: appTheme.colors.muted }]}>Spaces</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Contribution stats</Text>
          <Text style={[styles.rowText, { color: appTheme.colors.text }]}>{notifications.length} notifications handled</Text>
          <Text style={[styles.rowText, { color: appTheme.colors.muted }]}>Space-based activity, streaks, and XP all roll up here.</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Settings</Text>
          <PressableScale
            onPress={() => {
              Vibration.vibrate(8);
              toggleTheme().catch(() => {});
            }}
            style={[styles.settingRow, { backgroundColor: appTheme.colors.chip }]}>
            <Text style={[styles.rowText, { color: appTheme.colors.text }]}>Theme</Text>
            <Text style={[styles.toggleLabel, { color: appTheme.colors.accent }]}>{isDarkMode ? 'Dark' : 'Light'}</Text>
          </PressableScale>
          <PressableScale onPress={() => logout().catch(() => {})} style={[styles.settingRow, { backgroundColor: appTheme.colors.chip }]}>
            <Text style={[styles.rowText, { color: appTheme.colors.text }]}>Logout</Text>
            <Text style={[styles.toggleLabel, { color: appTheme.colors.danger }]}>Exit</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 10,
  },
  rowText: {
    lineHeight: 20,
  },
  statsRow: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  settingRow: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleLabel: {
    fontWeight: '800',
  },
});