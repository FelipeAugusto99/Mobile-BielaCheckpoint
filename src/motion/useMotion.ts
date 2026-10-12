import {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutRight,
  LinearTransition,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';
import { ANIMATIONS_ENABLED, motion } from './tokens';

/**
 * full    → movimento completo
 * reduced → "Reduzir movimento" do sistema: troca deslocamento/escala por fade de opacidade
 * off     → constante ANIMATIONS_ENABLED em false: nada anima
 */
export type MotionMode = 'full' | 'reduced' | 'off';

export function useMotionMode(): MotionMode {
  const systemReduced = useReducedMotion();
  if (!ANIMATIONS_ENABLED) return 'off';
  return systemReduced ? 'reduced' : 'full';
}

/**
 * Presets de lista. `.reduceMotion(ReduceMotion.Never)` nos fades do modo reduzido
 * é intencional: por padrão o Reanimated pularia a animação inteira sob "Reduzir
 * movimento", e o item surgiria sem nenhum feedback.
 */
export function useListMotion() {
  const mode = useMotionMode();

  function entering(index: number) {
    if (mode === 'off') return undefined;
    if (mode === 'reduced') {
      return FadeIn.duration(motion.duration.fast).reduceMotion(ReduceMotion.Never);
    }
    const delay = Math.min(index * motion.stagger.step, motion.stagger.maxDelay);
    return FadeInDown.delay(delay)
      .springify()
      .damping(motion.spring.enter.damping)
      .stiffness(motion.spring.enter.stiffness)
      .mass(motion.spring.enter.mass);
  }

  const exiting =
    mode === 'off'
      ? undefined
      : mode === 'reduced'
        ? FadeOut.duration(motion.duration.fast).reduceMotion(ReduceMotion.Never)
        : FadeOutRight.duration(motion.duration.base);

  // Acomodar os itens que ficam é deslocamento: só no modo completo.
  const layout =
    mode === 'full'
      ? LinearTransition.springify()
          .damping(motion.spring.layout.damping)
          .stiffness(motion.spring.layout.stiffness)
          .mass(motion.spring.layout.mass)
      : undefined;

  return { mode, entering, exiting, layout };
}

/** Preset de mensagem de confirmação (aparece e some sozinha). */
export function useFlashMotion() {
  const mode = useMotionMode();
  if (mode === 'off') return { entering: undefined, exiting: undefined };
  if (mode === 'reduced') {
    return {
      entering: FadeIn.duration(motion.duration.fast).reduceMotion(ReduceMotion.Never),
      exiting: FadeOut.duration(motion.duration.fast).reduceMotion(ReduceMotion.Never),
    };
  }
  return {
    entering: FadeInDown.springify()
      .damping(motion.spring.enter.damping)
      .stiffness(motion.spring.enter.stiffness),
    exiting: FadeOut.duration(motion.duration.base),
  };
}
