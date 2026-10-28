import { clsx } from 'clsx'
import { useRef } from 'react'
import type { MouseEvent as RMouseEvent, PointerEvent as RPointerEvent } from 'react'
import { formatClock } from '../i18n'
import { useAppStore } from '../store'
import { haptic, suppressNextClick } from '../ui/gestures'
import { BatteryGlyph, SignalGlyph, STATUS_BAR_H, WifiGlyph, useDevice } from './device'
import { openPresenterSheet } from './journeys'

/** Long-press on the clock (500 ms) opens the presenter controls as a sheet. */
function useClockLongPress() {
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const clear = () => {
    window.clearTimeout(timer.current)
    start.current = null
  }
  return {
    onPointerDown: (e: RPointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY }
      timer.current = window.setTimeout(() => {
        start.current = null
        haptic(15)
        suppressNextClick()
        openPresenterSheet()
      }, 500)
    },
    onPointerMove: (e: RPointerEvent) => {
      const s = start.current
      if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) clear()
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    onContextMenu: (e: RMouseEvent) => e.preventDefault(),
  }
}

/** iOS status bar (time from the demo clock, signal, Wi-Fi, battery). */
export function StatusBar({ tone }: { tone: 'light' | 'dark' }) {
  const minutes = useAppStore((s) => s.clock.minutes)
  const { fakeChrome, safeTop } = useDevice()
  const lp = useClockLongPress()
  if (!fakeChrome) {
    // Real device with its own status bar: an invisible long-press zone over the clock.
    return (
      <div
        aria-hidden
        className="absolute top-0 left-0 z-[90] w-[38%]"
        style={{ height: safeTop, WebkitTouchCallout: 'none' }}
        {...lp}
      />
    )
  }
  return (
    <div
      className={clsx(
        'pointer-events-none absolute inset-x-0 top-0 z-[90] flex items-start justify-between transition-colors duration-300 select-none',
        tone === 'light' ? 'text-white' : 'text-black',
      )}
      style={{ height: STATUS_BAR_H }}
    >
      <div className="flex h-full w-[calc(50%-62px)] items-center justify-center pt-[3px]">
        <span
          role="timer"
          aria-label={formatClock(minutes)}
          className="pointer-events-auto cursor-default rounded-full px-2 py-1 text-[17px] leading-[22px] font-semibold tracking-[-0.02em] tnum"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter Variable", system-ui, sans-serif' }}
          {...lp}
        >
          {formatClock(minutes)}
        </span>
      </div>
      <div className="flex h-full w-[calc(50%-62px)] items-center justify-center gap-[7px] pt-[3px]">
        <SignalGlyph />
        <WifiGlyph />
        <BatteryGlyph level={0.82} />
      </div>
    </div>
  )
}

export function HomeIndicator({ tone }: { tone: 'light' | 'dark' }) {
  const { fakeChrome } = useDevice()
  if (!fakeChrome) return null
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[95] flex h-[34px] items-end justify-center pb-2">
      <span className={clsx('h-[5px] w-[139px] rounded-full transition-colors duration-300', tone === 'light' ? 'bg-white' : 'bg-black')} />
    </div>
  )
}
