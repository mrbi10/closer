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
  const setCurrentSpace = useSpaceStore(state => state.setCurrentSpace);

  const [spaceName, setSpaceName] = useState('');
  const [createError, setCreateError] = useState('');

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
      await createNewSpace({ name: spaceName.trim() });
      setSpaceName('');
    } catch (err) {
      setCreateError(extractErrorMessage(err, 'Failed to create space. Please retry.'));
    }
  };

  const renderSpace = ({ item }) => {
    const id = item?._id || item?.id;
    const name = item?.name || 'Untitled Space';

    return (
      <TouchableOpacity
        style={styles.spaceCard}
        onPress={() => {
          setCurrentSpace(item);
          navigation.navigate('Space', { spaceId: id, spaceName: name });
        }}>
        <Text style={styles.spaceTitle}>{name}</Text>
        <Text style={styles.spaceMeta}>{item?.type || 'space'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Your Spaces</Text>
        <TouchableOpacity disabled={authLoading || loading} onPress={() => logout().catch(() => {})}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.createSection}>
        <TextInput
          placeholder="New space name"
          placeholderTextColor="#8AA1C2"
          style={styles.input}
          value={spaceName}
          onChangeText={setSpaceName}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
          onPress={onCreateSpace}>
          {loading ? <ActivityIndicator color={theme.colors.text} /> : <Text style={styles.buttonText}>Create Space</Text>}
        </TouchableOpacity>
        {!!createError && <Text style={styles.error}>{createError}</Text>}
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
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  logout: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  createSection: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    height: 44,
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
    paddingBottom: 24,
  },
  spaceCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  spaceTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  spaceMeta: {
    color: theme.colors.text,
    opacity: 0.8,
    marginTop: 4,
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
