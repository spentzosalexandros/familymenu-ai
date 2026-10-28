import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from 'motion/react'
import { useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useT } from '../i18n'
import { useAppStore } from '../store'
import { ContextMenuHost } from './ContextMenu'
import { FRAME_H, FRAME_W, TAB_BAR_H, useDevice } from './device'
import { RouteBoundary } from './ErrorBoundary'
import { AlertHost, BannerHost } from './Overlays'
import { PresentationHost } from './Presentations'
import { PresenterPanel } from './Presenter'
import { OnboardingFlow } from './registry'
import { ScreenCtx } from './screen-context'
import type { ScreenCtxValue } from './screen-context'
import { Shell } from './Shell'
import { HomeIndicator, StatusBar } from './StatusBar'
import { useResolvedTheme } from './theme'
import { PhoneToaster } from './Toasts'

/** Desktop: iPhone frame + presenter panel. Narrow screens: the app full-screen. */
export function Stage() {
  const d = useDevice()
  const t = useT()
  if (!d.framed) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-black">
        <PhoneScreen />
      </div>
    )
  }
  return (
    <div className="flex min-h-dvh items-center justify-center gap-16 bg-[radial-gradient(1200px_800px_at_28%_18%,var(--stage-2),var(--stage))] px-8 py-5">
      <div className="shrink-0" style={{ width: FRAME_W * d.scale, height: FRAME_H * d.scale }}>
        <div style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${d.scale})`, transformOrigin: 'top left' }}>
          <PhoneFrame>
            <PhoneScreen />
          </PhoneFrame>
        </div>
      </div>
      {d.sidePanel ? (
        <div className="max-h-[calc(100dvh-40px)] overflow-y-auto py-2 pr-1">
          <PresenterPanel />
        </div>
      ) : (
        <p className="sr-only">{t({ el: 'Κράτα πατημένη την ώρα για τα χειριστήρια παρουσίασης.', en: 'Long-press the clock for the presenter controls.' })}</p>
      )}
    </div>
  )
}

/** Realistic iPhone hardware frame (titanium edge, bezel, Dynamic Island, side buttons). */
function PhoneFrame({ children }: { children: ReactNode }) {
  const btn = 'absolute w-[4px] rounded-[2px] bg-[linear-gradient(90deg,#55555a,#2c2c2e)]'
  return (
    <div className="relative" style={{ width: FRAME_W, height: FRAME_H }}>
      {/* side buttons */}
      <span className={btn} style={{ left: -3, top: 150, height: 32 }} />
      <span className={btn} style={{ left: -3, top: 210, height: 62 }} />
      <span className={btn} style={{ left: -3, top: 285, height: 62 }} />
      <span className={btn} style={{ right: -3, top: 238, height: 96 }} />
      <div
        className="relative size-full rounded-[67px] bg-[#0a0a0b] p-[12px]"
        style={{
          boxShadow:
            '0 0 0 1.5px #2b2b2e, 0 0 0 3px #8e8e93, 0 0 0 4px #3a3a3c, 0 40px 80px -20px rgba(0,0,0,0.45), 0 18px 36px -18px rgba(0,0,0,0.35)',
        }}
      >
        {children}
        {/* Dynamic Island */}
        <div aria-hidden className="pointer-events-none absolute top-[23px] left-1/2 z-[100] h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black">
          <span className="absolute top-1/2 right-[22px] size-[11px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#2a3550,#0b0d14_60%)]" />
        </div>
      </div>
    </div>
  )
}

/**
 * The phone screen: the containing block for every overlay (transform: translateZ(0) makes
 * position:fixed descendants — Sonner, sheets, banners — stay inside the phone).
 */
export function PhoneScreen() {
  const d = useDevice()
  const theme = useResolvedTheme()
  const reduce = useReducedMotion()
  const onboardingDone = useAppStore((s) => s.onboarding.done)
  // A full-screen modal (cook mode, recap) covers the screen that asked for a light status bar (recipe hero).
  const statusOverride = useAppStore((s) =>
    s.presented.some((p) => p.kind === 'modal') ? undefined : s.statusBar[s.statusBar.length - 1]?.style,
  )
  const base = useMotionValue(0)
  const [presenting, setPresenting] = useState(false)
  useMotionValueEvent(base, 'change', (v) => {
    const p = v > 0.5
    if (p !== presenting) setPresenting(p)
  })
  const largeTop = Math.round(d.height * 0.08)
  const scale = useTransform(base, (p) => 1 - 0.06 * p)
  const y = useTransform(base, (p) => p * Math.max(0, largeTop - 11))
  const radius = useTransform(base, (p) => (d.framed ? 55 - 43 * p : 12 * p))
  const tone: 'light' | 'dark' = presenting ? 'light' : (statusOverride ?? (theme === 'dark' ? 'light' : 'dark'))

  const style = useMemo(
    () =>
      ({
        width: d.framed ? d.width : '100%',
        height: d.framed ? d.height : '100%',
        transform: 'translateZ(0)',
        borderRadius: d.framed ? 55 : 0,
        ['--safe-top' as string]: `${d.safeTop}px`,
        ['--safe-bottom' as string]: `${d.safeBottom}px`,
      }) as CSSProperties,
    [d],
  )

  return (
    <div className="phone-screen relative isolate overflow-hidden bg-black text-label" style={style}>
      <motion.div className="absolute inset-0 overflow-hidden" style={{ scale, y, borderRadius: radius, transformOrigin: 'top center' }}>
        <AnimatePresence initial={false}>
          {onboardingDone ? (
            <motion.div
              key="shell"
              className="absolute inset-0"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
            >
              <Shell />
            </motion.div>
          ) : (
            <motion.div
              key="onboarding"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            >
              <OnboardingHost />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <PresentationHost base={base} />
      <ContextMenuHost />
      <AlertHost />
      <PhoneToaster bottom={TAB_BAR_H + d.safeBottom + 10} />
      <BannerHost />
      <StatusBar tone={tone} />
      <HomeIndicator tone={theme === 'dark' ? 'light' : 'dark'} />
    </div>
  )
}

function OnboardingHost() {
  const step = useAppStore((s) => s.onboarding.step)
  const { safeBottom } = useDevice()
  const ctx = useMemo<ScreenCtxValue>(
    () => ({ container: 'onboarding', routeKey: 'onboarding', depth: 0, isTop: true, setTitle: () => {}, close: () => {}, bottomInset: safeBottom }),
    [safeBottom],
  )
  return (
    <div className="absolute inset-0 bg-bg">
      <ScreenCtx.Provider value={ctx}>
        <RouteBoundary name="onboarding">
          <OnboardingFlow step={step} />
        </RouteBoundary>
      </ScreenCtx.Provider>
    </div>
  )
}
