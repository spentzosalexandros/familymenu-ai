import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { setDeviceScale } from '../ui/gestures'

export const SCREEN_W = 393
export const SCREEN_H = 852
const BEZEL = 12
export const FRAME_W = SCREEN_W + BEZEL * 2
export const FRAME_H = SCREEN_H + BEZEL * 2
export const SAFE_TOP = 59
export const SAFE_BOTTOM = 34
export const STATUS_BAR_H = 54
export const TAB_BAR_H = 49
export const NAV_BAR_H = 44

export type DeviceInfo = {
  /** Desktop: iPhone frame + presenter panel. */
  framed: boolean
  /** We draw the status bar + home indicator ourselves (framed, screenshots, Safari tab). */
  fakeChrome: boolean
  width: number
  height: number
  safeTop: number
  safeBottom: number
  /** CSS scale applied to the frame (gesture code divides deltas by it). */
  scale: number
  /** Window wide enough for the presenter panel beside the phone. */
  sidePanel: boolean
}

const DeviceCtx = createContext<DeviceInfo>({
  framed: false,
  fakeChrome: true,
  width: SCREEN_W,
  height: SCREEN_H,
  safeTop: SAFE_TOP,
  safeBottom: SAFE_BOTTOM,
  scale: 1,
  sidePanel: false,
})
export const useDevice = () => useContext(DeviceCtx)

function frameParam(): '0' | '1' | null {
  const v = new URLSearchParams(location.search).get('frame')
  return v === '0' || v === '1' ? v : null
}

function readEnvInsets() {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)'
  document.body.appendChild(probe)
  const cs = getComputedStyle(probe)
  const top = parseFloat(cs.paddingTop) || 0
  const bottom = parseFloat(cs.paddingBottom) || 0
  probe.remove()
  return { top, bottom }
}

function compute(): DeviceInfo {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const fp = frameParam()
  const framed = fp ? fp === '1' : vw > 500
  if (framed) {
    const sidePanel = vw >= 980
    const availW = sidePanel ? vw - 400 - 64 : vw - 32
    const scale = Math.min(1, (vh - 40) / FRAME_H, availW / FRAME_W)
    return { framed, fakeChrome: true, width: SCREEN_W, height: SCREEN_H, safeTop: SAFE_TOP, safeBottom: SAFE_BOTTOM, scale, sidePanel }
  }
  const env = readEnvInsets()
  const realStatusBar = env.top >= 20
  return {
    framed: false,
    fakeChrome: !realStatusBar,
    width: vw,
    height: vh,
    safeTop: realStatusBar ? env.top : SAFE_TOP,
    safeBottom: realStatusBar ? env.bottom : SAFE_BOTTOM,
    scale: 1,
    sidePanel: false,
  }
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<DeviceInfo>(compute)
  useLayoutEffect(() => {
    setDeviceScale(info.scale)
  }, [info.scale])
  useEffect(() => {
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const next = compute()
        setInfo((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
      })
    }
    window.addEventListener('resize', on)
    window.visualViewport?.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      window.visualViewport?.removeEventListener('resize', on)
    }
  }, [])
  const value = useMemo(() => info, [info])
  return <DeviceCtx.Provider value={value}>{children}</DeviceCtx.Provider>
}

// ---------------------------------------------------------------------------
// Status bar glyphs
// ---------------------------------------------------------------------------
export function SignalGlyph() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
      <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
      <rect x="4.8" y="5.2" width="3.2" height="6.8" rx="1" />
      <rect x="9.6" y="2.7" width="3.2" height="9.3" rx="1" />
      <rect x="14.4" y="0" width="3.2" height="12" rx="1" />
    </svg>
  )
}
export function WifiGlyph() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden>
      <path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.1-1.1A10 10 0 0 0 8 .8 10 10 0 0 0 .9 3.7L2 4.8a8.5 8.5 0 0 1 6-2.4Z" />
      <path d="M8 5.6c1.4 0 2.7.5 3.7 1.4l1.1-1.1A7 7 0 0 0 8 4a7 7 0 0 0-4.8 1.9l1.1 1.1c1-.9 2.3-1.4 3.7-1.4Z" />
      <path d="M8 8.7c.6 0 1.1.2 1.5.6L8 10.9 6.5 9.3c.4-.4.9-.6 1.5-.6Z" />
    </svg>
  )
}
export function BatteryGlyph({ level = 1 }: { level?: number }) {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.6" stroke="currentColor" strokeOpacity="0.38" />
      <rect x="2" y="2" width={Math.max(2, 20 * level)} height="9" rx="2.3" fill="currentColor" />
      <path d="M25 4.3v4.4c.9-.3 1.5-1.2 1.5-2.2s-.6-1.9-1.5-2.2Z" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}
