import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';
import { AuthLayout, authLinkStyle } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { errorMessage, fieldErrors } from '@/services/errors';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function handleSubmit() {
    setError(null);
    setFields({});
    if (!email.trim() || !password) {
      setError('Preencha o e-mail e a senha para entrar.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e) {
      setFields(fieldErrors(e));
      setError(errorMessage(e));
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre para ver seus favoritos e pedidos.">
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        error={fields.email}
      />
      <TextField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        error={fields.password}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button label="Entrar" onPress={handleSubmit} loading={loading} variant="accent" />
      <Link href="/register" asChild>
        <Pressable>
          <Text style={authLinkStyle}>Ainda não tem conta? Cadastre-se</Text>
        </Pressable>
      </Link>
    </AuthLayout>
  );
}
