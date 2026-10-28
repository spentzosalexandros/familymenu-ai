import { animate, motion, motionValue, useReducedMotion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { useLang } from '../i18n'
import { translate } from '../i18n/format'
import type { Params, PushScreenId, TabId } from '../store'
import { getState, useAppStore } from '../store'
import { VelocityTracker, getDeviceScale, project, rubberband, suppressNextClick } from '../ui/gestures'
import { fade, spring } from '../ui/motion'
import { TAB_BAR_H, useDevice } from './device'
import { RouteBoundary } from './ErrorBoundary'
import { PUSH_SCREENS, TAB_ROOTS } from './registry'
import { ScreenCtx } from './screen-context'
import type { ScreenCtxValue } from './screen-context'

type Layer = { key: string; screen: PushScreenId | null; params: Params; exiting: boolean }
type LayerMV = { x: MotionValue<number>; disp: MotionValue<number>; dim: MotionValue<number>; opacity: MotionValue<number>; anim?: { stop: () => void } }

const PARALLAX = 0.3
const DIM = 0.12
const EDGE = 28

/** One tab's navigation stack: root + pushed screens, iOS push/pop and interactive edge-swipe back. */
export function NavStack({ tab, active }: { tab: TabId; active: boolean }) {
  const entries = useAppStore((s) => s.stacks[tab])
  const rootParams = useAppStore((s) => s.rootParams[tab])
  const { width, safeBottom } = useDevice()
  const reduce = useReducedMotion()
  const lang = useLang()

  const mvs = useRef(new Map<string, LayerMV>())
  const getMV = (key: string) => {
    let m = mvs.current.get(key)
    if (!m) {
      m = { x: motionValue(0), disp: motionValue(0), dim: motionValue(0), opacity: motionValue(1) }
      mvs.current.set(key, m)
    }
    return m
  }
  const instant = useRef(new Set<string>())
  const known = useRef(new Set<string>(entries.map((e) => e.key)))

  const [layers, setLayers] = useState<Layer[]>(() => entries.map((e) => ({ ...e, exiting: false })))
  const [prevEntries, setPrevEntries] = useState(entries)
  if (entries !== prevEntries) {
    setPrevEntries(entries)
    const keys = new Set(entries.map((e) => e.key))
    const removed = layers.filter((l) => !keys.has(l.key) && !l.exiting && !instant.current.has(l.key))
    const stillExiting = layers.filter((l) => l.exiting && !keys.has(l.key))
    const topRemoved = removed[removed.length - 1]
    const next: Layer[] = entries.map((e) => ({ key: e.key, screen: e.screen, params: e.params, exiting: false }))
    setLayers([...next, ...stillExiting, ...(topRemoved ? [{ ...topRemoved, exiting: true }] : [])])
  }

  const rootKey = `root-${tab}`
  const all = useMemo<Layer[]>(() => [{ key: rootKey, screen: null, params: rootParams ?? {}, exiting: false }, ...layers], [layers, rootKey, rootParams])

  // Enter / exit animations.
  useLayoutEffect(() => {
    for (const l of layers) {
      const m = getMV(l.key)
      if (!l.exiting && !known.current.has(l.key)) {
        known.current.add(l.key)
        m.anim?.stop()
        if (reduce) {
          m.x.set(0)
          m.opacity.set(0)
          m.anim = animate(m.opacity, 1, fade)
        } else {
          m.x.set(width)
          m.anim = animate(m.x, 0, spring.push)
        }
      }
      if (l.exiting && !(m as LayerMV & { leaving?: boolean }).leaving) {
        ;(m as LayerMV & { leaving?: boolean }).leaving = true
        m.anim?.stop()
        const done = () => {
          mvs.current.delete(l.key)
          known.current.delete(l.key)
          setLayers((ls) => ls.filter((x) => x.key !== l.key))
        }
        if (reduce) m.anim = animate(m.opacity, 0, fade)
        else m.anim = animate(m.x, width, spring.push)
        ;(m.anim as unknown as Promise<void>).then?.(done)
      }
    }
    // Interactively popped layers are already off-screen: forget them.
    for (const k of instant.current) {
      if (!layers.some((l) => l.key === k)) {
        instant.current.delete(k)
        mvs.current.delete(k)
        known.current.delete(k)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers])

  // Parallax + dim of the screen underneath follow the top screen's x.
  useLayoutEffect(() => {
    const unsubs: (() => void)[] = []
    all.forEach((l, i) => {
      const m = getMV(l.key)
      const above = all[i + 1]
      if (above) {
        const a = getMV(above.key)
        const sync = (v: number) => {
          const p = Math.max(0, Math.min(1, v / width))
          m.disp.set(reduce ? 0 : (p - 1) * PARALLAX * width)
          m.dim.set(reduce ? 0 : (1 - p) * DIM)
        }
        sync(a.x.get())
        unsubs.push(a.x.on('change', sync))
      } else {
        m.disp.set(m.x.get())
        m.dim.set(0)
        unsubs.push(m.x.on('change', (v) => m.disp.set(v)))
      }
    })
    return () => unsubs.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, width, reduce])

  // Titles (for the back button of the next screen).
  const [titles, setTitles] = useState<Record<string, string>>({})
  const setTitleFor = useCallback((key: string, title: string) => {
    setTitles((t) => (t[key] === title ? t : { ...t, [key]: title }))
  }, [])

  const topIndex = all.length - 1
  const interactiveIndex = (() => {
    for (let i = all.length - 1; i >= 0; i--) if (!all[i].exiting) return i
    return 0
  })()

  const commitPop = useCallback(
    (key: string) => {
      instant.current.add(key)
      getState().pop(tab)
    },
    [tab],
  )

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ visibility: active ? 'visible' : 'hidden' }}
      inert={!active}
      aria-hidden={!active}
    >
      {all.map((l, i) => {
        const prev = all[i - 1]
        const prevTitle = prev ? titles[prev.key] ?? (i === 1 ? translate(TAB_ROOTS[tab].title, lang) : undefined) : undefined
        return (
          <StackLayer
            key={l.key}
            layer={l}
            tab={tab}
            depth={i}
            mv={getMV(l.key)}
            isTop={i === interactiveIndex}
            visible={active && (i >= topIndex - 1 || i === interactiveIndex || i === interactiveIndex - 1)}
            prevTitle={prevTitle}
            setTitleFor={setTitleFor}
            bottomInset={TAB_BAR_H + safeBottom}
            width={width}
            onCommitPop={commitPop}
          />
        )
      })}
    </div>
  )
}

