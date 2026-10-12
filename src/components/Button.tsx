import { ActivityIndicator, StyleSheet, Text, type ViewStyle } from 'react-native';
import { PressableScale } from '@/motion/PressableScale';
import { colors, fonts, radius } from '@/theme';

type Variant = 'primary' | 'accent' | 'outline' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const BG: Record<Variant, string> = {
  primary: colors.primary,
  accent: colors.accent,
  outline: 'transparent',
  danger: colors.danger,
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const inactive = disabled || loading;
  const textColor = variant === 'outline' ? colors.primary : '#FFFFFF';

  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={[
        styles.base,
        { backgroundColor: BG[variant] },
        variant === 'outline' && styles.outline,
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: { borderWidth: 2, borderColor: colors.primary },
  inactive: { opacity: 0.5 },
  label: { fontFamily: fonts.title, fontSize: 16, letterSpacing: 0.3 },
});
