import NumberFlow from '@number-flow/react'
import type { Format } from '@number-flow/react'
import { ShieldCheckIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { family, isSafeFor } from '../data'
import type { Member, MemberId } from '../data/types'
import { S, formatEUR, joinNames, localeOf, useLang, useT } from '../i18n'
import { spring } from './motion'

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'solid'
export type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  icon?: ReactNode
  emoji?: string
  size?: 'sm' | 'md'
  className?: string
}
const BADGE: Record<BadgeTone, string> = {
  neutral: 'bg-fill-3 text-label-2',
  primary: 'bg-primary-tint text-primary',
  accent: 'bg-accent-tint text-accent-ink',
  success: 'bg-success-tint text-[color-mix(in_srgb,var(--success)_78%,var(--label))]',
  warning: 'bg-warning-tint text-[color-mix(in_srgb,var(--warning)_70%,var(--label))]',
  danger: 'bg-danger-tint text-danger',
  solid: 'bg-primary text-on-primary',
}

/** Small capsule label: ⭐ Αγαπημένο του Νίκου · 🌿 Νηστίσιμο · ♻️ Περίσσευμα */
export function Badge({ children, tone = 'neutral', icon, emoji, size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex max-w-full shrink-0 items-center gap-1 rounded-full font-semibold whitespace-nowrap',
        size === 'sm' ? 'h-[22px] px-2 text-caption' : 'h-7 px-2.5 text-footnote',
        BADGE[tone],
        className,
      )}
    >
      {emoji && <span className="text-[1.05em] leading-none">{emoji}</span>}
      {icon && <span className="flex text-[1.15em]">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  )
}

