import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthProvider';
import { syncStoreMessages } from '@/notifications/sync';
import { useNotificationPermission } from '@/notifications/useNotificationPermission';
import { errorMessage } from '@/services/errors';
import { colors, fonts, radius } from '@/theme';
import { Button } from './Button';
import { Notice } from './Notice';

/**
 * Explica o estado da permissão de notificação e como reativar (RF-60).
 * Negar a permissão não quebra nada: o app só deixa de avisar.
 */
export function NotificationCard() {
  const { user } = useAuth();
  const { state, request } = useNotificationPermission();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  async function checkNow() {
    if (!user) return;
    setChecking(true);
    setResult(null);
    setFailure(null);
    try {
      const count = await syncStoreMessages(user.id);
      setResult(
        count > 0
          ? `${count} ${count === 1 ? 'aviso novo' : 'avisos novos'} da loja.`
          : 'Nenhum aviso novo por enquanto.',
      );
    } catch (e) {
      setFailure(errorMessage(e));
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Ionicons name="notifications-outline" size={22} color={colors.primary} />
        <Text style={styles.title}>Avisos de preço</Text>
      </View>

      {state.status === 'loading' ? <Text style={styles.text}>Verificando…</Text> : null}

      {state.status === 'undetermined' ? (
        <>
          <Text style={styles.text}>
            Avisamos quando uma peça que você favoritou baixa de preço. Ao tocar no aviso, você cai
            direto na peça.
          </Text>
          <Button label="Ativar avisos" variant="accent" onPress={() => void request()} />
        </>
      ) : null}

      {state.status === 'granted' ? (
        <>
          <Notice tone="success">Avisos ativados.</Notice>
          <Text style={styles.text}>
            Os avisos da loja chegam quando você abre o app. Se uma peça favorita baixar de preço,
            você será avisado.
          </Text>
          <Button
            label="Buscar avisos agora"
            variant="outline"
            onPress={checkNow}
            loading={checking}
          />
          {result ? <Text style={styles.result}>{result}</Text> : null}
          {failure ? <Notice tone="error">{failure}</Notice> : null}
        </>
      ) : null}

      {state.status === 'denied' ? (
        <>
          <Notice tone="warn">
            Os avisos estão desativados. O app continua funcionando normalmente, você só não é
            avisado sobre queda de preço.
          </Notice>
          <Text style={styles.text}>
            Para reativar: abra os ajustes do aparelho, entre em Biela, depois em Notificações, e
            permita os avisos.
          </Text>
          {state.canAskAgain ? (
            <Button label="Tentar ativar de novo" variant="outline" onPress={() => void request()} />
          ) : (
            <Button label="Abrir ajustes" variant="outline" onPress={() => void Linking.openSettings()} />
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.title, fontSize: 17, color: colors.ink },
  text: { fontSize: 14, lineHeight: 20, color: colors.muted },
  result: { fontSize: 14, color: colors.success, fontFamily: fonts.medium },
});
