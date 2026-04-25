import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import useAuthStore from '../../store/useAuthStore';
import useSpaceStore from '../../store/useSpaceStore';
import { extractErrorMessage } from '../../utils/errorHandler';
import { theme } from '../../utils/theme';

export default function HomeScreen({ navigation }) {
  const logout = useAuthStore(state => state.logout);
  const authLoading = useAuthStore(state => state.loading);
  const spaces = useSpaceStore(state => state.spaces);
  const loading = useSpaceStore(state => state.loading);
  const error = useSpaceStore(state => state.error);
  const fetchSpaces = useSpaceStore(state => state.fetchSpaces);
  const createNewSpace = useSpaceStore(state => state.createNewSpace);
  const joinExistingSpace = useSpaceStore(state => state.joinExistingSpace);
  const setCurrentSpace = useSpaceStore(state => state.setCurrentSpace);

  const [spaceName, setSpaceName] = useState('');
  const [joinSpaceId, setJoinSpaceId] = useState('');
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    fetchSpaces().catch(() => {});
  }, [fetchSpaces]);

  const hasSpaces = useMemo(() => spaces.length > 0, [spaces]);

  const onCreateSpace = async () => {
    if (!spaceName.trim()) {
      setCreateError('Please provide a space name.');
      return;
    }

    setCreateError('');
    try {
      await createNewSpace({ name: spaceName.trim(), type: 'group' });
      setSpaceName('');
    } catch (err) {
      setCreateError(extractErrorMessage(err, 'Failed to create space. Please retry.'));
    }
  };

  const onJoinSpace = async () => {
    if (!joinSpaceId.trim()) {
      setJoinError('Please provide a space ID.');
      return;
    }

    setJoinError('');
    try {
      await joinExistingSpace(joinSpaceId.trim());
      setJoinSpaceId('');
    } catch (err) {
      setJoinError(extractErrorMessage(err, 'Failed to join space. Please retry.'));
    }
  };

  const renderSpace = ({ item }) => {
    const id = item?._id || item?.id;
    const name = item?.name || 'Untitled Space';
    const type = item?.type || 'space';

    return (
      <TouchableOpacity
        style={styles.spaceCard}
        activeOpacity={0.85}
        onPress={() => {
          setCurrentSpace(item);
          navigation.navigate('Space', { spaceId: id, spaceName: name });
        }}>
        <Text style={styles.spaceTitle}>{name}</Text>
        <View style={styles.spaceMetaRow}>
          <Text style={styles.spaceMeta}>{type}</Text>
          <Text style={styles.openLabel}>Open</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Your Spaces</Text>
          <Text style={styles.subHeading}>Create, join, and open your shared spaces</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={authLoading || loading}
          onPress={() => logout().catch(() => {})}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Create Space</Text>
        <TextInput
          placeholder="New space name"
          placeholderTextColor="#8AA1C2"
          style={styles.input}
          value={spaceName}
          onChangeText={setSpaceName}
          returnKeyType="done"
          onSubmitEditing={onCreateSpace}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={onCreateSpace}>
          {loading ? <ActivityIndicator color={theme.colors.text} /> : <Text style={styles.buttonText}>Create Space</Text>}
        </TouchableOpacity>
        {!!createError && <Text style={styles.error}>{createError}</Text>}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Join Space</Text>
        <TextInput
          placeholder="Enter space ID to join"
          placeholderTextColor="#8AA1C2"
          style={styles.input}
          value={joinSpaceId}
          onChangeText={setJoinSpaceId}
          returnKeyType="done"
          onSubmitEditing={onJoinSpace}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={onJoinSpace}>
          <Text style={styles.buttonText}>Join Space</Text>
        </TouchableOpacity>
        {!!joinError && <Text style={styles.error}>{joinError}</Text>}
      </View>

      {loading && !hasSpaces ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      ) : (
        <FlatList
          data={spaces}
          keyExtractor={(item, index) => String(item?._id || item?.id || index)}
          renderItem={renderSpace}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchSpaces().catch(() => {})}
              tintColor={theme.colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.centeredState}>
              <Text style={styles.emptyText}>No spaces yet. Create your first one.</Text>
            </View>
          }
        />
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heading: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subHeading: {
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 2,
    fontSize: 13,
  },
  logout: {
    color: theme.colors.accent,
    fontWeight: '700',
    paddingVertical: 6,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.inputBackground,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: 10,
    fontSize: 15,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 28,
  },
  spaceCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  spaceTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  spaceMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spaceMeta: {
    color: theme.colors.text,
    opacity: 0.85,
    textTransform: 'capitalize',
    fontSize: 13,
  },
  openLabel: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: theme.colors.text,
    opacity: 0.85,
  },
  error: {
    color: theme.colors.danger,
    marginTop: 10,
  },
});
