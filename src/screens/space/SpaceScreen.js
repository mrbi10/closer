import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Vibration } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import PressableScale from '../../components/PressableScale';
import SkeletonBlock from '../../components/SkeletonBlock';
import { getItemsBySpace } from '../../services/itemService';
import { getSpaceMembers } from '../../services/spaceService';
import useGoalStore from '../../store/useGoalStore';
import useSpaceStore from '../../store/useSpaceStore';
import useThemeStore from '../../store/useThemeStore';
import { extractErrorMessage } from '../../utils/errorHandler';
import { resolveTheme } from '../../utils/theme';

const initials = name =>
  String(name || 'M')
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function SpaceScreen({ route, navigation }) {
  const routeSpaceId = route.params?.spaceId;
  const routeSpaceName = route.params?.spaceName;
  const currentSpace = useSpaceStore(state => state.currentSpace);
  const refreshGoals = useGoalStore(state => state.refreshGoals);
  const goals = useGoalStore(state => state.goals);
  const toggleGoal = useGoalStore(state => state.toggleGoal);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);

  const [members, setMembers] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const spaceId = currentSpace?._id || currentSpace?.id || routeSpaceId;
  const spaceName = currentSpace?.name || routeSpaceName || 'Space';

  const allChecked = checklist.length > 0 && checklist.every(item => item.done);

  const loadSpace = async () => {
    if (!spaceId) {
      setMembers([]);
      setChecklist([]);
      setLoading(false);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const [memberData, itemData] = await Promise.all([getSpaceMembers(spaceId), getItemsBySpace(spaceId), refreshGoals()]);
      const nextMembers = Array.isArray(memberData)
        ? memberData
        : Array.isArray(memberData?.members)
          ? memberData.members
          : Array.isArray(memberData?.data)
            ? memberData.data
            : [];
      const nextChecklist = Array.isArray(itemData)
        ? itemData
        : Array.isArray(itemData?.items)
          ? itemData.items
          : Array.isArray(itemData?.data?.items)
            ? itemData.data.items
            : Array.isArray(itemData?.data)
              ? itemData.data
              : [];
      setMembers(nextMembers);
      setChecklist(nextChecklist.map(item => ({ ...item, done: Boolean(item?.done || item?.completed || item?.checked) })));
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load space right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions?.({ title: spaceName });
    loadSpace().catch(() => {});
  }, [navigation, spaceName, spaceId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSpace();
    } finally {
      setRefreshing(false);
    }
  };

  const memberChips = useMemo(() => members.slice(0, 6), [members]);

  const toggleChecklistItem = index => {
    Vibration.vibrate(8);
    setChecklist(prev => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, done: !item.done } : item)));
  };

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={appTheme.colors.accent} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
          <Text style={[styles.kicker, { color: appTheme.colors.muted }]}>Shared world</Text>
          <Text style={[styles.title, { color: appTheme.colors.text }]}>{spaceName}</Text>
          <Text style={[styles.subtitle, { color: appTheme.colors.muted }]}>Members, chat, goals, and the checklist live here.</Text>
          <PressableScale onPress={() => navigation.navigate('Chat', { spaceId, spaceName })} style={[styles.primaryButton, { backgroundColor: appTheme.colors.accent }]}>
            <Text style={styles.primaryButtonText}>Open chat</Text>
          </PressableScale>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Members</Text>
            <Text style={[styles.sectionHint, { color: appTheme.colors.muted }]}>{members.length}</Text>
          </View>
          <View style={styles.memberWrap}>
            {loading ? (
              <SkeletonBlock style={styles.skeletonRow} />
            ) : memberChips.length > 0 ? (
              memberChips.map(member => {
                const name = member?.name || member?.email || 'Member';
                return (
                  <View key={String(member?.id || member?.user_id || name)} style={[styles.memberChip, { backgroundColor: appTheme.colors.chip }]}>
                    <View style={[styles.avatar, { backgroundColor: appTheme.colors.accent }]}>
                      <Text style={styles.avatarText}>{initials(name)}</Text>
                    </View>
                    <Text style={[styles.memberName, { color: appTheme.colors.text }]}>{name}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={[styles.emptyText, { color: appTheme.colors.muted }]}>No members found yet.</Text>
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Shared goals</Text>
            <Text style={[styles.sectionHint, { color: appTheme.colors.muted }]}>Fitness + savings</Text>
          </View>
          {goals.length === 0 ? (
            <SkeletonBlock style={styles.skeletonTall} />
          ) : (
            goals.slice(0, 2).map(goal => {
              const goalId = goal?.id || goal?._id;
              const done = Boolean(goal?.done || goal?.completed);
              return (
                <PressableScale
                  key={String(goalId)}
                  onPress={() => toggleGoal(goal).catch(() => {})}
                  style={[styles.goalRow, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
                  <View style={[styles.goalDot, { backgroundColor: done ? appTheme.colors.success : appTheme.colors.warning }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalTitle, { color: appTheme.colors.text }]}>{goal?.title || goal?.name || 'Goal'}</Text>
                    <Text style={[styles.goalMeta, { color: appTheme.colors.muted }]}>{done ? 'Completed' : 'In progress'}</Text>
                  </View>
                  <Text style={[styles.goalState, { color: done ? appTheme.colors.success : appTheme.colors.accent }]}>{done ? 'Done' : 'Open'}</Text>
                </PressableScale>
              );
            })
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Checklist</Text>
            <Text style={[styles.sectionHint, { color: appTheme.colors.muted }]}>{allChecked ? 'All set ✅' : 'Before leaving home'}</Text>
          </View>
          {checklist.length === 0 ? (
            <SkeletonBlock style={styles.skeletonTall} />
          ) : (
            checklist.map((item, index) => (
              <PressableScale
                key={String(item?.id || item?._id || index)}
                onPress={() => toggleChecklistItem(index)}
                style={[styles.checklistRow, { backgroundColor: item.done ? 'rgba(34,197,94,0.12)' : appTheme.colors.background, borderColor: appTheme.colors.border }]}>
                <View>
                  <Text style={[styles.checklistTitle, { color: appTheme.colors.text }]}>{item?.title || item?.name || item?.label || 'Checklist item'}</Text>
                  <Text style={[styles.goalMeta, { color: appTheme.colors.muted }]}>{item.done ? 'Checked' : 'Tap to complete'}</Text>
                </View>
                <Text style={[styles.toggleMark, { color: item.done ? appTheme.colors.success : appTheme.colors.muted }]}>{item.done ? 'ON' : 'OFF'}</Text>
              </PressableScale>
            ))
          )}
          {allChecked && <Text style={[styles.successBanner, { color: appTheme.colors.success }]}>All set ✅</Text>}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>Chat</Text>
            <PressableScale onPress={() => navigation.navigate('Chat', { spaceId, spaceName })}>
              <Text style={[styles.link, { color: appTheme.colors.accent }]}>Continue conversation</Text>
            </PressableScale>
          </View>
          <Text style={[styles.sectionHint, { color: appTheme.colors.muted }]}>Rounded bubbles, timestamps, and quick replies.</Text>
        </View>

        {!!error && <Text style={[styles.error, { color: appTheme.colors.danger }]}>{error}</Text>}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sectionCard: {
    marginBottom: 16,
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
  memberWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  memberName: {
    fontWeight: '700',
  },
  emptyText: {
    lineHeight: 20,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  goalDot: {
    width: 12,
    height: 12,
    borderRadius: 99,
  },
  goalTitle: {
    fontWeight: '800',
  },
  goalMeta: {
    marginTop: 3,
    fontSize: 12,
  },
  goalState: {
    fontWeight: '800',
  },
  checklistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  checklistTitle: {
    fontWeight: '800',
  },
  toggleMark: {
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  successBanner: {
    marginTop: 6,
    fontWeight: '800',
  },
  link: {
    fontWeight: '800',
  },
  error: {
    marginTop: 8,
  },
  skeletonRow: {
    height: 52,
    width: '100%',
  },
  skeletonTall: {
    height: 120,
  },
});