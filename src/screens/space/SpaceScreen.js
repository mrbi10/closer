import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { getSpaceMembers } from '../../services/spaceService';
import useSpaceStore from '../../store/useSpaceStore';
import { extractErrorMessage } from '../../utils/errorHandler';
import { theme } from '../../utils/theme';

export default function SpaceScreen({ route, navigation }) {
  const routeSpaceId = route.params?.spaceId;
  const routeSpaceName = route.params?.spaceName;

  const currentSpace = useSpaceStore(state => state.currentSpace);

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberError, setMemberError] = useState('');

  const spaceId = currentSpace?._id || currentSpace?.id || routeSpaceId;
  const spaceName = currentSpace?.name || routeSpaceName || 'Space';

  const canOpenChat = Boolean(spaceId);

  useEffect(() => {
    navigation.setOptions({ title: spaceName });
  }, [navigation, spaceName]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!spaceId) {
        return;
      }

      setMemberError('');
      setLoadingMembers(true);
      try {
        const data = await getSpaceMembers(spaceId);
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data?.members)
            ? data.members
            : Array.isArray(data?.data)
              ? data.data
              : [];
        setMembers(normalized);
      } catch (error) {
        setMemberError(extractErrorMessage(error, 'Unable to load members right now.'));
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [spaceId]);

  return (
    <ScreenContainer centered>
      <View style={styles.card}>
        <Text style={styles.label}>Space</Text>
        <Text style={styles.name}>{spaceName}</Text>

        <TouchableOpacity
          style={[styles.button, !canOpenChat && styles.buttonDisabled]}
          activeOpacity={0.85}
          disabled={!canOpenChat}
          onPress={() => navigation.navigate('Chat', { spaceId, spaceName })}>
          <Text style={styles.buttonText}>Open Chat</Text>
        </TouchableOpacity>

        <Text style={styles.membersTitle}>Members</Text>
        {loadingMembers ? (
          <View style={styles.membersLoadingRow}>
            <ActivityIndicator color={theme.colors.accent} size="small" />
          </View>
        ) : (
          <View style={styles.memberList}>
            {members.length === 0 ? (
              <Text style={styles.memberItem}>No members found.</Text>
            ) : (
              members.slice(0, 6).map(member => (
                <View key={String(member?.id || `${member?.user_id}-${member?.email}`)} style={styles.memberRow}>
                  <Text style={styles.memberItem}>{member?.name || member?.email || 'Member'}</Text>
                  <Text style={styles.memberRole}>{member?.role || 'member'}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {!!memberError && <Text style={styles.error}>{memberError}</Text>}

        {!canOpenChat && (
          <Text style={styles.helperText}>Please pick a space from Home before opening chat.</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 20,
    backgroundColor: theme.colors.inputBackground,
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  label: {
    color: theme.colors.text,
    opacity: 0.75,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  name: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  helperText: {
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 12,
    lineHeight: 20,
  },
  membersTitle: {
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 16,
  },
  membersLoadingRow: {
    paddingVertical: 10,
  },
  memberList: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.background,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberItem: {
    color: theme.colors.text,
    opacity: 0.9,
    flex: 1,
    paddingRight: 8,
  },
  memberRole: {
    color: theme.colors.accent,
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '700',
  },
  error: {
    color: theme.colors.danger,
    marginTop: 10,
  },
});
