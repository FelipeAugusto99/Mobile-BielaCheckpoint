// ÚNICO lugar com durações, molas e a chave geral de animações (RF-55 e RF-62).
// Nenhum componente define número de animação por conta própria.

/**
 * Chave geral. Em `false`, TODAS as animações do app são desligadas:
 * entradas, saídas, layout, molas de toque e skeleton. O app continua usável
 * e cada ação mantém feedback estático (cor, opacidade, texto).
 */
export const ANIMATIONS_ENABLED = true;

export const motion = {
  duration: {
    fast: 140,
    base: 240,
    skeletonPulse: 800,
    flash: 1800, // quanto tempo a confirmação visual fica na tela
  },
  spring: {
    // toque: rápido e firme, sem balançar
    press: { damping: 18, stiffness: 320, mass: 0.6 },
    // confirmação (coração): mola mais solta, dá o "pop"
    pop: { damping: 7, stiffness: 260, mass: 0.5 },
    // entrada de lista
    enter: { damping: 16, stiffness: 140, mass: 0.8 },
    // acomodação dos itens que ficam quando outro sai
    layout: { damping: 20, stiffness: 180, mass: 0.9 },
  },
  press: { scale: 0.96, dimOpacity: 0.12 },
  pop: { scale: 1.35 },
  stagger: {
    step: 55, // atraso entre itens
    maxDelay: 330, // teto: o 20º item não espera 1 segundo
    offsetY: 14,
  },
  skeleton: { min: 0.45, max: 1 },
} as const;
