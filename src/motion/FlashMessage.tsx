import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '@/theme';
import { useFlashMotion } from './useMotion';

/** Confirmação visual de ação sem navegação (RF-50). Quem usa controla quando some. */
export function FlashMessage({ message }: { message: string }) {
  const { entering, exiting } = useFlashMotion();
  return (
    <Animated.View entering={entering} exiting={exiting} style={styles.box} accessibilityLiveRegion="polite">
      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.successSoft,
  },
  text: { fontFamily: fonts.medium, fontSize: 14, color: colors.success },
});
