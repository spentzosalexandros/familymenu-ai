import { CaretLeftIcon, XIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { family } from '../data'
import { S, useT } from '../i18n'
import { Avatar } from '../ui/Display'
import { getDeviceScale } from '../ui/gestures'
import { NAV_BAR_H, useDevice } from './device'
import { onScrollTop, openSheet } from './nav'
import { useScreen } from './screen-context'

export type ScreenProps = {
  title: string
  /** Small line above the large title (e.g. the date). */
  subtitle?: ReactNode
  /** large: collapsing large title (default for tab roots) · inline: centered title · hidden: no title. */
  titleMode?: 'large' | 'inline' | 'hidden'
  /** Right side of the navigation bar. */
  trailing?: ReactNode
  /** Replaces the back button (e.g. "Άκυρο" in a sheet). */
  leading?: ReactNode
  /** Show the family avatar on the right; it opens the profile sheet. */
  avatar?: boolean
  /** Override the back button label (default: previous screen's title). */
  backTitle?: string
  /** grouped (default) = systemGroupedBackground · plain = systemBackground */
  background?: 'grouped' | 'plain'
  /**
   * Hero mode: the nav bar stays transparent (with round material buttons) until the content has
   * scrolled this many px — e.g. the height of a stretchy hero image.
   */
  transparentNav?: number
  /** Sticks under the navigation bar while scrolling (e.g. the week's day strip). */
  stickyHeader?: ReactNode
  /** Pinned above the tab bar / home indicator, on a material (e.g. a primary CTA). */
  bottomBar?: ReactNode
  /** Receives the scroll container element. */
  scrollRef?: RefObject<HTMLDivElement | null>
  /** Sheet only: hide the default "Τέλος" button. */
  hideDone?: boolean
  className?: string
  /** Extra classes on the content wrapper. */
  contentClassName?: string
  children?: ReactNode
}

const LARGE_ROW = 52
const SUBTITLE_ROW = 22

/**
 * The screen scaffold. Works in every container:
 *  - stack (tab roots + pushed screens): own scroll view, large title collapsing into a translucent
 *    inline bar, back button with the previous title, tab-bar inset.
 *  - sheet: sticky inline header (drag handle area) with "Τέλος", scrolls inside the sheet.
 *  - modal: full-screen with a close button.
 */
export function Screen(props: ScreenProps) {
  const ctx = useScreen()
  const { setTitle } = ctx
  useEffect(() => {
    setTitle(props.title)
  }, [props.title, setTitle])
  if (ctx.container === 'sheet') return <SheetScreen {...props} />
  return <StackScreen {...props} />
}

// ---------------------------------------------------------------------------
// Stack / modal screen
// ---------------------------------------------------------------------------
function StackScreen({
  title,
  subtitle,
  titleMode,
  trailing,
  leading,
  avatar,
  backTitle,
  background = 'grouped',
  transparentNav,
  stickyHeader,
  bottomBar,
  scrollRef,
  className,
  contentClassName,
  children,
}: ScreenProps) {
  const ctx = useScreen()
  const t = useT()
  const { safeTop, safeBottom, width: screenW } = useDevice()
  const ref = useRef<HTMLDivElement>(null)
  const isModal = ctx.container === 'modal'
  const mode = titleMode ?? (ctx.depth === 0 && !isModal ? 'large' : 'inline')
  const { scrollY } = useScroll({ container: ref })

  useEffect(() => {
    if (scrollRef) (scrollRef as { current: HTMLDivElement | null }).current = ref.current
  })
  // Tapping the active tab again scrolls its root to the top.
  useEffect(() => {
    if (ctx.container !== 'stack' || !ctx.tab) return
    return onScrollTop(ctx.tab, () => ref.current?.scrollTo({ top: 0, behavior: 'smooth' }))
  }, [ctx.container, ctx.tab])

  const blockH = mode === 'large' ? LARGE_ROW + (subtitle ? SUBTITLE_ROW : 0) : 0
  const navH = safeTop + NAV_BAR_H
  const materialRange: [number, number] =
    transparentNav != null ? [transparentNav - navH - 30, transparentNav - navH] : mode === 'large' ? [blockH - 10, blockH + 2] : [0, 10]
  const material = useTransform(scrollY, materialRange, [0, 1], { clamp: true })
  const inlineTitle = useTransform(
    scrollY,
    transparentNav != null ? materialRange : mode === 'large' ? [blockH - 18, blockH - 2] : [-2, -1],
    [0, 1],
    { clamp: true },
  )
  // Large title stretches slightly on overscroll (iOS rubber-band pull).
  const largeScale = useTransform(scrollY, [-120, 0], [1.08, 1], { clamp: true })

  const canGoBack = ctx.container === 'stack' && ctx.depth > 0
  const wantedBack = backTitle ?? (ctx.prevTitle && ctx.prevTitle.length <= 14 ? ctx.prevTitle : t(S.back))
  // Rough text metrics (17 px semibold ≈ 9.2 px/char): the title is centred and capped at 60 % of the bar.
  const titleW = Math.min(title.length * 9.2, screenW * 0.6)
  const sideW = (screenW - titleW) / 2 - 12
  const backLabel = mode === 'hidden' || 30 + wantedBack.length * 9 <= sideW ? wantedBack : ''
  const hero = transparentNav != null
  const bottomBarH = bottomBar ? 72 : 0
  const bottomInset = isModal ? safeBottom : ctx.bottomInset

  return (
    <div className={clsx('absolute inset-0', background === 'grouped' ? 'bg-bg-grouped' : 'bg-bg', className)}>
      <div
        ref={ref}
        className="ios-scroll absolute inset-0"
        style={{ paddingTop: hero ? 0 : navH, paddingBottom: bottomInset + bottomBarH + 28 }}
      >
        {mode === 'large' && (
          <header className="px-4 pt-[3px]" style={{ height: blockH }}>
            {subtitle && (
              <div className="flex h-[22px] items-end text-subhead font-semibold text-label-2">{subtitle}</div>
            )}
            <motion.h1
              className="truncate text-large-title text-label"
              style={{ scale: largeScale, transformOrigin: 'left center' }}
            >
              {title}
            </motion.h1>
          </header>
        )}
        {stickyHeader && (
          <StickyHeader stuckAt={navH} scrollY={scrollY}>
            {stickyHeader}
          </StickyHeader>
        )}
        <div className={contentClassName}>{children}</div>
      </div>

      {/* Navigation bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 select-none" style={{ height: navH }}>
        <motion.div
          aria-hidden
          className={clsx('absolute inset-0 material-bar', !stickyHeader && 'hairline-b')}
          style={{ opacity: material }}
        />
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex h-11 items-center justify-between px-2">
          <div className="flex min-w-0 flex-1 items-center">
            {leading ??
              (canGoBack ? (
                <BackButton label={backLabel} onPress={ctx.close} hero={hero} material={material} />
              ) : isModal ? (
                <CloseButton onPress={ctx.close} label={t(S.close)} />
              ) : null)}
          </div>
          {mode !== 'hidden' && (
            <motion.div
              className="pointer-events-none absolute left-1/2 max-w-[60%] -translate-x-1/2 truncate text-headline text-label"
              style={{ opacity: inlineTitle }}
              aria-hidden={mode === 'large'}
            >
              {title}
            </motion.div>
          )}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            {trailing}
            {avatar && <ProfileButton />}
          </div>
        </div>
      </div>

      {bottomBar && (
        <div
          className="absolute inset-x-0 z-10 flex items-center gap-3 px-4 py-3 material-bar hairline-t"
          style={{ bottom: isModal ? 0 : ctx.bottomInset, paddingBottom: isModal ? safeBottom + 8 : 12 }}
        >
          {bottomBar}
        </div>
      )}
    </div>
  )
}

function StickyHeader({ stuckAt, scrollY, children }: { stuckAt: number; scrollY: MotionValue<number>; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const stuck = useMotionValue(0)
  useMotionValueEvent(scrollY, 'change', () => {
    const el = ref.current
    if (!el) return
    const rel = (el.getBoundingClientRect().top - (el.parentElement?.getBoundingClientRect().top ?? 0)) / getDeviceScale()
    const isStuck = rel <= stuckAt + 0.5 ? 1 : 0
    if (stuck.get() !== isStuck) stuck.set(isStuck)
  })
  const opacity = useTransform(stuck, [0, 1], [0, 1])
  return (
    <div ref={ref} className="sticky top-0 z-10">
      <motion.div aria-hidden className="absolute inset-0 material-bar hairline-b" style={{ opacity }} />
      <div className="relative">{children}</div>
    </div>
  )
}

function BackButton({ label, onPress, hero, material }: { label: string; onPress: () => void; hero: boolean; material: MotionValue<number> }) {
  const t = useT()
  const circle = useTransform(material, [0, 1], [1, 0])
  const labelOpacity = useTransform(material, [0.4, 1], [0, 1])
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label ? `${t(S.back)}: ${label}` : t(S.back)}
      className="relative flex h-11 max-w-[160px] items-center gap-0.5 pr-2 text-[17px] text-primary transition-opacity duration-100 active:opacity-40"
    >
      {hero && (
        <motion.span
          aria-hidden
          className="absolute left-0 size-[34px] rounded-full material-regular shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
          style={{ opacity: circle }}
        />
      )}
      <CaretLeftIcon weight="bold" className={clsx('relative shrink-0 text-[22px]', hero && 'ml-[5px]')} />
      {hero ? (
        <motion.span className="relative truncate" style={{ opacity: labelOpacity }}>
          {label}
        </motion.span>
      ) : (
        <span className="truncate">{label}</span>
      )}
    </button>
  )
}

function CloseButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label}
      className="relative ml-2 flex size-[30px] items-center justify-center rounded-full bg-fill-3 text-[15px] text-label-2 transition-transform duration-100 active:scale-90 before:absolute before:-inset-2 before:content-['']"
    >
      <XIcon weight="bold" />
    </button>
  )
}

/** Family avatar in the nav bar → profile & settings sheet. */
export function ProfileButton() {
  const t = useT()
  const me = family.members[0]
  return (
    <button
      type="button"
      onClick={() => openSheet('profile')}
      aria-label={t(S.profile)}
      className="relative mr-1 flex size-11 items-center justify-center rounded-full transition-transform duration-100 active:scale-90"
    >
      {me ? <Avatar member={me} size={34} ring={false} /> : <span className="size-8 rounded-full bg-fill-3" />}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Sheet screen
// ---------------------------------------------------------------------------
function SheetScreen({ title, titleMode = 'inline', trailing, leading, hideDone, stickyHeader, bottomBar, className, contentClassName, children }: ScreenProps) {
  const ctx = useScreen()
  const t = useT()
  const { safeBottom } = useDevice()
  const fallbackRef = useRef<HTMLDivElement>(null)
  const scrollRef = ctx.sheet?.scrollRef ?? fallbackRef
  const { scrollY } = useScroll({ container: scrollRef })
  const material = useTransform(scrollY, [0, 8], [0, 1], { clamp: true })
  return (
    <div className={clsx('relative flex min-h-full flex-col', className)}>
      <div data-sheet-handle className="sticky top-0 z-20 select-none">
        <motion.div aria-hidden className="absolute inset-0 material-thick hairline-b" style={{ opacity: material }} />
        <div className="relative flex h-14 items-end justify-between px-4 pb-2.5">
          <div className="flex min-w-0 flex-1 items-center">{leading}</div>
          {titleMode !== 'hidden' && (
            <h2 className="absolute left-1/2 max-w-[56%] -translate-x-1/2 truncate pb-0.5 text-headline text-label">{title}</h2>
          )}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
            {trailing}
            {!hideDone && (
              <button
                type="button"
                onClick={ctx.close}
                className="relative -mr-1 px-1 text-[17px] font-semibold text-primary transition-opacity active:opacity-40 before:absolute before:-inset-2.5 before:content-['']"
              >
                {t(S.done)}
              </button>
            )}
          </div>
        </div>
      </div>
      {stickyHeader && <div className="sticky top-14 z-10">{stickyHeader}</div>}
      <div className={clsx('flex-1', contentClassName)} style={{ paddingBottom: bottomBar ? 16 : safeBottom + 16 }}>
        {children}
      </div>
      {bottomBar && (
        <div className="sticky bottom-0 z-10 flex items-center gap-3 px-4 pt-3 material-thick hairline-t" style={{ paddingBottom: safeBottom + 8 }}>
          {bottomBar}
        </div>
      )}
    </div>
  )
}
