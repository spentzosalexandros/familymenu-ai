import { CheckIcon, HeartIcon, ProhibitIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import type { Preference } from '../data/types'
import { useT } from '../i18n'

export type ChipProps = {
  children: ReactNode
  selected?: boolean
  onToggle?: () => void
  emoji?: string
  icon?: ReactNode
  size?: 'sm' | 'md'
  /** Selected look: filled primary (default) or tinted. */
  tone?: 'filled' | 'tinted'
  disabled?: boolean
  className?: string
}

/** Toggle chip (filters, likes/dislikes). aria-pressed reflects the state. */
export function Chip({ children, selected, onToggle, emoji, icon, size = 'md', tone = 'filled', disabled, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onToggle}
      disabled={disabled}
      className={clsx(
        'relative inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap select-none',
        'transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.96] disabled:opacity-40',
        "before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']",
        size === 'md' ? 'h-9 px-3.5 text-subhead' : 'h-[30px] px-3 text-footnote',
        selected
          ? tone === 'filled'
            ? 'bg-primary text-on-primary'
            : 'bg-primary-tint text-primary shadow-[inset_0_0_0_1.5px_var(--primary)]'
          : 'bg-fill-3 text-label',
        className,
      )}
    >
      {emoji && <span className="text-[1.05em] leading-none">{emoji}</span>}
      {icon && <span className="flex text-[1.1em]">{icon}</span>}
      {children}
    </button>
  )
}

export const TRI_STATE_LABELS: Record<Preference, { el: string; en: string }> = {
  love: { el: 'Λατρεύει', en: 'Loves' },
  eats: { el: 'Τρώει', en: 'Eats' },
  refuses: { el: 'Όχι', en: 'No' },
}
const ORDER: Preference[] = ['love', 'eats', 'refuses']

export type TriStateChipProps = {
  label: ReactNode
  emoji?: string
  value: Preference | undefined
  onChange: (next: Preference) => void
  className?: string
}

/** Food preference chip: tap cycles Λατρεύει → Τρώει → Όχι. */
export function TriStateChip({ label, emoji, value, onChange, className }: TriStateChipProps) {
  const t = useT()
  const next = () => onChange(ORDER[(ORDER.indexOf(value ?? 'refuses') + 1) % ORDER.length])
  const look =
    value === 'love'
      ? 'bg-accent-tint text-accent-ink shadow-[inset_0_0_0_1.5px_var(--accent)]'
      : value === 'refuses'
        ? 'bg-danger-tint text-danger shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--danger)_55%,transparent)]'
        : value === 'eats'
          ? 'bg-bg-grouped-2 text-label shadow-[inset_0_0_0_1px_var(--separator)]'
          : 'bg-fill-3 text-label-2'
  const glyph =
    value === 'love' ? (
      <HeartIcon weight="fill" />
    ) : value === 'refuses' ? (
      <ProhibitIcon weight="bold" />
    ) : value === 'eats' ? (
      <CheckIcon weight="bold" />
    ) : null
  return (
    <button
      type="button"
      onClick={next}
      aria-label={`${typeof label === 'string' ? label : ''} — ${value ? t(TRI_STATE_LABELS[value]) : ''}`}
      className={clsx(
        'relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full pr-3 pl-3 text-subhead font-medium whitespace-nowrap select-none',
        'transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.95]',
        look,
        className,
      )}
    >
      {emoji && <span className="text-[17px] leading-none">{emoji}</span>}
      <span>{label}</span>
      {glyph && <span className="flex text-[14px]">{glyph}</span>}
    </button>
  )
}
