import React, { useEffect, useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import PressableScale from '../../components/PressableScale';
import useNotificationStore from '../../store/useNotificationStore';
import useThemeStore from '../../store/useThemeStore';
import { resolveTheme } from '../../utils/theme';

export default function NotificationsScreen({ navigation }) {
  const notifications = useNotificationStore(state => state.notifications);
  const refreshNotifications = useNotificationStore(state => state.refreshNotifications);
  const markRead = useNotificationStore(state => state.markRead);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  useEffect(() => {
    refreshNotifications().catch(() => {});
  }, [refreshNotifications]);

  const sections = useMemo(() => {
    const grouped = notifications.reduce((accumulator, item) => {
      const stamp = item?.created_at || item?.createdAt || item?.timestamp || Date.now();
      const date = new Date(stamp).toDateString();
      if (!accumulator[date]) {
        accumulator[date] = [];
      }
      accumulator[date].push(item);
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [notifications]);

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: appTheme.colors.text }]}>Notifications</Text>
      <Text style={[styles.subtitle, { color: appTheme.colors.muted }]}>Grouped by day and tied to the relevant space.</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => String(item?.id || item?._id || index)}
        renderSectionHeader={({ section }) => <Text style={[styles.sectionHeader, { color: appTheme.colors.muted }]}>{section.title}</Text>}
        renderItem={({ item }) => (
          <PressableScale
            onPress={async () => {
              await markRead(String(item?.id || item?._id)).catch(() => {});
              if (item?.spaceId) {
                navigation.navigate('Space', { spaceId: item.spaceId, spaceName: item.spaceName || 'Space' });
              }
            }}
            style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: appTheme.colors.text }]}>{item?.title || item?.message || item?.body || 'Notification'}</Text>
            <Text style={[styles.cardBody, { color: appTheme.colors.muted }]}>{item?.message || item?.body || item?.description || 'Tap to open.'}</Text>
          </PressableScale>
        )}
        ListEmptyComponent={<View style={styles.emptyState}><Text style={[styles.emptyText, { color: appTheme.colors.muted }]}>No notifications yet.</Text></View>}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
  },
  content: {
    paddingBottom: 24,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '800',
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  cardBody: {
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});