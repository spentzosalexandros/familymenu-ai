import { clsx } from 'clsx'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { MouseEvent as RMouseEvent, PointerEvent as RPointerEvent, ReactNode } from 'react'
import { useT } from '../i18n'
import type { Text } from '../i18n'
import { getDeviceScale, haptic, suppressNextClick } from '../ui/gestures'
import { spring } from '../ui/motion'
import { useDevice } from './device'

export type ContextMenuItem = {
  key: string
  label: Text
  icon?: ReactNode
  destructive?: boolean
  disabled?: boolean
  onSelect: () => void
}

type OpenMenu = { id: number; el: HTMLElement; items: ContextMenuItem[]; title?: Text }

// Tiny external store (only one menu can be open).
let current: OpenMenu | null = null
let seq = 0
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())
const subscribe = (f: () => void) => {
  subs.add(f)
  return () => subs.delete(f)
}
export function openContextMenu(el: HTMLElement, items: ContextMenuItem[], title?: Text) {
  current = { id: ++seq, el, items, title }
  emit()
}
export function closeContextMenu() {
  current = null
  emit()
}

const LONG_PRESS_MS = 450

export type ContextMenuProps = {
  items: ContextMenuItem[]
  /** Optional small title above the actions. */
  title?: Text
  disabled?: boolean
  className?: string
  children: ReactNode
}

/**
 * Long-press (or right-click) context menu with a lifted preview and blurred backdrop.
 *   <ContextMenu items={[{ key: 'swap', label: S.swap, icon: <ArrowsClockwiseIcon/>, onSelect }]}>
 *     <MealRow … />
 *   </ContextMenu>
 */
