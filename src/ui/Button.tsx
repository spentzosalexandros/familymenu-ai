import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive'
export type ButtonTone = 'primary' | 'accent' | 'danger' | 'success' | 'label'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: ButtonVariant
  tone?: ButtonTone
  size?: ButtonSize
  /** Leading icon (Phosphor element). */
  icon?: ReactNode
  iconRight?: ReactNode
  /** Stretch to the container width. */
  full?: boolean
  loading?: boolean
  children?: ReactNode
}

const TONE: Record<ButtonTone, { filled: string; tinted: string; text: string }> = {
  primary: { filled: 'bg-primary text-on-primary', tinted: 'bg-primary-tint text-primary', text: 'text-primary' },
  accent: { filled: 'bg-accent text-on-accent', tinted: 'bg-accent-tint text-accent-ink', text: 'text-accent-ink' },
  danger: { filled: 'bg-danger text-white', tinted: 'bg-danger-tint text-danger', text: 'text-danger' },
  success: { filled: 'bg-success text-white', tinted: 'bg-success-tint text-success', text: 'text-success' },
  label: { filled: 'bg-label text-bg', tinted: 'bg-fill-3 text-label', text: 'text-label' },
}

const SIZE: Record<ButtonSize, string> = {
  // 34 px visual, 44 px hit area through the ::before extension
  sm: "h-[34px] px-3.5 gap-1 rounded-full text-subhead font-semibold before:absolute before:-inset-y-[5px] before:-inset-x-0.5 before:content-['']",
  md: 'h-11 px-5 gap-1.5 rounded-[12px] text-[17px] font-semibold',
  lg: 'h-[52px] px-6 gap-2 rounded-[14px] text-headline',
}

/**
 * iOS button. Feedback on pointer-down (scale 0.97 + slight dim), 44 px minimum hit area.
 *   <Button variant="filled" size="lg" full onClick={…}>Ξεκινάμε</Button>
 *   <Button variant="tinted" icon={<ArrowsClockwiseIcon />}>Αλλαγή</Button>
 */
export function Button({
  variant = 'filled',
  tone = 'primary',
  size = 'md',
  icon,
  iconRight,
  full,
  loading,
  className,
  children,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  const t = variant === 'destructive' ? TONE.danger : TONE[tone]
  const look =
    variant === 'filled' || variant === 'destructive'
      ? t.filled
      : variant === 'tinted'
        ? t.tinted
        : variant === 'gray'
          ? clsx('bg-fill-3', t.text)
          : clsx('bg-transparent', t.text)
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none',
        'transition-[transform,opacity,filter] duration-100 ease-out active:scale-[0.97] active:opacity-80',
        'disabled:pointer-events-none disabled:opacity-40',
        variant === 'plain' && size !== 'lg' && 'px-2',
        SIZE[size],
        look,
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="size-5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      ) : (
        icon && <span className="-ml-0.5 flex text-[1.15em]">{icon}</span>
      )}
      {children != null && <span className="truncate">{children}</span>}
      {iconRight && <span className="-mr-0.5 flex text-[1.1em]">{iconRight}</span>}
    </button>
  )
}

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  /** Accessible label (required: icon-only). */
  label: string
  icon: ReactNode
  /** gray: filled circle · plain: icon only · material: translucent circle over images · tinted · filled */
  variant?: 'gray' | 'plain' | 'material' | 'tinted' | 'filled'
  /** Visual diameter in px (hit area is always ≥ 44). */
  size?: number
}

/** Circular icon button with a 44 × 44 hit area. */
export function IconButton({
  label,
  icon,
  variant = 'gray',
  size = 30,
  className,
  type = 'button',
  style,
  ...rest
}: IconButtonProps) {
  const look = {
    gray: 'bg-fill-3 text-label-2',
    plain: 'text-primary',
    material: 'material-regular text-label shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
    tinted: 'bg-primary-tint text-primary',
    filled: 'bg-primary text-on-primary',
  }[variant]
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(
        'relative inline-flex shrink-0 items-center justify-center rounded-full select-none',
        "transition-[transform,opacity] duration-100 ease-out active:scale-[0.92] active:opacity-70 disabled:opacity-40",
        "before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
        look,
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.56), ...style }}
      {...rest}
    >
      {icon}
    </button>
  )
}
