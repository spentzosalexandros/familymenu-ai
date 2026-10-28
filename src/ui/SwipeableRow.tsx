import { clsx } from 'clsx'
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as RMouseEvent, PointerEvent as RPointerEvent, ReactNode } from 'react'
import { VelocityTracker, getDeviceScale, haptic, project, rubberband, suppressNextClick } from './gestures'
import { prefersReducedMotion, spring } from './motion'

export type SwipeAction = {
  key: string
  label: string
  icon?: ReactNode
  /** CSS colour of the action, e.g. 'var(--primary)', 'var(--warning)', 'var(--danger)'. */
  color: string
  /** Text/icon colour (default white). */
  fg?: string
  onPress: () => void
}

export type SwipeableRowProps = {
  /** Revealed when swiping right (actions[0] is the outermost / full-swipe one). */
  leading?: SwipeAction[]
  /** Revealed when swiping left (actions[0] is the outermost / full-swipe one). */
  trailing?: SwipeAction[]
  /** Full swipe commits actions[0] of that side. Default true. */
  fullSwipe?: boolean
  className?: string
  /** Background behind the content while swiping (match the row background). */
  contentClassName?: string
  children: ReactNode
}

const ACTION_W = 76
let closeOpenRow: (() => void) | null = null

/**
 * iOS swipe actions: 1:1 drag with a 10 px direction lock, velocity projection,
 * rubber-band past the actions, full-swipe commit.
 */
