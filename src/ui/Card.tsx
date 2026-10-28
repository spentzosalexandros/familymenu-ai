import { clsx } from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Inner padding: none | sm (12) | md (16, default) | lg (20). */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Makes the whole card a button with press feedback. */
  onPress?: () => void
  /** Glow briefly (e.g. after a swap or feedback changed it). */
  highlight?: boolean
  children?: ReactNode
}

const PAD = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' }

/** Rounded content card on grouped backgrounds. */
export function Card({ padding = 'md', onPress, highlight, className, children, ...rest }: CardProps) {
  const cls = clsx(
    'relative overflow-hidden rounded-[18px] bg-bg-grouped-2 shadow-card',
    PAD[padding],
    highlight && 'ring-2 ring-primary/70 ring-offset-2 ring-offset-bg-grouped transition-shadow duration-500',
    onPress && 'cursor-pointer text-left transition-transform duration-100 ease-out active:scale-[0.98]',
    className,
  )
  if (onPress) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onPress}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onPress()
          }
        }}
        className={cls}
        {...rest}
      >
        {children}
      </div>
    )
  }
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}

export type SectionHeaderProps = {
  title: ReactNode
  /** Optional line under the title. */
  subtitle?: ReactNode
  /** Right-side action, e.g. "Όλα". */
  action?: ReactNode
  onAction?: () => void
  /** prominent: Title3 bold (content sections) · small: footnote gray (above lists). */
  variant?: 'prominent' | 'small'
  className?: string
}

export function SectionHeader({ title, subtitle, action, onAction, variant = 'prominent', className }: SectionHeaderProps) {
  return (
    <div className={clsx('flex items-end justify-between gap-3 px-5', variant === 'prominent' ? 'pb-2.5' : 'pb-1.5', className)}>
      <div className="min-w-0">
        <h2 className={variant === 'prominent' ? 'text-title-3 font-bold text-label' : 'text-footnote text-label-2'}>
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-subhead text-label-2">{subtitle}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="relative -mr-2 shrink-0 px-2 py-1 text-[17px] text-primary transition-opacity active:opacity-50 before:absolute before:-inset-2 before:content-['']"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export type EmptyStateProps = {
  emoji?: string
  icon?: ReactNode
  title: ReactNode
  message?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ emoji, icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center px-8 py-10 text-center', className)}>
      {(emoji || icon) && (
        <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-fill-4 text-[32px] text-label-3" aria-hidden>
          {emoji ?? icon}
        </div>
      )}
      <h3 className="text-title-3 text-label">{title}</h3>
      {message && <p className="mt-1.5 max-w-[30ch] text-subhead text-label-2">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
