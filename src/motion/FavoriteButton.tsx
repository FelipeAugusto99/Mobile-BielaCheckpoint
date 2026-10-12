import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme';
import { PressableScale } from './PressableScale';
import { motion } from './tokens';
import { useMotionMode } from './useMotion';

interface Props {
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}

/**
 * Favoritar não navega, então precisa de confirmação visual (RF-50):
 * o coração enche de cor, dá um "pop" com mola e vibra de leve.
 * Sob "Reduzir movimento" o pop some, mas a troca de cor e a vibração ficam.
 */
export function FavoriteButton({ active, disabled, onPress }: Props) {
  const mode = useMotionMode();
  const scale = useSharedValue(1);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (active) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      if (mode === 'full') {
        scale.value = withSequence(
          withSpring(motion.pop.scale, motion.spring.pop),
          withSpring(1, motion.spring.pop),
        );
      }
    }
  }, [active, mode, scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remover dos favoritos' : 'Favoritar'}
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, active && styles.on]}
    >
      <Animated.View style={iconStyle}>
        <Ionicons
          name={active ? 'heart' : 'heart-outline'}
          size={24}
          color={active ? '#FFFFFF' : colors.accent}
        />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: { backgroundColor: colors.accent },
});
