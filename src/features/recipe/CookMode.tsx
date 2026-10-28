import { ArrowLeftIcon, ArrowRightIcon, ArrowCounterClockwiseIcon, PauseIcon, PlayIcon, TimerIcon, XIcon } from '@phosphor-icons/react'
import { animate, AnimatePresence, motion, useMotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { toast, useDevice, useScreen } from '../../app'
import { getRecipe } from '../../data'
import { formatMinutes, useLang, useT } from '../../i18n'
import { Button, EmptyState, VelocityTracker, clamp, getDeviceScale, haptic, prefersReducedMotion, project, rubberband, spring, suppressNextClick } from '../../ui'
import { timerMinutes } from './quantity'
import { S as T } from './strings'

type Drag = { id: number; sx: number; sy: number; base: number; active: boolean | null; vt: VelocityTracker }

export function CookMode({ id }: { id: string }) {
  const t = useT()
  const lang = useLang()
  const { close } = useScreen()
  const { safeTop, safeBottom } = useDevice()
  const r = getRecipe(id)
  const n = r?.steps.length ?? 0
  const [index, setIndex] = useState(0)
  const x = useMotionValue(0)
  const pagerRef = useRef<HTMLDivElement>(null)
  const width = useRef(0)
  const drag = useRef<Drag | null>(null)
  const indexRef = useRef(0)

  const goTo = useCallback(
    (i: number, velocity = 0) => {
      const target = clamp(i, 0, Math.max(0, n - 1))
      if (target !== indexRef.current) haptic()
      indexRef.current = target
      setIndex(target)
      animate(x, -target * width.current, prefersReducedMotion() ? { duration: 0 } : { ...spring.default, velocity })
    },
    [n, x],
  )

  useLayoutEffect(() => {
    const el = pagerRef.current
    if (!el) return
    const measure = () => {
      width.current = el.offsetWidth
      x.set(-indexRef.current * width.current)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [x])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(indexRef.current + 1)
      if (e.key === 'ArrowLeft') goTo(indexRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  if (!r) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-bg">
        <EmptyState emoji="🍽️" title={t(T.notFound)} action={<Button onClick={close}>{t({ el: 'Κλείσιμο', en: 'Close' })}</Button>} />
      </div>
    )
  }

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || drag.current) return
    x.stop()
    const vt = new VelocityTracker()
    vt.add(e.clientX / getDeviceScale(), 0)
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, base: x.get(), active: null, vt }
  }
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const s = getDeviceScale()
    const dx = (e.clientX - d.sx) / s
    const dy = (e.clientY - d.sy) / s
    if (d.active === null) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        d.active = true
        d.sx = e.clientX
        d.base = x.get()
        e.currentTarget.setPointerCapture(e.pointerId)
      } else if (Math.abs(dy) > 10) {
        d.active = false
      }
      return
    }
    if (!d.active) return
    const w = width.current
    const min = -(n - 1) * w
    let nx = d.base + dx
    if (nx > 0) nx = rubberband(nx, w)
    else if (nx < min) nx = min + rubberband(nx - min, w)
    x.set(nx)
    d.vt.add(e.clientX / s, 0)
  }
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (!d.active) return
    suppressNextClick()
    const v = d.vt.velocity().x
    const w = width.current || 1
    const projected = x.get() + project(v, 0.99)
    const cur = indexRef.current
    const target = clamp(Math.round(-projected / w), cur - 1, cur + 1)
    goTo(target, v)
  }

  const last = index === n - 1
  const finish = () => {
    close()
    toast(T.enjoy, { description: T.enjoySub })
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-bg" style={{ paddingTop: safeTop, paddingBottom: safeBottom + 8 }}>
      {/* Top bar */}
      <div className="flex h-12 items-center gap-2 px-3">
        <button
          type="button"
          onClick={close}
          aria-label={t({ el: 'Κλείσιμο', en: 'Close' })}
          className="relative flex size-[34px] items-center justify-center rounded-full bg-fill-3 text-[16px] text-label-2 transition-transform duration-100 active:scale-90 before:absolute before:-inset-1.5 before:content-['']"
        >
          <XIcon weight="bold" />
        </button>
        <div className="min-w-0 flex-1 truncate text-center text-headline text-label">{t(r.name)}</div>
        <div className="w-[34px] text-right text-footnote font-semibold text-label-2 tnum">
          {index + 1}/{n}
        </div>
      </div>

      {/* Progress segments */}
      <div className="flex gap-1 px-4 pt-1 pb-3" aria-hidden>
        {r.steps.map((_, i) => (
          <button key={i} type="button" tabIndex={-1} onClick={() => goTo(i)} className="relative h-1 flex-1 overflow-hidden rounded-full bg-fill-3 before:absolute before:-inset-y-3 before:inset-x-0 before:content-['']">
            <motion.span
              className="absolute inset-0 origin-left rounded-full bg-primary"
              initial={false}
              animate={{ scaleX: i <= index ? 1 : 0 }}
              transition={spring.snappy}
            />
          </button>
        ))}
      </div>

      {/* Pager */}
      <div
        ref={pagerRef}
        className="relative min-h-0 flex-1 overflow-hidden select-none"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-roledescription="carousel"
      >
        <motion.div className="absolute inset-y-0 left-0 flex" style={{ x, width: `${n * 100}%` }}>
          {r.steps.map((s, i) => (
            <section key={i} className="flex h-full flex-col overflow-y-auto px-6 pt-4 pb-6" style={{ width: `${100 / n}%` }} aria-hidden={i !== index}>
              <div className="text-subhead font-semibold text-primary">{t(T.stepOf, { n: i + 1, total: n })}</div>
              <p className="mt-3 text-[28px] leading-[1.25] font-semibold tracking-[-0.01em] text-label">{t(s)}</p>
              <StepTimer text={s.el} active={i === index} lang={lang} />
              {i === 0 && n > 1 && <p className="mt-auto pt-6 text-center text-footnote text-label-3">{t(T.swipeHint)} →</p>}
            </section>
          ))}
        </motion.div>
      </div>

      {/* Bottom controls */}
      <div className="flex gap-3 px-4 pt-2">
        <Button variant="gray" size="lg" icon={<ArrowLeftIcon weight="bold" />} disabled={index === 0} onClick={() => goTo(index - 1)} aria-label={t(T.prev)}>
          {t(T.prev)}
        </Button>
        {last ? (
          <Button variant="filled" size="lg" className="min-w-0 flex-1" onClick={finish}>
            {t(T.finish)}
          </Button>
        ) : (
          <Button variant="filled" size="lg" className="min-w-0 flex-1" iconRight={<ArrowRightIcon weight="bold" />} onClick={() => goTo(index + 1)}>
            {t(T.next)}
          </Button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Simple step timer (parsed from "20 λεπτά" in the step text)
// ---------------------------------------------------------------------------
function StepTimer({ text, active, lang }: { text: string; active: boolean; lang: 'el' | 'en' }) {
  const t = useT()
  const minutes = timerMinutes(text)
  const total = (minutes ?? 0) * 60
  const [left, setLeft] = useState(total)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running) return
    const iv = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false)
          haptic(30)
          toast({ el: '⏰ Ο χρόνος τελείωσε', en: '⏰ Time’s up' })
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [running])
  if (!minutes) return null
  const started = running || left !== total
  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, '0')
  return (
    <div className="mt-8" aria-hidden={!active}>
      <AnimatePresence initial={false} mode="popLayout">
        {!started ? (
          <motion.div key="start" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={spring.snappy}>
            <Button variant="tinted" size="lg" icon={<TimerIcon weight="bold" />} onClick={() => setRunning(true)}>
              {t(T.timer, { v: formatMinutes(minutes, lang) })}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="run"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={spring.snappy}
            className="flex items-center gap-4 rounded-[20px] bg-primary-tint p-4"
          >
            <div className={`text-[44px] leading-none font-bold tnum ${left === 0 ? 'text-danger' : 'text-primary'}`}>
              {mm}:{ss}
            </div>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setRunning((v) => !v)}
                disabled={left === 0}
                aria-label={t(running ? T.timerPause : T.timerResume)}
                className="flex size-12 items-center justify-center rounded-full bg-primary text-[22px] text-on-primary transition-transform duration-100 active:scale-90 disabled:opacity-40"
              >
                {running ? <PauseIcon weight="fill" /> : <PlayIcon weight="fill" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false)
                  setLeft(total)
                }}
                aria-label={t(T.timerReset)}
                className="flex size-12 items-center justify-center rounded-full bg-fill-3 text-[20px] text-label transition-transform duration-100 active:scale-90"
              >
                <ArrowCounterClockwiseIcon weight="bold" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
