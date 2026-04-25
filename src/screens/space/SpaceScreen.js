import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import useSpaceStore from '../../store/useSpaceStore';
import { theme } from '../../utils/theme';

export default function SpaceScreen({ route, navigation }) {
  const routeSpaceId = route.params?.spaceId;
  const routeSpaceName = route.params?.spaceName;

  const currentSpace = useSpaceStore(state => state.currentSpace);

  const spaceId = currentSpace?._id || currentSpace?.id || routeSpaceId;
  const spaceName = currentSpace?.name || routeSpaceName || 'Space';

  const canOpenChat = Boolean(spaceId);

  useEffect(() => {
    navigation.setOptions({ title: spaceName });
  }, [navigation, spaceName]);

  return (
    <ScreenContainer centered>
      <View style={styles.card}>
        <Text style={styles.label}>Space</Text>
        <Text style={styles.name}>{spaceName}</Text>

        <TouchableOpacity
          style={[styles.button, !canOpenChat && styles.buttonDisabled]}
          disabled={!canOpenChat}
          onPress={() => navigation.navigate('Chat', { spaceId, spaceName })}>
          <Text style={styles.buttonText}>Open Chat</Text>
        </TouchableOpacity>

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
    borderRadius: 12,
    padding: 18,
    backgroundColor: theme.colors.inputBackground,
  },
  label: {
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 6,
  },
  name: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 18,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    height: 46,
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
    marginTop: 10,
  },
});
