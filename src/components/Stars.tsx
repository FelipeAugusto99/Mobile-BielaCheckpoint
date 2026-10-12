import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/motion/PressableScale';
import { colors } from '@/theme';

const POSITIONS = [1, 2, 3, 4, 5] as const;

/** Estrelas só de leitura (aceita meia estrela). */
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`Nota ${value.toFixed(1)} de 5`}>
      {POSITIONS.map((position) => {
        const name =
          value >= position ? 'star' : value >= position - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={position} name={name} size={size} color={colors.accent} />;
      })}
    </View>
  );
}

/** Seletor de nota de 1 a 5. */
export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.pickerRow}>
      {POSITIONS.map((position) => (
        <PressableScale
          key={position}
          accessibilityRole="button"
          accessibilityLabel={`${position} ${position === 1 ? 'estrela' : 'estrelas'}`}
          onPress={() => onChange(position)}
          hitSlop={4}
        >
          <Ionicons
            name={value >= position ? 'star' : 'star-outline'}
            size={38}
            color={colors.accent}
          />
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
  pickerRow: { flexDirection: 'row', gap: 6 },
});
