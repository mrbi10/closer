import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import useAuthStore from '../../store/useAuthStore';
import { extractErrorMessage } from '../../utils/errorHandler';
import { theme } from '../../utils/theme';

export default function LoginScreen({ navigation }) {
  const login = useAuthStore(state => state.login);
  const loading = useAuthStore(state => state.loading);
  const storeError = useAuthStore(state => state.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter email and password.');
      return;
    }

    setLocalError('');
    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      setLocalError(extractErrorMessage(error, 'Unable to login right now.'));
    }
  };

  return (
    <ScreenContainer centered>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Closer</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#8AA1C2"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#8AA1C2"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {!!(localError || storeError) && <Text style={styles.error}>{localError || storeError}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
          onPress={handleLogin}>
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.85,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    marginTop: 18,
    textAlign: 'center',
    color: theme.colors.accent,
    fontWeight: '600',
  },
  error: {
    color: theme.colors.danger,
    marginBottom: 8,
  },
});
