import { clsx } from 'clsx'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { S, useT } from '../i18n'
import type { AlertAction, Banner } from '../store'
import { getState, useAppStore } from '../store'
import { asset } from '../ui/asset'
import { VelocityTracker, getDeviceScale, rubberband } from '../ui/gestures'
import { spring } from '../ui/motion'
import { useDevice } from './device'

// ---------------------------------------------------------------------------
// Notification banner
// ---------------------------------------------------------------------------
export function BannerHost() {
  const banner = useAppStore((s) => s.banner)
  return <AnimatePresence>{banner && <NotificationBanner key={banner.key} banner={banner} />}</AnimatePresence>
}

function NotificationBanner({ banner }: { banner: Banner }) {
  const t = useT()
  const { safeTop } = useDevice()
  const reduce = useReducedMotion()
  const y = useMotionValue(0)
  const scaleY = useTransform(y, [0, 60], [1, 1.04])
  const timer = useRef<number | undefined>(undefined)
  const g = useRef<{ id: number; sy: number; start: number; moved: boolean; tracker: VelocityTracker } | null>(null)

  const hide = () => getState().hideBanner(banner.key)
  const arm = () => {
    window.clearTimeout(timer.current)
    const d = banner.duration ?? 6000
    if (d > 0) timer.current = window.setTimeout(hide, d)
  }
  useEffect(() => {
    arm()
    return () => window.clearTimeout(timer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner.key])

  const open = () => {
    hide()
    if (banner.target) getState().navigate(banner.target)
  }
  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    window.clearTimeout(timer.current)
    y.stop()
    g.current = { id: e.pointerId, sy: e.clientY, start: y.get(), moved: false, tracker: new VelocityTracker() }
  }
  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = g.current
    if (!s || s.id !== e.pointerId) return
    const dy = (e.clientY - s.sy) / getDeviceScale()
    if (Math.abs(dy) > 6) s.moved = true
    s.tracker.add(0, e.clientY / getDeviceScale())
    const raw = s.start + dy
    y.set(raw > 0 ? rubberband(raw, 300, 0.4) : raw)
  }
  const onPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    const s = g.current
    g.current = null
    if (!s || s.id !== e.pointerId) return
    if (!s.moved) return open()
    const v = s.tracker.velocity().y
    if (y.get() < -30 || v < -300) {
      animate(y, -200, { ...spring.snappy, velocity: v })
      hide()
    } else {
      animate(y, 0, { ...spring.sheetFlick, velocity: v })
      arm()
    }
  }

  return (
    <motion.div
      className="absolute inset-x-2 z-[80]"
      style={{ top: safeTop - 7 }}
      initial={reduce ? { opacity: 0 } : { y: -140, opacity: 1 }}
      animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { y: -160, opacity: 0.6, transition: { type: 'spring', bounce: 0, duration: 0.35 } }}
      transition={spring.sheetFlick}
    >
      <motion.div
        role="alert"
        aria-label={`${t(S.notification)}: ${t(banner.title)}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && open()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ y, scaleY, transformOrigin: 'top center' }}
        className="flex cursor-pointer touch-none items-start gap-2.5 rounded-[24px] p-3 pr-3.5 select-none material-thick shadow-[0_12px_40px_-8px_rgba(0,0,0,0.3),0_0_0_0.5px_var(--separator)]"
      >
        <span className="mt-0.5 flex size-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] text-[22px]">
          {banner.icon ? banner.icon : <img src={asset('/icon.svg')} alt="" className="size-full" draggable={false} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-subhead font-semibold text-label">{t(banner.title)}</span>
            <span className="shrink-0 text-footnote text-label-2">{t(banner.time ?? S.now)}</span>
          </span>
          <span className="mt-px line-clamp-2 block text-subhead leading-[20px] text-label">{t(banner.body)}</span>
        </span>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Alert dialog
// ---------------------------------------------------------------------------
export function AlertHost() {
  const alert = useAppStore((s) => s.alert)
  const t = useT()
  const reduce = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const run = (a: AlertAction) => {
    getState().hideAlert()
    a.onPress?.()
  }
  useEffect(() => {
    if (!alert) return
    cardRef.current?.querySelector<HTMLButtonElement>('button[data-preferred],button')?.focus()
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const cancel = alert.actions.find((a) => a.style === 'cancel')
        if (cancel) run(cancel)
        else getState().hideAlert()
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert])
  // Two short actions sit side by side; long labels stack like iOS.
  const row = !!alert && alert.actions.length === 2 && alert.actions.every((a) => t(a.label).length <= 13)
  const actions = alert ? orderActions(alert.actions, row) : []
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.key}
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            ref={cardRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="alert-title"
            className="w-[270px] overflow-hidden rounded-[14px] material-thick text-center shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.98, transition: { duration: 0.15 } }}
            transition={spring.snappy}
          >
            <div className="px-4 pt-[19px] pb-[18px]">
              <h2 id="alert-title" className="text-headline text-label">
                {t(alert.title)}
              </h2>
              {alert.message && <p className="mt-1 text-footnote text-label">{t(alert.message)}</p>}
            </div>
            <div className={clsx('hairline-t', row ? 'grid grid-cols-2' : 'flex flex-col')}>
              {actions.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  data-preferred={a.preferred || undefined}
                  onClick={() => run(a)}
                  className={clsx(
                    'relative h-11 text-[17px] transition-colors duration-75 active:bg-fill-3',
                    a.style === 'destructive' ? 'text-danger' : 'text-primary',
                    (a.preferred || (a.style === 'cancel' && !actions.some((x) => x.preferred))) && 'font-semibold',
                    i > 0 && (row ? 'shadow-[inset_0.5px_0_0_var(--separator)]' : 'hairline-t'),
                  )}
                >
                  {t(a.label)}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** iOS puts Cancel on the left in a two-button row and at the bottom of a stack. */
function orderActions(actions: AlertAction[], row: boolean) {
  const cancel = actions.filter((a) => a.style === 'cancel')
  const rest = actions.filter((a) => a.style !== 'cancel')
  return row ? [...cancel, ...rest] : [...rest, ...cancel]
}
