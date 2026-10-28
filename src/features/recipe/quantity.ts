// Ingredient quantity formatting, scaled to the chosen servings.
import type { Ingredient, L10n, Lang } from '../../data/types'

const num = (v: number, lang: Lang, max = 1) =>
  new Intl.NumberFormat(lang === 'el' ? 'el-GR' : 'en-GB', { maximumFractionDigits: max }).format(v)

/** ½ / 1½ style for pieces. */
function pieces(v: number, lang: Lang) {
  const r = Math.round(v * 2) / 2
  if (r <= 0) return '½'
  const whole = Math.floor(r)
  const half = r - whole >= 0.5
  if (!half) return num(whole, lang, 0)
  return whole ? `${whole}½` : '½'
}

/** Rounds grams/ml to a sensible kitchen precision. */
function kitchenRound(v: number) {
  if (v < 10) return Math.max(1, Math.round(v))
  if (v < 100) return Math.round(v / 5) * 5
  return Math.round(v / 10) * 10
}

/** "350 γρ." · "1,2 κιλό" · "60 ml" · "2" (+ note shown separately); notes like "μια πρέζα" replace tiny amounts. */
export function formatQty(ing: Ingredient, qty: number, lang: Lang, note?: L10n): string {
  if (note && /πρέζα|pinch|σταγόνες|squeeze/i.test(note[lang])) return note[lang]
  if (ing.unit === 'pcs') return pieces(qty, lang)
  const v = kitchenRound(qty)
  if (ing.unit === 'g') {
    if (v >= 1000) return lang === 'el' ? `${num(v / 1000, lang)} κιλό` : `${num(v / 1000, lang)} kg`
    return lang === 'el' ? `${v} γρ.` : `${v} g`
  }
  if (v >= 1000) return lang === 'el' ? `${num(v / 1000, lang)} λίτρο` : `${num(v / 1000, lang)} l`
  return `${v} ml`
}

/** First "20 λεπτά" / "25 minutes" in a step → minutes (for the cook-mode timer). */
export function timerMinutes(text: string): number | null {
  const m = /(\d+)\s*(?:–\s*\d+\s*)?(λεπτ|minute|min\b|΄|′|’)/i.exec(text)
  if (!m) return null
  const n = Number(m[1])
  return n > 0 && n <= 240 ? n : null
}
