import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Vibration,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import PressableScale from '../../components/PressableScale';
import SkeletonBlock from '../../components/SkeletonBlock';
import useActivityStore from '../../store/useActivityStore';
import useThemeStore from '../../store/useThemeStore';
import useXPStore from '../../store/useXPStore';
import { resolveTheme } from '../../utils/theme';

const activityCards = [
  { key: 'steps', icon: '👟', label: 'Steps' },
  { key: 'workoutMinutes', icon: '💪', label: 'Workout' },
  { key: 'sleepHours', icon: '🌙', label: 'Sleep' },
  { key: 'financeCheck', icon: '💳', label: 'Finance' },
];

const quickValues = ['10 min', '20 min', '30 min'];

export default function ActivityScreen() {
  const fetchActivityFeed = useActivityStore(state => state.fetchActivityFeed);
  const logTodayActivity = useActivityStore(state => state.logTodayActivity);
  const today = useActivityStore(state => state.today);
  const history = useActivityStore(state => state.history);
  const loading = useActivityStore(state => state.loading);
  const error = useActivityStore(state => state.error);
  const awardPoints = useXPStore(state => state.awardPoints);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [manualValue, setManualValue] = useState('');

  useEffect(() => {
    fetchActivityFeed().catch(() => {});
  }, [fetchActivityFeed]);

  const sections = useMemo(() => {
    const grouped = history.reduce((accumulator, item) => {
      const date = new Date(item?.created_at || item?.createdAt || Date.now()).toDateString();
      if (!accumulator[date]) {
        accumulator[date] = [];
      }
      accumulator[date].push(item);
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [history]);

  const openActivityModal = activity => {
    setSelectedActivity(activity);
    setManualValue('');
    setModalOpen(true);
  };

  const handleLog = async amount => {
    if (!selectedActivity) {
      return;
    }

    const value = amount || manualValue || 'done';
    Vibration.vibrate(8);
    await logTodayActivity({ type: selectedActivity.key, value });
    await awardPoints({ source: selectedActivity.key, xp: 10, value });
    setModalOpen(false);
    fetchActivityFeed().catch(() => {});
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetchActivityFeed();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={appTheme.colors.accent} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: appTheme.colors.text }]}>Activity</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.muted }]}>One tap to log, one glance to understand the day.</Text>

        <View style={styles.grid}>
          {activityCards.map(card => (
            <PressableScale
              key={card.key}
              onPress={() => openActivityModal(card)}
              style={[styles.card, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={[styles.cardLabel, { color: appTheme.colors.text }]}>{card.label}</Text>
              <Text style={[styles.cardValue, { color: appTheme.colors.muted }]}>{today?.[card.key] ?? 0}</Text>
              <Text style={[styles.cardAction, { color: appTheme.colors.accent }]}>Mark complete</Text>
            </PressableScale>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Today’s activity</Text>
          {loading ? (
            <SkeletonBlock style={styles.skeleton} />
          ) : (
            activityCards.map(card => (
              <View key={card.key} style={[styles.summaryRow, { borderBottomColor: appTheme.colors.border }]}>
                <Text style={styles.summaryIcon}>{card.icon}</Text>
                <Text style={[styles.summaryLabel, { color: appTheme.colors.text }]}>{card.label}</Text>
                <Text style={[styles.summaryValue, { color: appTheme.colors.accent }]}>{String(today?.[card.key] ?? 0)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>History</Text>
          {sections.length === 0 ? (
            <Text style={[styles.emptyText, { color: appTheme.colors.muted }]}>No activity logged yet.</Text>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item, index) => String(item?.id || item?._id || index)}
              renderSectionHeader={({ section }) => (
                <Text style={[styles.sectionHeader, { color: appTheme.colors.muted }]}>{section.title}</Text>
              )}
              renderItem={({ item }) => (
                <View style={styles.historyRow}>
                  <Text style={[styles.historyText, { color: appTheme.colors.text }]}>{item?.type || item?.label || 'Activity'}</Text>
                  <Text style={[styles.historyMeta, { color: appTheme.colors.muted }]}>{item?.value || item?.status || 'done'}</Text>
                </View>
              )}
            />
          )}
        </View>

        {!!error && <Text style={[styles.error, { color: appTheme.colors.danger }]}>{error}</Text>}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: appTheme.colors.text }]}>{selectedActivity?.label || 'Log activity'}</Text>
            <Text style={[styles.modalHint, { color: appTheme.colors.muted }]}>Quick-select, or type a short note.</Text>
            <View style={styles.quickRow}>
              {quickValues.map(value => (
                <PressableScale key={value} onPress={() => handleLog(value)} style={[styles.quickButton, { backgroundColor: appTheme.colors.chip }]}>
                  <Text style={[styles.quickText, { color: appTheme.colors.accent }]}>{value}</Text>
                </PressableScale>
              ))}
            </View>
            <TextInput
              placeholder="Optional note"
              placeholderTextColor={appTheme.colors.muted}
              value={manualValue}
              onChangeText={setManualValue}
              style={[styles.input, { backgroundColor: appTheme.colors.background, borderColor: appTheme.colors.border, color: appTheme.colors.text }]}
            />
            <View style={styles.modalActions}>
              <PressableScale onPress={() => setModalOpen(false)} style={[styles.secondaryButton, { backgroundColor: appTheme.colors.chip }]}>
                <Text style={[styles.secondaryText, { color: appTheme.colors.text }]}>Cancel</Text>
              </PressableScale>
              <PressableScale onPress={() => handleLog(manualValue || 'done')} style={[styles.primaryButton, { backgroundColor: appTheme.colors.accent }]}>
                <Text style={styles.primaryText}>Save</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 6,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardLabel: {
    marginTop: 14,
    fontWeight: '800',
    fontSize: 16,
  },
  cardValue: {
    marginTop: 4,
    fontSize: 12,
  },
  cardAction: {
    marginTop: 12,
    fontWeight: '800',
    fontSize: 12,
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
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  summaryIcon: {
    width: 28,
    fontSize: 18,
  },
  summaryLabel: {
    flex: 1,
    fontWeight: '700',
  },
  summaryValue: {
    fontWeight: '800',
  },
  skeleton: {
    height: 130,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  historyText: {
    fontWeight: '700',
  },
  historyMeta: {
    fontSize: 12,
  },
  error: {
    marginTop: 4,
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
    padding: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalHint: {
    marginTop: 4,
    marginBottom: 14,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  quickButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickText: {
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryText: {
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});