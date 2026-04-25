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
import { theme } from '../../utils/theme';

export default function RegisterScreen() {
  const login = useAuthStore(state => state.login);
  const authLoading = useAuthStore(state => state.loading);
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
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="Name"
          placeholderTextColor="#8AA1C2"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

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

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          disabled={disabled}
          onPress={handleRegister}>
          {disabled ? (
            <ActivityIndicator color={theme.colors.text} />
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
    color: theme.colors.text,
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
  error: {
    color: theme.colors.danger,
    marginBottom: 8,
  },
});