type StackLayerProps = {
  layer: Layer
  tab: TabId
  depth: number
  mv: LayerMV
  isTop: boolean
  visible: boolean
  prevTitle?: string
  setTitleFor: (key: string, title: string) => void
  bottomInset: number
  width: number
  onCommitPop: (key: string) => void
}

const StackLayer = memo(function StackLayer({
  layer,
  tab,
  depth,
  mv,
  isTop,
  visible,
  prevTitle,
  setTitleFor,
  bottomInset,
  width,
  onCommitPop,
}: StackLayerProps) {
  const { key, screen, params } = layer
  const setTitle = useCallback((t: string) => setTitleFor(key, t), [key, setTitleFor])
  const close = useCallback(() => {
    if (depth > 0) getState().pop(tab)
  }, [depth, tab])
  const ctx = useMemo<ScreenCtxValue>(
    () => ({ container: 'stack', tab, routeKey: key, depth, isTop, prevTitle, setTitle, close, bottomInset }),
    [tab, key, depth, isTop, prevTitle, setTitle, close, bottomInset],
  )
  const Component = screen ? PUSH_SCREENS[screen] : TAB_ROOTS[tab].component

  // ---- interactive edge-swipe back ----
  const g = useRef<{ id: number; sx: number; sy: number; start: number; decided: boolean; active: boolean; tracker: VelocityTracker } | null>(null)
  const swipeEnabled = depth > 0 && isTop && !layer.exiting
  const onPointerDownCapture = (e: RPointerEvent<HTMLDivElement>) => {
    if (!swipeEnabled || g.current || e.button !== 0) return
    const r = e.currentTarget.getBoundingClientRect()
    const local = (e.clientX - r.left) / getDeviceScale()
    if (local > EDGE) return
    g.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, start: mv.x.get(), decided: false, active: false, tracker: new VelocityTracker() }
  }
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = g.current
    if (!s || s.id !== e.pointerId) return
    const scale = getDeviceScale()
    const dx = (e.clientX - s.sx) / scale
    const dy = (e.clientY - s.sy) / scale
    if (!s.decided) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      s.decided = true
      s.active = dx > 0 && Math.abs(dx) > Math.abs(dy)
      if (!s.active) {
        g.current = null
        return
      }
      e.currentTarget.setPointerCapture(e.pointerId)
      mv.anim?.stop()
      mv.x.stop()
      s.start = mv.x.get()
    }
    s.tracker.add(e.clientX / scale, 0)
    const raw = s.start + dx
    mv.x.set(raw < 0 ? rubberband(raw, width, 0.25) : raw)
  }
  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    const s = g.current
    g.current = null
    if (!s || !s.active || s.id !== e.pointerId) return
    suppressNextClick()
    const v = s.tracker.velocity().x
    const cur = mv.x.get()
    const projected = cur + project(v)
    const commit = v > 350 ? true : v < -350 ? false : projected > width / 2
    if (commit) {
      mv.anim = animate(mv.x, width, { ...spring.push, velocity: v })
      ;(mv.anim as unknown as Promise<void>).then?.(() => onCommitPop(key))
    } else {
      mv.anim = animate(mv.x, 0, { ...spring.push, velocity: v })
    }
  }

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-bg-grouped"
      style={{
        x: mv.disp,
        opacity: mv.opacity,
        visibility: visible ? 'visible' : 'hidden',
        boxShadow: depth > 0 ? '-10px 0 30px -12px rgba(0,0,0,0.25)' : undefined,
        willChange: 'transform',
      }}
      inert={!isTop}
      aria-hidden={!isTop}
      onPointerDownCapture={onPointerDownCapture}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <ScreenCtx.Provider value={ctx}>
        <RouteBoundary name={screen ?? tab} onClose={depth > 0 ? close : undefined}>
          <Component {...params} />
        </RouteBoundary>
      </ScreenCtx.Provider>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-50 bg-black" style={{ opacity: mv.dim }} />
    </motion.div>
  )
})
