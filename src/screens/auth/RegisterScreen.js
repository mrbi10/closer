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
import { registerUser } from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';
import { extractErrorMessage } from '../../utils/errorHandler';
import useThemeStore from '../../store/useThemeStore';
import { resolveTheme } from '../../utils/theme';

export default function RegisterScreen() {
  const login = useAuthStore(state => state.login);
  const authLoading = useAuthStore(state => state.loading);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill all fields.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await registerUser({ name: name.trim(), email: email.trim(), password });
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to create account. Please retry.'));
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || authLoading;

  return (
    <ScreenContainer centered>
      <View style={styles.wrapper}>
        <Text style={[styles.title, { color: appTheme.colors.text }]}>Create Account</Text>

        <TextInput
          placeholder="Name"
          placeholderTextColor={appTheme.colors.muted}
          style={[styles.input, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border, color: appTheme.colors.text }]}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={appTheme.colors.muted}
          style={[styles.input, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border, color: appTheme.colors.text }]}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={appTheme.colors.muted}
          style={[styles.input, { backgroundColor: appTheme.colors.surface, borderColor: appTheme.colors.border, color: appTheme.colors.text }]}
          value={password}
          onChangeText={setPassword}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: appTheme.colors.accent }, disabled && styles.buttonDisabled]}
          disabled={disabled}
          onPress={handleRegister}>
          {disabled ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
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
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  button: {
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#EF4444',
    marginBottom: 8,
  },
});
