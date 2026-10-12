import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '@/theme';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="bicycle" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.name}>Biela</Text>
            <Text style={styles.tagline}>Peças de bike pra quem pedala de verdade.</Text>
          </View>
          <View style={styles.sheet}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.form}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  brand: { padding: 28, paddingBottom: 36, gap: 6 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: { fontFamily: fonts.title, fontSize: 40, color: '#FFFFFF', letterSpacing: -1 },
  tagline: { fontSize: 15, color: '#CFE5DC' },
  sheet: {
    flex: 1,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 6,
  },
  title: { fontFamily: fonts.title, fontSize: 26, color: colors.ink },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: 12 },
  form: { gap: 14 },
});

export const authLinkStyle = {
  color: colors.primary,
  fontFamily: fonts.title,
  textAlign: 'center' as const,
  fontSize: 15,
  padding: radius.sm,
};
