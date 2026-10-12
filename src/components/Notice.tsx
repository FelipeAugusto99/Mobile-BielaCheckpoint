import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '@/theme';

type Tone = 'error' | 'warn' | 'success';

const TONES: Record<Tone, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  error: { bg: colors.dangerSoft, fg: colors.danger, icon: 'alert-circle' },
  warn: { bg: colors.warnSoft, fg: colors.warn, icon: 'cloud-offline' },
  success: { bg: colors.successSoft, fg: colors.success, icon: 'checkmark-circle' },
};

export function Notice({ tone, children }: { tone: Tone; children: string }) {
  const { bg, fg, icon } = TONES[tone];
  return (
    <View style={[styles.box, { backgroundColor: bg }]} accessibilityRole="alert">
      <Ionicons name={icon} size={20} color={fg} />
      <Text style={[styles.text, { color: fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: radius.sm,
  },
  text: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
