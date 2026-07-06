import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';
import Button from '@/components/ui/button';
import Screen from '@/components/ui/screen';
import TextWrapper from '@/components/ui/textWrapper';
import { colors } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Заполните все поля');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch {
      Alert.alert('Ошибка', 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen hasHeader={false} style={styles.container}>
      <TextWrapper variant="logo" style={styles.logo}>EMOUR</TextWrapper>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Пароль"
        placeholderTextColor="#666"
        secureTextEntry
        autoComplete="password"
        onSubmitEditing={handleLogin}
      />

      <Button
        variant="primary"
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? 'Входим...' : 'Войти'}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#ffffff0f',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    marginBottom: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ffffff11',
  },
  button: {
    alignSelf: 'center',
    marginTop: 8,
  },
});
