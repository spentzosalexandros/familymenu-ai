/**
 * Gesture helpers (apple-design §2, §5, §6, §9).
 * All drag code in the app divides pointer deltas by getDeviceScale(), because the desktop
 * iPhone frame may be scaled down to fit the window.
 */

let deviceScale = 1
export const setDeviceScale = (s: number) => {
  deviceScale = s || 1
}
export const getDeviceScale = () => deviceScale

/** Apple's momentum projection: where a flick would come to rest (px). */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/** Progressive resistance past a boundary. */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  const sign = Math.sign(overshoot)
  const o = Math.abs(overshoot)
  return (sign * (o * dimension * constant)) / (dimension + constant * o)
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Tracks the last ~100 ms of pointer samples to compute release velocity (px/s, local units). */
export class VelocityTracker {
  private samples: { t: number; x: number; y: number }[] = []
  reset() {
    this.samples = []
  }
  add(x: number, y: number, t = performance.now()) {
    this.samples.push({ t, x, y })
    const cutoff = t - 120
    while (this.samples.length > 2 && this.samples[0].t < cutoff) this.samples.shift()
  }
  velocity(): { x: number; y: number } {
    const s = this.samples
    if (s.length < 2) return { x: 0, y: 0 }
    const a = s[0]
    const b = s[s.length - 1]
    const dt = (b.t - a.t) / 1000
    if (dt <= 0) return { x: 0, y: 0 }
    // A pause before release kills the momentum (finger held still).
    if (performance.now() - b.t > 80) return { x: 0, y: 0 }
    return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt }
  }
}

/** Swallow the click that follows a drag (capture phase, one-shot). */
export function suppressNextClick() {
  const handler = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }
  window.addEventListener('click', handler, { capture: true, once: true })
  // If no click arrives (e.g. pointer released outside), drop the listener soon.
  setTimeout(() => window.removeEventListener('click', handler, { capture: true }), 350)
}

/** Light haptic where the platform supports it (Android); silent elsewhere. */
export function haptic(ms = 8) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* ignore */
  }
}
