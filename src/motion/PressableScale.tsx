import type { ReactNode } from 'react';
import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { motion } from './tokens';
import { useMotionMode } from './useMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Controle que responde ao toque (RF-49).
 * full: encolhe com mola. reduced: só escurece (sem escala). off: escurece sem animar.
 * O feedback existe nos três modos.
 */
export function PressableScale({ style, children, onPressIn, onPressOut, ...rest }: Props) {
  const mode = useMotionMode();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value * motion.press.dimOpacity,
    transform: [{ scale: mode === 'full' ? 1 - pressed.value * (1 - motion.press.scale) : 1 }],
  }));

  function go(to: 0 | 1) {
    if (mode === 'off') {
      pressed.value = to;
    } else if (mode === 'reduced') {
      pressed.value = withTiming(to, {
        duration: motion.duration.fast,
        reduceMotion: ReduceMotion.Never,
      });
    } else {
      pressed.value = withSpring(to, motion.spring.press);
    }
  }

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(event: GestureResponderEvent) => {
        go(1);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        go(0);
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