export function SwipeableRow({ leading = [], trailing = [], fullSwipe = true, className, contentClassName, children }: SwipeableRowProps) {
  const x = useMotionValue(0)
  const ref = useRef<HTMLDivElement>(null)
  const g = useRef<{
    id: number
    sx: number
    sy: number
    start: number
    dragging: boolean
    decided: boolean
    tracker: VelocityTracker
  } | null>(null)
  const [openSide, setOpenSide] = useState<'leading' | 'trailing' | null>(null)
  const [armed, setArmed] = useState<'leading' | 'trailing' | null>(null)
  const width = () => (ref.current?.offsetWidth ?? 360)

  const settle = (to: number, velocity = 0) => {
    animate(x, to, { ...(Math.abs(velocity) > 400 ? spring.sheetFlick : spring.snappy), velocity })
    setOpenSide(to > 0 ? 'leading' : to < 0 ? 'trailing' : null)
  }
  const close = () => settle(0)

  useEffect(() => () => {
    if (closeOpenRow === close) closeOpenRow = null
  })

  const fullThreshold = () => width() * 0.62
  useMotionValueEvent(x, 'change', (v) => {
    if (!fullSwipe) return
    const side = v > 0 && leading.length ? 'leading' : v < 0 && trailing.length ? 'trailing' : null
    const isArmed = side && Math.abs(v) > fullThreshold() ? side : null
    if (isArmed !== armed) {
      if (isArmed) haptic(10)
      setArmed(isArmed)
    }
  })

  const commit = (side: 'leading' | 'trailing', velocity: number) => {
    const action = side === 'leading' ? leading[0] : trailing[0]
    const w = width()
    const to = side === 'leading' ? w : -w
    const reduce = prefersReducedMotion()
    animate(x, to, reduce ? { duration: 0.15 } : { ...spring.snappy, velocity }).then(() => {
      action.onPress()
      // Rows that stay (e.g. "Αλλαγή") slide back; rows removed by the action just unmount.
      setTimeout(() => settle(0), 120)
    })
    setOpenSide(null)
  }

  const onPointerDown = (e: RPointerEvent) => {
    if (e.button !== 0 || g.current) return
    if (closeOpenRow && closeOpenRow !== close) closeOpenRow()
    x.stop()
    g.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, start: x.get(), dragging: false, decided: false, tracker: new VelocityTracker() }
  }
  const onPointerMove = (e: RPointerEvent) => {
    const s = g.current
    if (!s || s.id !== e.pointerId) return
    const scale = getDeviceScale()
    const dx = (e.clientX - s.sx) / scale
    const dy = (e.clientY - s.sy) / scale
    if (!s.decided) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      s.decided = true
      s.dragging = Math.abs(dx) > Math.abs(dy)
      if (!s.dragging) {
        g.current = null
        return
      }
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      s.sx = e.clientX
      s.sy = e.clientY
    }
    if (!s.dragging) return
    s.tracker.add(e.clientX / scale, 0)
    const raw = s.start + (e.clientX - s.sx) / scale
    const maxL = leading.length ? (fullSwipe ? width() : leading.length * ACTION_W) : 0
    const maxT = trailing.length ? (fullSwipe ? width() : trailing.length * ACTION_W) : 0
    let v = raw
    if (raw > maxL) v = maxL + rubberband(raw - maxL, width(), 0.3)
    if (raw < -maxT) v = -maxT + rubberband(raw + maxT, width(), 0.3)
    x.set(v)
  }
  const onPointerUp = (e: RPointerEvent) => {
    const s = g.current
    g.current = null
    if (!s || !s.dragging) return
    suppressNextClick()
    const vx = s.tracker.velocity().x
    const cur = x.get()
    const projected = cur + project(vx, 0.99)
    if (fullSwipe && cur > fullThreshold() && leading.length && vx > -200) return commit('leading', vx)
    if (fullSwipe && cur < -fullThreshold() && trailing.length && vx < 200) return commit('trailing', vx)
    void e
    const lw = leading.length * ACTION_W
    const tw = trailing.length * ACTION_W
    let to = 0
    if (projected > lw / 2 && leading.length && vx >= -50) to = lw
    else if (projected < -tw / 2 && trailing.length && vx <= 50) to = -tw
    if (to !== 0) closeOpenRow = close
    settle(to, vx)
  }

  const onClickCapture = (e: RMouseEvent) => {
    if (openSide) {
      e.stopPropagation()
      e.preventDefault()
      close()
    }
  }

  return (
    <div ref={ref} className={clsx('relative overflow-hidden', className)}>
      {leading.length > 0 && <ActionTray side="leading" actions={leading} x={x} armed={armed === 'leading'} onClose={close} />}
      {trailing.length > 0 && <ActionTray side="trailing" actions={trailing} x={x} armed={armed === 'trailing'} onClose={close} />}
      <motion.div
        style={{ x, touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        className={clsx('relative z-[1]', contentClassName)}
      >
        {children}
      </motion.div>
    </div>
  )
}

function ActionTray({
  side,
  actions,
  x,
  armed,
  onClose,
}: {
  side: 'leading' | 'trailing'
  actions: SwipeAction[]
  x: MotionValue<number>
  armed: boolean
  onClose: () => void
}) {
  const w = useTransform(x, (v) => Math.max(0, side === 'leading' ? v : -v))
  const ordered = side === 'leading' ? actions : [...actions].reverse()
  return (
    <motion.div
      className={clsx('absolute inset-y-0 flex overflow-hidden', side === 'leading' ? 'left-0 flex-row' : 'right-0 flex-row')}
      style={{ width: w }}
    >
      {ordered.map((a) => {
        const primary = a === actions[0]
        return (
          <motion.button
            key={a.key}
            type="button"
            onClick={() => {
              a.onPress()
              onClose()
            }}
            className="relative flex min-w-0 flex-col items-center justify-center gap-1 overflow-hidden text-[13px] font-medium"
            style={{ background: a.color, color: a.fg ?? '#fff' }}
            initial={false}
            animate={{ flexGrow: armed ? (primary ? 1 : 0.0001) : 1 }}
            transition={spring.snappy}
          >
            <span className="flex flex-col items-center gap-1 px-2 whitespace-nowrap">
              {a.icon && <span className="text-[22px]">{a.icon}</span>}
              <span>{a.label}</span>
            </span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