export function ContextMenu({ items, title, disabled, className, children }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const [pressing, setPressing] = useState(false)

  const cancel = () => {
    window.clearTimeout(timer.current)
    start.current = null
    setPressing(false)
  }
  const onPointerDown = (e: RPointerEvent) => {
    if (disabled || e.button !== 0) return
    start.current = { x: e.clientX, y: e.clientY }
    window.clearTimeout(timer.current)
    window.setTimeout(() => start.current && setPressing(true), 150)
    timer.current = window.setTimeout(() => {
      if (!start.current || !ref.current) return
      start.current = null
      setPressing(false)
      haptic(12)
      suppressNextClick()
      openContextMenu(ref.current, items, title)
    }, LONG_PRESS_MS)
  }
  const onPointerMove = (e: RPointerEvent) => {
    const s = start.current
    if (!s) return
    if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8 * getDeviceScale()) cancel()
  }
  const onContextMenu = (e: RMouseEvent) => {
    if (disabled) return
    e.preventDefault()
    cancel()
    if (ref.current) openContextMenu(ref.current, items, title)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <div
      ref={ref}
      className={clsx('transition-transform duration-300 ease-out', pressing && 'scale-[0.97]', className)}
      style={{ WebkitTouchCallout: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
      onContextMenu={onContextMenu}
    >
      {children}
    </div>
  )
}

/** Renders the open context menu inside the phone screen. */
export function ContextMenuHost() {
  const menu = useSyncExternalStore(subscribe, () => current)
  return <AnimatePresence>{menu && <MenuOverlay key={menu.id} menu={menu} />}</AnimatePresence>
}

function MenuOverlay({ menu }: { menu: OpenMenu }) {
  const t = useT()
  const { height: H, width: W, safeTop, safeBottom } = useDevice()
  const reduce = useReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLElement | null>(null)
  const attachPreview = (node: HTMLDivElement | null) => {
    if (node && cloneRef.current && cloneRef.current.parentNode !== node) node.replaceChildren(cloneRef.current)
  }
  const [geo, setGeo] = useState<{ left: number; top: number; w: number; h: number } | null>(null)

  useLayoutEffect(() => {
    const host = hostRef.current?.parentElement
    if (!host) return
    const scale = getDeviceScale()
    const hr = host.getBoundingClientRect()
    // Layout size (ignores the 0.97 press scale), positioned around the element's visual centre.
    const r = menu.el.getBoundingClientRect()
    const w = menu.el.offsetWidth
    const h = menu.el.offsetHeight
    const cx = (r.left + r.width / 2 - hr.left) / scale
    const cy = (r.top + r.height / 2 - hr.top) / scale
    setGeo({ left: cx - w / 2, top: cy - h / 2, w, h })
    // Clone the element as the lifted preview, hide the original meanwhile.
    const clone = menu.el.cloneNode(true) as HTMLElement
    clone.style.transform = 'none'
    clone.style.scale = '1'
    clone.style.transition = 'none'
    clone.style.margin = '0'
    clone.removeAttribute('id')
    clone.style.visibility = 'visible'
    cloneRef.current = clone
    const prevVis = menu.el.style.visibility
    menu.el.style.visibility = 'hidden'
    return () => {
      menu.el.style.visibility = prevVis
    }
  }, [menu])

  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && closeContextMenu()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const menuW = 250
  const menuH = menu.items.length * 44 + (menu.title ? 34 : 0)
  let top = geo?.top ?? 0
  let menuTop = 0
  let below = true
  if (geo) {
    const minTop = safeTop + 8
    const maxBottom = H - safeBottom - 8
    if (geo.top + geo.h + 10 + menuH <= maxBottom) {
      menuTop = geo.top + geo.h + 10
    } else if (geo.top - 10 - menuH >= minTop) {
      below = false
      menuTop = geo.top - 10 - menuH
    } else {
      // Move the preview up so both fit (iOS shifts the preview).
      top = Math.max(minTop, maxBottom - menuH - 10 - geo.h)
      menuTop = Math.min(top + geo.h + 10, maxBottom - menuH)
    }
  }
  const alignRight = geo ? geo.left + geo.w / 2 > W / 2 : false
  const menuLeft = geo ? Math.min(Math.max(12, alignRight ? geo.left + geo.w - menuW : geo.left), W - menuW - 12) : 0

  return (
    <motion.div ref={hostRef} className="absolute inset-0 z-[50]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ duration: 0.22 }}>
      <div
        className="absolute inset-0 bg-black/15 backdrop-blur-[14px] dark:bg-black/40"
        onPointerDown={(e) => {
          e.preventDefault()
          closeContextMenu()
        }}
        aria-hidden
      />
      {geo && (
        <>
          <motion.div
            ref={attachPreview}
            aria-hidden
            className="pointer-events-none absolute overflow-hidden rounded-[14px] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)]"
            style={{ left: geo.left, width: geo.w, height: geo.h }}
            initial={{ top: geo.top, scale: 1 }}
            animate={{ top, scale: reduce ? 1 : 1.02 }}
            exit={{ top: geo.top, scale: 1, opacity: 0, transition: { duration: 0.2 } }}
            transition={spring.default}
          />
          <motion.div
            role="menu"
            aria-label={menu.title ? t(menu.title) : undefined}
            className="absolute overflow-hidden rounded-[14px] material-thick shadow-[0_18px_50px_-10px_rgba(0,0,0,0.3),0_0_0_0.5px_var(--separator)]"
            style={{ left: menuLeft, top: menuTop, width: menuW, transformOrigin: `${alignRight ? 'right' : 'left'} ${below ? 'top' : 'bottom'}` }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.92, transition: { duration: 0.15 } }}
            transition={spring.snappy}
          >
            {menu.title && <div className="px-4 pt-2.5 pb-2 text-footnote text-label-2 hairline-b">{t(menu.title)}</div>}
            {menu.items.map((it, i) => (
              <button
                key={it.key}
                type="button"
                role="menuitem"
                disabled={it.disabled}
                onClick={() => {
                  closeContextMenu()
                  window.setTimeout(it.onSelect, 60)
                }}
                className={clsx(
                  'flex h-11 w-full items-center justify-between gap-3 px-4 text-left text-[17px] transition-colors duration-75 active:bg-fill-3 disabled:opacity-40',
                  it.destructive ? 'text-danger' : 'text-label',
                  i > 0 && 'hairline-t',
                )}
              >
                <span className="truncate">{t(it.label)}</span>
                {it.icon && <span className="flex text-[19px]">{it.icon}</span>}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
