import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@/theme';
import { motion } from './tokens';
import { useMotionMode } from './useMotion';

interface BlockProps {
  width?: DimensionValue;
  height: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bloco que "respira" enquanto carrega (RF-53). É só opacidade, sem deslocamento,
 * então continua ligado sob "Reduzir movimento". Só a constante geral o desliga.
 */
export function SkeletonBlock({ width = '100%', height, style }: BlockProps) {
  const mode = useMotionMode();
  const level = useSharedValue<number>(motion.skeleton.max);

  useEffect(() => {
    if (mode === 'off') {
      level.value = motion.skeleton.max;
      return;
    }
    level.value = withRepeat(
      withTiming(motion.skeleton.min, {
        duration: motion.duration.skeletonPulse,
        reduceMotion: ReduceMotion.Never,
      }),
      -1,
      true,
      undefined,
      ReduceMotion.Never,
    );
  }, [mode, level]);

  const animated = useAnimatedStyle(() => ({ opacity: level.value }));

  return <Animated.View style={[styles.block, { width, height }, animated, style]} />;
}

/** Silhueta de 5 cards de produto para a vitrine carregando. */
export function ProductSkeletonList() {
  return (
    <View style={styles.list} accessibilityLabel="Carregando peças">
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.card}>
          <SkeletonBlock width={92} height={92} style={styles.photo} />
          <View style={styles.lines}>
            <SkeletonBlock width="40%" height={10} />
            <SkeletonBlock width="85%" height={16} />
            <SkeletonBlock width="55%" height={22} style={styles.pill} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.border, borderRadius: 6 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: { borderRadius: radius.md },
  lines: { flex: 1, justifyContent: 'center', gap: 10 },
  pill: { borderRadius: radius.pill },
});
