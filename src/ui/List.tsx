import { CaretRightIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type ListGroupProps = {
  /** Small header above the group (sentence case — never all-caps Greek). */
  header?: ReactNode
  /** Footnote below the group. */
  footer?: ReactNode
  /** Inset grouped (rounded, 16 px margins). false → edge-to-edge plain list. */
  inset?: boolean
  className?: string
  children: ReactNode
}

/** iOS inset-grouped list container. Put <ListRow>s inside. */
export function ListGroup({ header, footer, inset = true, className, children }: ListGroupProps) {
  return (
    <section className={clsx(inset && 'mx-4', className)}>
      {header && <div className="px-4 pb-1.5 text-footnote text-label-2">{header}</div>}
      <div
        role="list"
        className={clsx('overflow-hidden bg-bg-grouped-2', inset ? 'rounded-[12px]' : 'hairline-t hairline-b')}
      >
        {children}
      </div>
      {footer && <div className="px-4 pt-1.5 text-footnote text-label-2">{footer}</div>}
    </section>
  )
}

export type ListRowProps = {
  title: ReactNode
  subtitle?: ReactNode
  /** Leading element: an icon (rendered in a coloured rounded square when iconBg is set), emoji or avatar. */
  icon?: ReactNode
  /** Background of the Settings-style icon square, e.g. 'var(--primary)' or '#FF9500'. */
  iconBg?: string
  /** Secondary value on the right (gray). */
  value?: ReactNode
  /** Custom trailing control (Switch, Badge …). */
  accessory?: ReactNode
  /** Show a disclosure chevron (defaults to true when onPress is set and no accessory). */
  chevron?: boolean
  onPress?: () => void
  destructive?: boolean
  /** Tinted title (e.g. "Προσθήκη…" action rows). */
  tinted?: boolean
  disabled?: boolean
  className?: string
  /** Extra content under the row (rare). */
  children?: ReactNode
  'aria-label'?: string
}

/** A row of an inset-grouped list. Highlights on touch-down like UITableViewCell. */
export function ListRow({
  title,
  subtitle,
  icon,
  iconBg,
  value,
  accessory,
  chevron,
  onPress,
  destructive,
  tinted,
  disabled,
  className,
  children,
  ...aria
}: ListRowProps) {
  const showChevron = chevron ?? (!!onPress && !accessory)
  const hasIcon = icon != null
  const body = (
    <>
      {hasIcon && (
        <span
          className={clsx(
            'flex shrink-0 items-center justify-center',
            iconBg ? 'size-[29px] rounded-[7px] text-[18px] text-white' : 'min-w-[29px] text-[22px] text-primary',
          )}
          style={iconBg ? { background: iconBg } : undefined}
          aria-hidden
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 items-center gap-3 self-stretch py-[11px]">
        <span className="min-w-0 flex-1">
          <span
            className={clsx(
              'block text-body',
              destructive ? 'text-danger' : tinted ? 'text-primary' : 'text-label',
            )}
          >
            {title}
          </span>
          {subtitle && <span className="mt-0.5 block text-subhead text-label-2">{subtitle}</span>}
        </span>
        {value != null && <span className="shrink-0 text-body text-label-2 tnum">{value}</span>}
        {accessory && <span className="flex shrink-0 items-center">{accessory}</span>}
        {showChevron && <CaretRightIcon weight="bold" className="-mr-1 shrink-0 text-[14px] text-label-3" aria-hidden />}
      </span>
      {/* separator, inset to the text like iOS */}
      <span
        aria-hidden
        className={clsx(
          'pointer-events-none absolute right-0 bottom-0 h-px origin-bottom scale-y-50 bg-separator',
          '[.list-row:last-child>&]:hidden',
          hasIcon ? 'left-[57px]' : 'left-4',
        )}
      />
      {children}
    </>
  )
  const base = clsx('list-row relative flex min-h-11 w-full items-center gap-3 pl-4 pr-4 text-left', className)
  if (onPress) {
    return (
      <button
        type="button"
        role="listitem"
        onClick={onPress}
        disabled={disabled}
        aria-label={aria['aria-label']}
        className={clsx(base, 'transition-colors duration-75 active:bg-fill-3 disabled:opacity-40')}
      >
        {body}
      </button>
    )
  }
  return (
    <div role="listitem" className={clsx(base, disabled && 'opacity-40')} aria-label={aria['aria-label']}>
      {body}
    </div>
  )
}
