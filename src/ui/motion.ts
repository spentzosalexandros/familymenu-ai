import type { Transition } from 'motion/react'

/**
 * Shared motion presets (apple-design: springs for anything touchable, critically damped by default,
 * bounce only after a gesture that carried momentum).
 *
 *   <motion.div animate={{ x }} transition={spring.default} />
 *   animate(mv, 0, { ...spring.sheetFlick, velocity })
 */
export const spring = {
  /** Default UI spring: no overshoot (damping 1.0, response 0.4). */
  default: { type: 'spring', bounce: 0, duration: 0.4 },
  /** Small controls: thumbs, toggles, segmented controls. */
  snappy: { type: 'spring', bounce: 0, duration: 0.3 },
  /** Push / pop of navigation screens. */
  push: { type: 'spring', bounce: 0, duration: 0.42 },
  /** Programmatic sheet presentation. */
  sheet: { type: 'spring', bounce: 0, duration: 0.42 },
  /** Sheet / drawer after a flick (Apple: damping 0.8, response 0.3). */
  sheetFlick: { type: 'spring', bounce: 0.16, duration: 0.34 },
  /** Momentum interactions only (a thrown card, a released swipe). */
  bouncy: { type: 'spring', bounce: 0.2, duration: 0.4 },
  /** Large, calm moves (hero transitions, layout reflow). */
  gentle: { type: 'spring', bounce: 0, duration: 0.55 },
  /** Layout animations of lists (items moving between sections). */
  layout: { type: 'spring', bounce: 0, duration: 0.45 },
} satisfies Record<string, Transition>

/** Strong custom curves (emil-design-eng). Never ease-in for UI. */
export const ease = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.77, 0, 0.175, 1],
  drawer: [0.32, 0.72, 0, 1],
} as const

/** Short cross-fade (also the reduced-motion replacement for slides). */
export const fade: Transition = { duration: 0.2, ease: ease.out }

/** Press feedback for motion components: <motion.button whileTap={tap} transition={tapTransition}> */
export const tap = { scale: 0.97 }
export const tapTransition: Transition = { duration: 0.1, ease: ease.out }

/** Enter from slightly smaller + transparent — never from scale(0). */
export const popIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

export function prefersReducedMotion() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}
