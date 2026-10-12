import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/theme';
import { Button } from './Button';

interface LoadingProps {
  label?: string;
}

export function LoadingState({ label = 'Calibrando a vitrine…' }: LoadingProps) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorProps) {
  return (
    <View style={styles.center}>
      <Ionicons name="construct-outline" size={44} color={colors.danger} />
      <Text style={styles.title}>Furou o pneu</Text>
      <Text style={styles.text}>{message}</Text>
      {onRetry ? <Button label="Tentar de novo" onPress={onRetry} style={styles.button} /> : null}
    </View>
  );
}

interface EmptyProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyProps) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={44} color={colors.muted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{message}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="outline" style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  title: { fontFamily: fonts.title, fontSize: 20, color: colors.ink, textAlign: 'center' },
  text: { fontSize: 15, color: colors.muted, textAlign: 'center', lineHeight: 21 },
  button: { marginTop: 8, alignSelf: 'stretch' },
});
