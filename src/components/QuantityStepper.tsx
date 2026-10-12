import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '@/motion/PressableScale';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '@/theme';

interface Props {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (next: number) => void;
}

export function QuantityStepper({ value, min = 1, max = 99, disabled, onChange }: Props) {
  const canDec = !disabled && value > min;
  const canInc = !disabled && value < max;

  return (
    <View style={styles.row}>
      <PressableScale
        accessibilityLabel="Diminuir quantidade"
        disabled={!canDec}
        onPress={() => onChange(value - 1)}
        style={[styles.btn, !canDec && styles.off]}
      >
        <Ionicons name="remove" size={18} color={colors.primary} />
      </PressableScale>
      <Text style={styles.value}>{value}</Text>
      <PressableScale
        accessibilityLabel="Aumentar quantidade"
        disabled={!canInc}
        onPress={() => onChange(value + 1)}
        style={[styles.btn, !canInc && styles.off]}
      >
        <Ionicons name="add" size={18} color={colors.primary} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: { opacity: 0.35 },
  value: {
    minWidth: 34,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 17,
    color: colors.ink,
  },
});
