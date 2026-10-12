import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { orderStatusLabel } from '@/utils/format';

function palette(status: string): { bg: string; fg: string } {
  if (status === 'PENDING') return { bg: colors.warnSoft, fg: colors.warn };
  if (status === 'CANCELLED' || status === 'CANCELED' || status === 'REFUNDED') {
    return { bg: colors.dangerSoft, fg: colors.danger };
  }
  return { bg: colors.successSoft, fg: colors.success };
}

export function StatusPill({ status }: { status: string }) {
  const { bg, fg } = palette(status);
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{orderStatusLabel(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  text: { fontFamily: fonts.title, fontSize: 12 },
});
