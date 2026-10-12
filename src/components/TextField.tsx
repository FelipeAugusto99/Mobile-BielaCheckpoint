import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius } from '@/theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.ink },
  input: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 13 },
});
