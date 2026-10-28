import { animate, motion, motionValue, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent, WheelEvent as RWheelEvent } from 'react'
import type { Detent, Presented } from '../store'
import { getState, useAppStore } from '../store'
import { VelocityTracker, clamp, getDeviceScale, project, rubberband, suppressNextClick } from '../ui/gestures'
import { fade, spring } from '../ui/motion'
import { useDevice } from './device'
import { RouteBoundary } from './ErrorBoundary'
import { MODALS, SHEETS } from './registry'
import { ScreenCtx } from './screen-context'
import type { ScreenCtxValue } from './screen-context'

type Item = { p: Presented; closing: boolean }
type SheetP = Extract<Presented, { kind: 'sheet' }>
type ModalP = Extract<Presented, { kind: 'modal' }>

const ZERO = motionValue(0)

/**
 * Renders the presentation stack (sheets + full-screen modals) in order.
 * `base` receives the first sheet's presentation progress (0–1): the app shell uses it for the
 * iOS "presenting screen scales back" effect.
 */
export function PresentationHost({ base }: { base: MotionValue<number> }) {
  const presented = useAppStore((s) => s.presented)
  const [items, setItems] = useState<Item[]>(() => presented.map((p) => ({ p, closing: false })))
  const [prev, setPrev] = useState(presented)
  if (presented !== prev) {
    setPrev(presented)
    const keys = new Set(presented.map((p) => p.key))
    const merged: Item[] = items.map((it) => (keys.has(it.p.key) || it.closing ? it : { ...it, closing: true }))
    for (const p of presented) if (!items.some((it) => it.p.key === p.key)) merged.push({ p, closing: false })
    setItems(merged)
  }

  const progress = useRef(new Map<string, MotionValue<number>>())
  const progressOf = (key: string) => {
    let m = progress.current.get(key)
    if (!m) progress.current.set(key, (m = motionValue(0)))
    return m
  }

  // The shell follows the first item's progress when it is a sheet.
  useLayoutEffect(() => {
    const first = items[0]
    if (!first || first.p.kind !== 'sheet') {
      animate(base, 0, { duration: 0.2 })
      return
    }
    const mv = progressOf(first.p.key)
    base.set(mv.get())
    return mv.on('change', (v) => base.set(v))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, base])

  const onExited = useCallback((key: string) => {
    progress.current.delete(key)
    setItems((its) => its.filter((it) => it.p.key !== key))
  }, [])

  const topKey = [...items].reverse().find((it) => !it.closing)?.p.key
  return (
    <>
      {items.map((it, i) => {
        const above = items[i + 1]
        const under = above && above.p.kind === 'sheet' ? progressOf(above.p.key) : ZERO
        const z = 30 + i
        return it.p.kind === 'sheet' ? (
          <Sheet
            key={it.p.key}
            item={it.p}
            closing={it.closing}
            isTop={it.p.key === topKey}
            progress={progressOf(it.p.key)}
            under={under}
            z={z}
            onExited={onExited}
          />
        ) : (
          <Modal key={it.p.key} item={it.p} closing={it.closing} isTop={it.p.key === topKey} under={under} z={z} onExited={onExited} />
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// Sheet
// ---------------------------------------------------------------------------
type SheetProps = {
  item: SheetP
  closing: boolean
  isTop: boolean
  progress: MotionValue<number>
  under: MotionValue<number>
  z: number
  onExited: (key: string) => void
}

function Sheet({ item, closing, isTop, progress, under, z, onExited }: SheetProps) {
  const { height: H, safeBottom } = useDevice()
  const reduce = useReducedMotion()
  const panelH = Math.round(H * 0.92)
  const mediumH = Math.round(H * 0.55)
  const closedY = panelH + 24
  const snapOf = useCallback((d: Detent) => (d === 'large' ? 0 : panelH - mediumH), [panelH, mediumH])
  const snaps = useMemo(() => item.detents.map(snapOf), [item.detents, snapOf])
  const hasMedium = item.detents.includes('medium')

  const y = useMotionValue(reduce ? snapOf(item.initial) : closedY)
  const opacity = useMotionValue(reduce ? 0 : 1)
  const [detent, setDetent] = useState<Detent>(item.initial)
  const [dragging, setDragging] = useState(false)
  const releaseVelocity = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // progress (drives the layer underneath) + scrim
  useEffect(() => {
    const sync = (v: number) => {
      const visible = panelH - v
      const p = hasMedium ? (visible - mediumH) / (panelH - mediumH) : visible / panelH
      progress.set(clamp(p, 0, 1) * opacity.get())
    }
    sync(y.get())
    const u1 = y.on('change', sync)
    const u2 = opacity.on('change', () => sync(y.get()))
    return () => {
      u1()
      u2()
    }
  }, [y, opacity, panelH, mediumH, hasMedium, progress])
  const scrim = useTransform([y, opacity], ([v, o]: number[]) => {
    const visible = panelH - v
    return clamp(visible / (hasMedium ? mediumH : panelH), 0, 1) * o
  })

  // present
  useEffect(() => {
    if (reduce) {
      animate(opacity, 1, fade)
    } else {
      animate(y, snapOf(item.initial), spring.sheet)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // dismiss
  useEffect(() => {
    if (!closing) return
    const v = releaseVelocity.current
    const ctl = reduce
      ? animate(opacity, 0, fade)
      : animate(y, closedY, v > 0 ? { ...spring.sheetFlick, bounce: 0, velocity: v } : { type: 'spring', bounce: 0, duration: 0.36 })
    ;(ctl as unknown as Promise<void>).then?.(() => onExited(item.key))
    return () => ctl.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing])

  const requestClose = useCallback(
    (velocity = 0) => {
      releaseVelocity.current = velocity
      getState().dismiss(item.key)
    },
    [item.key],
  )

  const settleTo = useCallback(
    (target: number, velocity: number) => {
      const d: Detent = target === 0 ? 'large' : 'medium'
      setDetent(item.detents.includes(d) ? d : item.detents[0])
      animate(y, target, Math.abs(velocity) > 300 ? { ...spring.sheetFlick, velocity } : { ...spring.sheet, velocity })
    },
    [item.detents, y],
  )
  const expand = useCallback(() => {
    if (item.detents.includes('large')) settleTo(0, 0)
  }, [item.detents, settleTo])

  // Esc closes the top sheet.
  useEffect(() => {
    if (!isTop || closing) return
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && item.dismissible && !getState().alert) requestClose()
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [isTop, closing, item.dismissible, requestClose])

  // ---------------- drag ----------------
  const drag = useRef<{ start: number; startPointer: number; tracker: VelocityTracker } | null>(null)
  const beginDrag = (clientY: number) => {
    y.stop()
    drag.current = { start: y.get(), startPointer: clientY, tracker: new VelocityTracker() }
    setDragging(true)
  }
  const moveDrag = (clientY: number) => {
    const d = drag.current
    if (!d) return
    const scale = getDeviceScale()
    d.tracker.add(0, clientY / scale)
    const raw = d.start + (clientY - d.startPointer) / scale
    const maxSnap = Math.max(...snaps)
    let v = raw
    if (raw < 0) v = rubberband(raw, H)
    else if (!item.dismissible && raw > maxSnap) v = maxSnap + rubberband(raw - maxSnap, H)
    y.set(v)
  }
  const endDrag = () => {
    const d = drag.current
    drag.current = null
    setDragging(false)
    if (!d) return
    const v = d.tracker.velocity().y
    const cur = y.get()
    const projected = cur + project(v)
    const targets = item.dismissible ? [...snaps, closedY] : [...snaps]
    let target = targets.reduce((a, b) => (Math.abs(b - projected) < Math.abs(a - projected) ? b : a))
    // Respect the direction of a confident flick.
    if (v > 400 && target < cur) target = targets.filter((t) => t > cur).sort((a, b) => a - b)[0] ?? target
    if (v < -400 && target > cur) target = targets.filter((t) => t < cur).sort((a, b) => b - a)[0] ?? target
    if (target === closedY) requestClose(Math.max(0, v))
    else settleTo(target, v)
  }

  // Mouse / pen: pointer events (window listeners, so the drag keeps tracking outside the panel).
  // Touch: touch events below (so we can claim the gesture before native scrolling starts).
  const canDragContent = (dy: number) => {
    const sc = scrollRef.current
    const atTop = !sc || sc.scrollTop <= 0
    const notAtLargest = y.get() > 1
    return (dy > 0 && atTop) || (dy < 0 && notAtLargest)
  }
  const isHandle = (t: EventTarget | null) => {
    const el = t as HTMLElement | null
    return !!el?.closest?.('[data-sheet-handle]') || !scrollRef.current?.contains(el)
  }
  const onPointerDownCapture = (e: RPointerEvent) => {
    if (e.pointerType === 'touch' || e.button !== 0 || closing || drag.current) return
    const tgt = e.target as HTMLElement
    if (tgt.closest('input,textarea,select,[role="slider"],[data-no-sheet-drag]')) return
    const start = { id: e.pointerId, x: e.clientX, y: e.clientY, handle: isHandle(e.target) }
    let decided = false
    let active = false
    const cleanup = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      document.documentElement.style.userSelect = ''
    }
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== start.id) return
      if (!decided) {
        const dx = ev.clientX - start.x
        const dy = ev.clientY - start.y
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
        decided = true
        if (Math.abs(dy) <= Math.abs(dx) || (!start.handle && !canDragContent(dy))) return cleanup()
        active = true
        window.getSelection()?.removeAllRanges()
        document.documentElement.style.userSelect = 'none'
        beginDrag(start.y)
      }
      moveDrag(ev.clientY)
    }
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== start.id) return
      cleanup()
      if (active) {
        suppressNextClick()
        endDrag()
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    let t: { id: number; x: number; y: number; handle: boolean; state: 'pending' | 'drag' | 'ignore' } | null = null
    const onStart = (e: TouchEvent) => {
      if (t || e.touches.length > 1) return
      const touch = e.changedTouches[0]
      const tgt = e.target as HTMLElement
      if (tgt.closest('input,textarea,select,[role="slider"],[data-no-sheet-drag]')) return
      t = { id: touch.identifier, x: touch.clientX, y: touch.clientY, handle: isHandle(e.target), state: 'pending' }
    }
    const onMove = (e: TouchEvent) => {
      if (!t) return
      const touch = [...e.changedTouches].find((x) => x.identifier === t!.id)
      if (!touch) return
      if (t.state === 'pending') {
        const dx = touch.clientX - t.x
        const dy = touch.clientY - t.y
        if (Math.abs(dx) > Math.abs(dy) || (!t.handle && !canDragContent(dy))) {
          t.state = 'ignore'
          return
        }
        t.state = 'drag'
        beginDrag(t.y)
      }
      if (t.state === 'drag') {
        if (e.cancelable) e.preventDefault()
        moveDrag(touch.clientY)
      }
    }
    const onEnd = (e: TouchEvent) => {
      if (!t || ![...e.changedTouches].some((x) => x.identifier === t!.id)) return
      const wasDrag = t.state === 'drag'
      t = null
      if (wasDrag) endDrag()
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snaps, item.dismissible])

  // Wheel up in the medium detent expands the sheet (desktop).
  const onWheel = (e: RWheelEvent) => {
    if (e.deltaY > 8 && y.get() > 1 && item.detents.includes('large')) expand()
  }

  // Being pushed back by a sheet above.
  const backScale = useTransform(under, (p) => 1 - 0.06 * p)
  const backY = useTransform(under, (p) => -10 * p)
  const backDim = useTransform(under, (p) => 0.18 * p)

  const ctx = useMemo<ScreenCtxValue>(
    () => ({
      container: 'sheet',
      routeKey: item.key,
      depth: 0,
      isTop,
      setTitle: () => {},
      close: () => requestClose(),
      bottomInset: safeBottom,
      sheet: { detent, detents: item.detents, expand, scrollRef },
    }),
    [item.key, item.detents, isTop, requestClose, safeBottom, detent, expand],
  )
  const Content = SHEETS[item.id]

  return (
    <div className="absolute inset-0" style={{ zIndex: z, pointerEvents: closing ? 'none' : undefined }}>
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ opacity: scrim, background: 'var(--scrim)' }}
        onClick={() => item.dismissible && requestClose()}
      />
      <motion.div className="absolute inset-x-0 bottom-0" style={{ height: panelH, scale: backScale, y: backY, transformOrigin: 'top center' }}>
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          data-elevated
          className="absolute inset-0 overflow-hidden rounded-t-[14px] bg-bg-grouped shadow-[0_-1px_0_rgba(255,255,255,0.04),0_-10px_40px_rgba(0,0,0,0.18)]"
          style={{ y, opacity, userSelect: dragging ? 'none' : undefined, willChange: 'transform' }}
          onPointerDownCapture={onPointerDownCapture}
          onWheel={onWheel}
        >
          <div ref={scrollRef} className="ios-scroll absolute inset-0" style={{ overflowY: dragging ? 'hidden' : undefined }}>
            <ScreenCtx.Provider value={ctx}>
              <RouteBoundary name={`sheet:${item.id}`} onClose={() => requestClose()} fallback={<div className="h-40" />}>
                <Content {...item.params} />
              </RouteBoundary>
            </ScreenCtx.Provider>
          </div>
          {/* grabber */}
          <div data-sheet-handle aria-hidden className="absolute inset-x-0 top-0 z-30 flex h-4 justify-center pt-[5px]">
            <span className="h-[5px] w-9 rounded-full bg-label-3" />
          </div>
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-40 bg-black" style={{ opacity: backDim }} />
        </motion.div>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Full-screen modal (slides up)
// ---------------------------------------------------------------------------
function Modal({
  item,
  closing,
  isTop,
  under,
  z,
  onExited,
}: {
  item: ModalP
  closing: boolean
  isTop: boolean
  under: MotionValue<number>
  z: number
  onExited: (key: string) => void
}) {
  const { height: H, safeBottom } = useDevice()
  const reduce = useReducedMotion()
  const y = useMotionValue(reduce ? 0 : H)
  const opacity = useMotionValue(reduce ? 0 : 1)
  useEffect(() => {
    if (reduce) animate(opacity, 1, fade)
    else animate(y, 0, spring.sheet)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (!closing) return
    const ctl = reduce ? animate(opacity, 0, fade) : animate(y, H, { type: 'spring', bounce: 0, duration: 0.38 })
    ;(ctl as unknown as Promise<void>).then?.(() => onExited(item.key))
    return () => ctl.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing])
  const close = useCallback(() => getState().dismiss(item.key), [item.key])
  useEffect(() => {
    if (!isTop || closing) return
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !getState().alert) close()
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [isTop, closing, close])
  const backScale = useTransform(under, (p) => 1 - 0.06 * p)
  const backR = useTransform(under, (p) => 12 * p)
  const ctx = useMemo<ScreenCtxValue>(
    () => ({ container: 'modal', routeKey: item.key, depth: 0, isTop, setTitle: () => {}, close, bottomInset: safeBottom }),
    [item.key, isTop, close, safeBottom],
  )
  const Content = MODALS[item.id]
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 overflow-hidden bg-bg-grouped"
      style={{ zIndex: z, y, opacity, scale: backScale, borderRadius: backR, transformOrigin: 'top center', pointerEvents: closing ? 'none' : undefined }}
    >
      <ScreenCtx.Provider value={ctx}>
        <RouteBoundary name={`modal:${item.id}`} onClose={close}>
          <Content {...item.params} />
        </RouteBoundary>
      </ScreenCtx.Provider>
    </motion.div>
  )
}
