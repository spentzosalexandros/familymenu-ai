import type { L10n, Lang } from '../data/types'

/** Any user-visible text: a bilingual pair or an already-resolved string. */
export type Text = L10n | string
export type Vars = Record<string, string | number>

const LOCALE: Record<Lang, string> = { el: 'el-GR', en: 'en-GB' }
export const localeOf = (lang: Lang) => LOCALE[lang]

/** Resolve a bilingual text and fill `{name}` placeholders. */
export function translate(text: Text | null | undefined, lang: Lang, vars?: Vars): string {
  if (text == null) return ''
  let s = typeof text === 'string' ? text : (text[lang] ?? text.el)
  if (vars) {
    s = s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? formatVar(vars[k], lang) : m))
  }
  return s
}

function formatVar(v: string | number, lang: Lang) {
  return typeof v === 'number' ? formatNumber(v, lang) : v
}

const cache = new Map<string, Intl.NumberFormat>()
function nf(lang: Lang, opts: Intl.NumberFormatOptions) {
  const key = lang + JSON.stringify(opts)
  let f = cache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(LOCALE[lang], opts)
    cache.set(key, f)
  }
  return f
}

/** 12,40 € (el) · €12.40 (en). `decimals: 0` → 127 €. */
export function formatEUR(value: number, lang: Lang, opts: { decimals?: 0 | 2; sign?: boolean } = {}) {
  const decimals = opts.decimals ?? 2
  return nf(lang, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: opts.sign ? 'exceptZero' : 'auto',
  }).format(value)
}

/** Grouped number with locale separators: 1.250 / 1,250 · 1,2 / 1.2 · formatNumber(2, 'el', 1, 1) → 2,0 */
export function formatNumber(value: number, lang: Lang, maxDecimals = 1, minDecimals = 0) {
  return nf(lang, { maximumFractionDigits: maxDecimals, minimumFractionDigits: minDecimals }).format(value)
}

/** 82 % (el) · 82% (en). Input is 0–100. */
export function formatPercent(value: number, lang: Lang) {
  return nf(lang, { style: 'percent', maximumFractionDigits: 0 }).format(value / 100)
}

/** 1,2 kg */
export function formatKg(value: number, lang: Lang) {
  return `${formatNumber(value, lang, 1)} kg`
}

/**
 * Cooking / saved time.
 * short: 45′ · 1 ώ 15′ (el) / 45 min · 1 h 15 min (en)
 * long:  45 λεπτά · 1 ώρα και 15 λεπτά / 45 minutes · 1 hour 15 minutes
 */
export function formatMinutes(min: number, lang: Lang, style: 'short' | 'long' = 'short') {
  const m = Math.round(min)
  const h = Math.floor(m / 60)
  const r = m % 60
  if (style === 'short') {
    if (lang === 'el') return h ? (r ? `${h} ώ ${r}′` : `${h} ώ`) : `${r}′`
    return h ? (r ? `${h} h ${r} min` : `${h} h`) : `${r} min`
  }
  const hs = lang === 'el' ? (h === 1 ? 'ώρα' : 'ώρες') : h === 1 ? 'hour' : 'hours'
  const ms = lang === 'el' ? (r === 1 ? 'λεπτό' : 'λεπτά') : r === 1 ? 'minute' : 'minutes'
  if (!h) return `${r} ${ms}`
  if (!r) return `${h} ${hs}`
  return lang === 'el' ? `${h} ${hs} και ${r} ${ms}` : `${h} ${hs} ${r} ${ms}`
}

export type PluralForms = { one: string; other: string }
/**
 * plural(n, { el: { one: '{n} γεύμα', other: '{n} γεύματα' }, en: { one: '{n} meal', other: '{n} meals' } }, lang)
 */
export function plural(n: number, forms: { el: PluralForms; en: PluralForms }, lang: Lang, vars?: Vars) {
  const rule = new Intl.PluralRules(LOCALE[lang]).select(n)
  const f = forms[lang]
  const s = rule === 'one' ? f.one : f.other
  return translate(s, lang, { n, ...vars })
}

/** "9:41" from minutes since midnight. */
export function formatClock(minutes: number) {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

/** "HH:MM" or "H:MM" → minutes since midnight (NaN if invalid). */
export function parseClock(s: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim())
  if (!m) return NaN
  return Number(m[1]) * 60 + Number(m[2])
}

/** Join names naturally: "Νίκος και Ελένη" / "Nikos and Eleni". */
export function joinNames(names: string[], lang: Lang) {
  if (names.length <= 1) return names.join('')
  const and = lang === 'el' ? ' και ' : ' and '
  return names.slice(0, -1).join(', ') + and + names[names.length - 1]
}
