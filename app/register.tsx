import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';
import { AuthLayout, authLinkStyle } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Notice } from '@/components/Notice';
import { TextField } from '@/components/TextField';
import { errorMessage, fieldErrors } from '@/services/errors';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function handleSubmit() {
    setError(null);
    setFields({});
    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha nome, e-mail e senha para criar sua conta.');
      return;
    }
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
    } catch (e) {
      // 409 (e-mail já cadastrado) e 400 (validação) chegam com a mensagem pronta da API.
      setFields(fieldErrors(e));
      setError(errorMessage(e));
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Crie sua conta" subtitle="Leva menos de um minuto. A senha precisa de 6+ caracteres.">
      <TextField
        label="Nome"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        error={fields.name}
      />
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
        autoComplete="new-password"
        error={fields.password}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button label="Criar conta" onPress={handleSubmit} loading={loading} variant="accent" />
      <Link href="/login" asChild>
        <Pressable>
          <Text style={authLinkStyle}>Já tenho conta. Entrar</Text>
        </Pressable>
      </Link>
    </AuthLayout>
  );
}
