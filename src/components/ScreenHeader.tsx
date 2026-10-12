import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 2 },
  title: { fontFamily: fonts.title, fontSize: 28, color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.muted },
});
