import { MinusIcon, PlusIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as RPointerEvent, ReactNode } from 'react'
import { clamp, getDeviceScale } from './gestures'
import { spring } from './motion'

// ---------------------------------------------------------------------------
// SegmentedControl
// ---------------------------------------------------------------------------
export type SegmentOption<V extends string> = { value: V; label: ReactNode; 'aria-label'?: string }
export type SegmentedControlProps<V extends string> = {
  options: SegmentOption<V>[]
  value: V
  onChange: (v: V) => void
  size?: 'sm' | 'md'
  className?: string
  'aria-label'?: string
}

/** iOS segmented control with a sliding thumb (spring). */
export function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  ...aria
}: SegmentedControlProps<V>) {
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  const n = options.length
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const d = e.key === 'ArrowRight' ? 1 : -1
      onChange(options[(index + d + n) % n].value)
    }
  }
  return (
    <div
      role="radiogroup"
      aria-label={aria['aria-label']}
      onKeyDown={onKey}
      className={clsx(
        'relative grid rounded-[9px] bg-fill-3 p-[2px] select-none',
        size === 'md' ? 'h-8' : 'h-7',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      <motion.div
        aria-hidden
        className="absolute top-[2px] bottom-[2px] left-[2px] rounded-[7px] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)] dark:bg-[#636366]"
        style={{ width: `calc((100% - 4px) / ${n})` }}
        initial={false}
        animate={{ x: `${index * 100}%` }}
        transition={spring.snappy}
      />
      {options.map((o, i) => {
        const active = i === index
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o['aria-label']}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={clsx(
              'relative z-[1] flex min-w-0 items-center justify-center gap-1 truncate px-2 text-label transition-[font-weight,opacity] duration-150 active:opacity-60',
              size === 'md' ? 'text-[13px]' : 'text-[12px]',
              active ? 'font-semibold' : 'font-medium',
              i > 0 && i !== index && i - 1 !== index && 'before:absolute before:top-[25%] before:bottom-[25%] before:left-0 before:w-px before:bg-separator before:content-[\'\']',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Switch
// ---------------------------------------------------------------------------
export type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

/** iOS toggle (51 × 31). The thumb stretches while pressed, like UISwitch. */
export function Switch({ checked, onChange, disabled, className, ...aria }: SwitchProps) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={aria['aria-label']}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className={clsx(
        'relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-200 disabled:opacity-40',
        checked ? 'bg-[var(--switch-on)]' : 'bg-fill',
        className,
      )}
    >
      <motion.span
        aria-hidden
        className="block h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)]"
        initial={false}
        animate={{ width: pressed ? 34 : 27, x: checked ? (pressed ? 13 : 20) : 0 }}
        transition={spring.snappy}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------
export type StepperProps = {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  /** ios: the classic − | + pill · inline: round buttons with the value in between. */
  variant?: 'ios' | 'inline'
  /** Formats the value in the inline variant. */
  format?: (v: number) => ReactNode
  /** Accessible name, e.g. "Μερίδες". */
  label?: string
  className?: string
}

export function Stepper({ value, onChange, min = 0, max = 99, step = 1, variant = 'ios', format, label, className }: StepperProps) {
  const dec = () => onChange(clamp(value - step, min, max))
  const inc = () => onChange(clamp(value + step, min, max))
  if (variant === 'inline') {
    const btn =
      "relative flex size-9 items-center justify-center rounded-full bg-fill-3 text-primary text-[17px] transition-[transform,opacity] duration-100 active:scale-90 active:opacity-70 disabled:opacity-30 disabled:text-label-3 before:absolute before:-inset-1 before:content-['']"
    return (
      <div className={clsx('inline-flex items-center gap-3', className)} role="group" aria-label={label}>
        <button type="button" className={btn} onClick={dec} disabled={value <= min} aria-label={`${label ?? ''} −`}>
          <MinusIcon weight="bold" />
        </button>
        <span className="min-w-[2ch] text-center text-headline tnum" aria-live="polite">
          {format ? format(value) : value}
        </span>
        <button type="button" className={btn} onClick={inc} disabled={value >= max} aria-label={`${label ?? ''} +`}>
          <PlusIcon weight="bold" />
        </button>
      </div>
    )
  }
  const half =
    "relative flex h-8 w-[47px] items-center justify-center text-[18px] text-label transition-colors duration-75 active:bg-fill-2 disabled:text-label-4 before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']"
  return (
    <div
      className={clsx('inline-flex items-center overflow-hidden rounded-[9px] bg-fill-3', className)}
      role="group"
      aria-label={label}
    >
      <button type="button" className={half} onClick={dec} disabled={value <= min} aria-label={`${label ?? ''} −`}>
        <MinusIcon weight="bold" />
      </button>
      <span className="h-[18px] w-px bg-separator" aria-hidden />
      <button type="button" className={half} onClick={inc} disabled={value >= max} aria-label={`${label ?? ''} +`}>
        <PlusIcon weight="bold" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------
export type SliderProps = {
  value: number
  onChange: (v: number) => void
  /** Fires once when the drag ends. */
  onChangeEnd?: (v: number) => void
  min?: number
  max?: number
  step?: number
  'aria-label'?: string
  /** Value text for screen readers, e.g. "140 €". */
  valueText?: string
  className?: string
}

/** iOS slider: 1:1 thumb tracking with pointer capture, keyboard arrows. */
export function Slider({ value, onChange, onChangeEnd, min = 0, max = 100, step = 1, valueText, className, ...aria }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startValue: number; moved: boolean } | null>(null)
  const latest = useRef(value)
  latest.current = value
  const pct = ((clamp(value, min, max) - min) / (max - min)) * 100
  const snap = (v: number) => clamp(Math.round((v - min) / step) * step + min, min, max)

  const valueAt = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect()
    const thumb = 28 * getDeviceScale()
    const x = (clientX - r.left - thumb / 2) / (r.width - thumb)
    return snap(min + clamp(x, 0, 1) * (max - min))
  }
  const onPointerDown = (e: RPointerEvent) => {
    if (e.button !== 0) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const target = e.target as HTMLElement
    const onThumb = !!target.closest('[data-thumb]')
    // Respect the grab offset when the thumb itself is grabbed; jump when the track is tapped.
    const start = onThumb ? value : valueAt(e.clientX)
    if (!onThumb) onChange(start)
    drag.current = { startX: e.clientX, startValue: start, moved: false }
  }
  const onPointerMove = (e: RPointerEvent) => {
    const d = drag.current
    if (!d) return
    const r = trackRef.current!.getBoundingClientRect()
    const thumb = 28 * getDeviceScale()
    const dv = ((e.clientX - d.startX) / (r.width - thumb)) * (max - min)
    d.moved = true
    const v = snap(d.startValue + dv)
    if (v !== latest.current) onChange(v)
  }
  const onPointerUp = () => {
    if (drag.current) onChangeEnd?.(latest.current)
    drag.current = null
  }
  const onKeyDown = (e: KeyboardEvent) => {
    const big = (max - min) / 10
    const map: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: big,
      PageDown: -big,
    }
    if (e.key in map) {
      e.preventDefault()
      const v = snap(value + map[e.key])
      onChange(v)
      onChangeEnd?.(v)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      const v = e.key === 'Home' ? min : max
      onChange(v)
      onChangeEnd?.(v)
    }
  }
  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={aria['aria-label']}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={clsx('relative h-11 cursor-pointer touch-none select-none', className)}
    >
      <div className="absolute top-1/2 right-[14px] left-[14px] h-1 -translate-y-1/2 rounded-full bg-fill">
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <div
        data-thumb
        className="absolute top-1/2 size-7 -translate-y-1/2 rounded-full bg-white shadow-[0_0.5px_4px_rgba(0,0,0,0.12),0_6px_13px_rgba(0,0,0,0.12)] transition-transform duration-100 active:scale-110"
        style={{ left: `calc(${pct / 100} * (100% - 28px))` }}
      />
    </div>
  )
}