/** Notification-style dot (e.g. on a tab or avatar). */
export function Dot({ className, color = 'var(--danger)' }: { className?: string; color?: string }) {
  return <span aria-hidden className={clsx('block size-2 rounded-full', className)} style={{ background: color }} />
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
export type AvatarProps = {
  /** Member from src/data (emoji + ring colour), or pass emoji/color directly. */
  member?: Member
  emoji?: string
  color?: string
  size?: number
  /** Coloured ring around the avatar. */
  ring?: boolean
  label?: string
  className?: string
}

export function Avatar({ member, emoji, color, size = 40, ring = true, label, className }: AvatarProps) {
  const lang = useLang()
  const c = color ?? member?.color ?? 'var(--primary)'
  const e = emoji ?? member?.avatar ?? '🙂'
  const name = label ?? (member ? member.name[lang] : undefined)
  return (
    <span
      role={name ? 'img' : undefined}
      aria-label={name}
      className={clsx('relative inline-flex shrink-0 items-center justify-center rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${c} 16%, var(--bg-grouped-2))`,
        boxShadow: ring ? `0 0 0 ${size >= 48 ? 2.5 : 2}px ${c}` : undefined,
        fontSize: size * 0.56,
      }}
    >
      <span className="leading-none" aria-hidden>
        {e}
      </span>
    </span>
  )
}

/** Overlapping avatars (family header). */
export function AvatarStack({ members, size = 32, className }: { members: Member[]; size?: number; className?: string }) {
  return (
    <span className={clsx('flex items-center', className)}>
      {members.map((m, i) => (
        <span key={m.id} style={{ marginLeft: i ? -size * 0.28 : 0, zIndex: members.length - i }} className="rounded-full ring-2 ring-bg-grouped-2">
          <Avatar member={m} size={size} ring={false} />
        </span>
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------------
// ProgressBar / BudgetBar
// ---------------------------------------------------------------------------
export type ProgressBarProps = {
  /** 0–1 */
  value: number
  tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger'
  height?: number
  className?: string
  'aria-label'?: string
}

/** Thin rounded progress bar; animates with a spring (transform only). */
export function ProgressBar({ value, tone = 'primary', height = 6, className, ...aria }: ProgressBarProps) {
  const v = Math.max(0, Math.min(1, value || 0))
  return (
    <div
      role="progressbar"
      aria-label={aria['aria-label']}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={clsx('relative w-full overflow-hidden rounded-full bg-fill-3', className)}
      style={{ height }}
    >
      <motion.div
        className="absolute inset-0 origin-left rounded-full"
        style={{ background: `var(--${tone})` }}
        initial={false}
        animate={{ scaleX: v }}
        transition={spring.gentle}
      />
    </div>
  )
}

export type BudgetBarProps = {
  /** Spent / planned € */
  value: number
  budget: number
  /** Show the "x € από y €" line and the remaining amount. */
  showLabels?: boolean
  className?: string
}

/** Plan cost vs budget. Green-ish under budget, amber close to it, red over. */
export function BudgetBar({ value, budget, showLabels = true, className }: BudgetBarProps) {
  const lang = useLang()
  const t = useT()
  const ratio = budget > 0 ? value / budget : 0
  const tone = ratio > 1 ? 'danger' : ratio > 0.96 ? 'warning' : 'primary'
  const left = budget - value
  return (
    <div className={className}>
      {showLabels && (
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-subhead text-label tnum">
            <AnimatedNumber value={value} format="eur" className="font-semibold" />{' '}
            <span className="text-label-2">{t({ el: 'από {b}', en: 'of {b}' }, { b: formatEUR(budget, lang, { decimals: 0 }) })}</span>
          </span>
          <span className={clsx('text-footnote font-medium tnum', left < 0 ? 'text-danger' : 'text-label-2')}>
            {left >= 0
              ? t({ el: 'περισσεύουν {v}', en: '{v} left' }, { v: formatEUR(left, lang) })
              : t({ el: '{v} πάνω', en: '{v} over' }, { v: formatEUR(-left, lang) })}
          </span>
        </div>
      )}
      <ProgressBar value={Math.min(1, ratio)} tone={tone} height={8} aria-label={t({ el: 'Προϋπολογισμός', en: 'Budget' })} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Ring
// ---------------------------------------------------------------------------
export type RingProps = {
  /** 0–1 */
  value: number
  size?: number
  stroke?: number
  /** CSS colour, default primary. */
  color?: string
  trackColor?: string
  children?: ReactNode
  className?: string
  'aria-label'?: string
}

/** Activity-style ring that springs to its value. */
export function Ring({ value, size = 88, stroke = 10, color = 'var(--primary)', trackColor = 'var(--fill-3)', children, className, ...aria }: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const offset = useTransform(mv, (v) => c * (1 - Math.max(0, Math.min(1, v))))
  useEffect(() => {
    const ctl = animate(mv, value, reduce ? { duration: 0 } : { ...spring.gentle, duration: 0.9 })
    return () => ctl.stop()
  }, [value, mv, reduce])
  return (
    <div
      className={clsx('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={aria['aria-label']}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AnimatedNumber
// ---------------------------------------------------------------------------
export type AnimatedNumberProps = {
  value: number
  /** eur: 12,40 € · eur0: 127 € · percent: value 0–100 → 82 % · number · kg */
  format?: 'eur' | 'eur0' | 'percent' | 'number' | 'kg'
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  style?: CSSProperties
}

/** NumberFlow wrapper with el-GR / en-GB formats. Respects reduced motion. */
export function AnimatedNumber({ value, format = 'number', decimals, prefix, suffix, className, style }: AnimatedNumberProps) {
  const lang = useLang()
  const fmt: Format =
    format === 'eur'
      ? { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : format === 'eur0'
        ? { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }
        : format === 'percent'
          ? { style: 'percent', maximumFractionDigits: decimals ?? 0 }
          : { maximumFractionDigits: decimals ?? (format === 'kg' ? 1 : 0), minimumFractionDigits: format === 'kg' ? 1 : 0 }
  return (
    <NumberFlow
      value={format === 'percent' ? value / 100 : value}
      locales={localeOf(lang)}
      format={fmt}
      prefix={prefix}
      suffix={format === 'kg' ? ` kg${suffix ?? ''}` : suffix}
      className={clsx('tnum', className)}
      style={style}
      transformTiming={{ duration: 450, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
      spinTiming={{ duration: 450, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
      opacityTiming={{ duration: 250, easing: 'ease-out' }}
    />
  )
}

// ---------------------------------------------------------------------------
// SafeBadge
// ---------------------------------------------------------------------------
export type SafeBadgeProps = {
  /** When given, the badge only renders if the recipe is safe for those members (isSafeFor). */
  recipeId?: string
  /** Default: every family member with an allergy (Ελένη). */
  memberIds?: MemberId[]
  size?: 'sm' | 'md'
  className?: string
}

/** "Ασφαλές για την Ελένη" — shown on every dish that is safe for members with allergies. */
export function SafeBadge({ recipeId, memberIds, size = 'sm', className }: SafeBadgeProps) {
  const lang = useLang()
  const t = useT()
  const members = memberIds
    ? family.members.filter((m) => memberIds.includes(m.id))
    : family.members.filter((m) => m.allergies.length > 0)
  if (!members.length) return null
  if (recipeId && !isSafeFor(recipeId, members.map((m) => m.id))) return null
  const names = members.map((m) => (lang === 'el' ? withArticle(m) : m.name.en))
  return (
    <Badge tone="success" size={size} icon={<ShieldCheckIcon weight="fill" />} className={className}>
      {t(S.safeFor, { names: joinNames(names, lang) })}
    </Badge>
  )
}

/** "την Ελένη" / "τον Νίκο" (accusative with article) for natural Greek. */
function withArticle(m: Member) {
  const el = m.name.el
  const ACC: Record<string, string> = { Νίκος: 'τον Νίκο', Γιώργος: 'τον Γιώργο', Ελένη: 'την Ελένη', Μαρία: 'τη Μαρία' }
  return ACC[el] ?? el
}
