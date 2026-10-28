import { ArrowsClockwiseIcon, SparkleIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { NAV_BAR_H, toast, useDevice, useScreen } from '../../app'
import { DAY_IDS, dayCost, dayIndex, planSummary, storeById } from '../../data'
import type { DayId, DemoDay } from '../../data/types'
import { S, formatEUR, useLang, useT, useTp } from '../../i18n'
import {
  useAppStore,
  useBudget,
  useHighlight,
  useLastLearning,
  usePantry,
  usePlan,
  useSelectedStore,
  useTab,
  useToday,
  useWeek,
} from '../../store'
import { AnimatedNumber, Badge, BudgetBar, Button, Card, Screen, getDeviceScale, spring } from '../../ui'
import { MealRow } from './MealRow'
import { regenerateWeek } from './planOps'
import { T } from './strings'

const SLOT_ORDER = { breakfast: 0, snack: 1, lunch: 2, dinner: 3 } as const
const STRIP_H = 70

export function WeekScreen({ day }: { day?: DayId }) {
  const t = useT()
  const week = useWeek()
  const today = useToday()
  const plan = usePlan()
  const store = useSelectedStore()
  const highlight = useHighlight()
  const learning = useLastLearning()
  const { safeTop } = useDevice()
  const { isTop } = useScreen()
  const tab = useTab()
  const presented = useAppStore((s) => s.presented.length)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const sections = useRef<Partial<Record<DayId, HTMLElement | null>>>({})
  const [active, setActive] = useState<DayId>(day ?? 'mon')
  const lockSpy = useRef(0)

  // ---- glow for highlighted meals: fades out after a few seconds on screen ----
  const visible = tab === 'week' && isTop && presented === 0
  const [faded, setFaded] = useState<string[] | null>(null)
  useEffect(() => {
    if (!visible || !highlight.length) return
    const id = window.setTimeout(() => setFaded(highlight), 6000)
    return () => window.clearTimeout(id)
  }, [visible, highlight])
  const glowIds = faded === highlight ? [] : highlight

  // ---- scroll spy + scroll to day ----
  const offset = safeTop + NAV_BAR_H + STRIP_H
  const scrollToDay = useCallback(
    (d: DayId, behavior: ScrollBehavior = 'smooth') => {
      const sc = scrollRef.current
      const el = sections.current[d]
      if (!sc || !el) return
      const scale = getDeviceScale()
      const top = (el.getBoundingClientRect().top - sc.getBoundingClientRect().top) / scale + sc.scrollTop - offset - 10
      setActive(d)
      lockSpy.current = Date.now() + 700
      sc.scrollTo({ top: Math.max(0, top), behavior })
    },
    [offset],
  )
  const scrollToMeal = useCallback(
    (mealId: string) => {
      const sc = scrollRef.current
      const el = sc?.querySelector<HTMLElement>(`[data-week-meal="${mealId}"]`)
      if (!sc || !el) return
      const scale = getDeviceScale()
      const top = (el.getBoundingClientRect().top - sc.getBoundingClientRect().top) / scale + sc.scrollTop - offset - 48
      lockSpy.current = Date.now() + 700
      sc.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    },
    [offset],
  )

  useEffect(() => {
    const sc = scrollRef.current
    if (!sc) return
    const onScroll = () => {
      if (Date.now() < lockSpy.current) return
      const scale = getDeviceScale()
      const base = sc.getBoundingClientRect().top
      let current: DayId = 'mon'
      const atEnd = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4
      for (const d of atEnd ? [] : DAY_IDS) {
        const el = sections.current[d]
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if ((rect.bottom - base) / scale > offset + 24) {
          current = d
          break
        }
      }
      if (atEnd) current = DAY_IDS[DAY_IDS.length - 1]
      setActive((prev) => (prev === current ? prev : current))
    }
    sc.addEventListener('scroll', onScroll, { passive: true })
    return () => sc.removeEventListener('scroll', onScroll)
  }, [offset])

  // deep link / navigate({ tab: 'week', params: { day } })
  useEffect(() => {
    if (!day) return
    const id = window.setTimeout(() => scrollToDay(day, 'auto'), 60)
    return () => window.clearTimeout(id)
  }, [day, scrollToDay])

  const byDay = useMemo(() => {
    const map = {} as Record<DayId, typeof plan>
    for (const d of DAY_IDS) map[d] = []
    for (const m of plan) map[m.day]?.push(m)
    for (const d of DAY_IDS) map[d].sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot])
    return map
  }, [plan])

  // banner: meals the "AI" changed after feedback
  const adaptedIds = learning && glowIds.length && learning.changedMealIds.some((id) => glowIds.includes(id)) ? learning.changedMealIds : []

  const todayIdx = dayIndex(today)

  return (
    <Screen
      title={t(S.tabs.week)}
      subtitle={t(week.label)}
      avatar
      scrollRef={scrollRef}
    >
      {/* Own sticky wrapper: Screen's stickyHeader sticks one nav-bar height too low (see notes). */}
      <StickyStrip scrollRef={scrollRef} navH={safeTop + NAV_BAR_H}>
        <DayStrip days={week.days} today={today} active={active} onPick={scrollToDay} />
      </StickyStrip>
      <div className="space-y-6 px-4 pt-3">
        <SummaryCard fromDay={today} />

        <AnimatePresence initial={false}>
          {adaptedIds.length > 0 && learning && (
            <motion.div
              key="adapted"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={spring.default}
            >
              <Card padding="sm" className="flex items-start gap-3 !bg-accent-tint">
                <span className="mt-0.5 text-[22px]">✨</span>
                <div className="min-w-0 flex-1">
                  <div className="text-subhead font-semibold text-label">{t(T.adaptedBanner)}</div>
                  <div className="text-footnote text-label-2">{t(learning.message)}</div>
                </div>
                <Button variant="plain" size="sm" onClick={() => scrollToMeal(adaptedIds[0])}>
                  {t(T.show)}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {week.days.map((d) => (
          <DaySection
            key={d.id}
            day={d}
            isToday={d.id === today}
            isTomorrow={dayIndex(d.id) === todayIdx + 1}
            meals={byDay[d.id]}
            store={store}
            glowIds={glowIds}
            sectionRef={(el) => {
              sections.current[d.id] = el
            }}
          />
        ))}
      </div>
    </Screen>
  )
}

// ---------------------------------------------------------------------------
// Sticky wrapper with a material that appears once stuck under the nav bar
// ---------------------------------------------------------------------------
function StickyStrip({ scrollRef, navH, children }: { scrollRef: RefObject<HTMLDivElement | null>; navH: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const stuck = useMotionValue(0)
  const opacity = useSpring(stuck, { bounce: 0, duration: 0.2 })
  useEffect(() => {
    // Screen assigns scrollRef in its own effect (after ours), so fall back to the DOM.
    const sc = scrollRef.current ?? ref.current?.closest<HTMLElement>('.ios-scroll')
    if (!sc) return
    const check = () => {
      const el = ref.current
      if (!el) return
      const rel = (el.getBoundingClientRect().top - sc.getBoundingClientRect().top) / getDeviceScale()
      stuck.set(rel <= navH + 1 && sc.scrollTop > 4 ? 1 : 0)
    }
    check()
    sc.addEventListener('scroll', check, { passive: true })
    return () => sc.removeEventListener('scroll', check)
  }, [scrollRef, navH, stuck])
  return (
    <div ref={ref} className="sticky top-0 z-10">
      <motion.div aria-hidden className="absolute inset-0 material-bar hairline-b" style={{ opacity }} />
      <div className="relative">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Day strip (sticky)
// ---------------------------------------------------------------------------
function DayStrip({ days, today, active, onPick }: { days: DemoDay[]; today?: DayId; active: DayId; onPick: (d: DayId) => void }) {
  const t = useT()
  return (
    <div className="grid grid-cols-7 gap-1 px-3 pb-2 pt-1.5" style={{ height: STRIP_H }} role="tablist">
      {days.map((d) => {
        const selected = d.id === active
        const isToday = d.id === today
        const num = Number(d.date.slice(8, 10))
        return (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={t(d.long)}
            onClick={() => onPick(d.id)}
            className="flex flex-col items-center gap-0.5 select-none transition-transform duration-100 ease-out active:scale-95"
          >
            <span className={clsx('text-caption font-semibold', isToday ? 'text-primary' : 'text-label-2')}>{t(d.short)}</span>
            <span className="relative flex size-9 items-center justify-center">
              {selected && (
                <motion.span
                  layoutId="week-day-pill"
                  className={clsx('absolute inset-0 rounded-full', isToday ? 'bg-primary' : 'bg-label')}
                  transition={spring.snappy}
                />
              )}
              {!selected && isToday && <span className="absolute inset-0 rounded-full ring-[1.5px] ring-primary" />}
              <span
                className={clsx(
                  'relative text-[17px] font-semibold tnum',
                  selected ? (isToday ? 'text-on-primary' : 'text-bg') : isToday ? 'text-primary' : 'text-label',
                )}
              >
                {num}
              </span>
            </span>
            <span className="flex h-1.5 items-center gap-0.5">
              {d.holiday && <span className="size-1.5 rounded-full bg-danger" />}
              {d.fasting && <span className="size-1.5 rounded-full bg-success" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary card
// ---------------------------------------------------------------------------
function SummaryCard({ fromDay }: { fromDay: DayId }) {
  const t = useT()
  const tp = useTp()
  const lang = useLang()
  const plan = usePlan()
  const pantry = usePantry()
  const store = useSelectedStore()
  const budget = useBudget()
  const summary = useMemo(() => planSummary(plan, pantry, store), [plan, pantry, store])
  const [busy, setBusy] = useState(false)
  const left = budget - summary.total

  const regenerate = () => {
    if (busy) return
    setBusy(true)
    window.setTimeout(() => {
      const { undo, changedMealIds } = regenerateWeek(fromDay)
      setBusy(false)
      if (!changedMealIds.length) {
        toast(T.regenNone, { icon: '👌' })
        return
      }
      toast(tp(changedMealIds.length, T.regenDone), {
        icon: '✨',
        description: T.regenKept,
        action: { label: S.undo, onClick: undo },
      })
    }, 650)
  }

  return (
    <Card padding="md">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-subhead font-semibold text-label-2">{t(T.weekCost)}</span>
        <span className="truncate text-footnote text-label-3">
          {t(T.atStore, { store: storeById(store)?.name ?? '' })} · {t(S.indicativePrices)}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <AnimatedNumber value={summary.total} format="eur" className="text-title-1 font-bold text-label" />
        <span className="text-subhead text-label-2 tnum">{t(T.ofBudget, { b: formatEUR(budget, lang, { decimals: 0 }) })}</span>
      </div>
      <BudgetBar value={summary.total} budget={budget} showLabels={false} className="mt-2.5" />
      <div className={clsx('mt-1.5 text-footnote font-medium tnum', left < 0 ? 'text-danger' : 'text-label-2')}>
        {left >= 0 ? t(T.left, { v: formatEUR(left, lang) }) : t(T.over, { v: formatEUR(-left, lang) })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat emoji="♻️" text={tp(summary.reusedIngredients, T.reused)} />
        <Stat emoji="🍱" text={tp(summary.leftoverMeals, T.leftovers)} />
        <Stat emoji="🍽️" text={tp(summary.meals, T.meals)} />
        <Stat emoji="🛡️" text={t(T.noAllergens)} />
      </div>

      <Button
        variant="tinted"
        size="md"
        full
        className="mt-4"
        loading={busy}
        icon={busy ? undefined : <ArrowsClockwiseIcon weight="bold" />}
        onClick={regenerate}
      >
        {busy ? t(T.regenerating) : t(T.regenerate)}
      </Button>
    </Card>
  )
}

function Stat({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[12px] bg-fill-4 px-2.5 py-2">
      <span className="text-[16px]">{emoji}</span>
      <span className="min-w-0 text-footnote leading-[16px] text-label">{text}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Day section
// ---------------------------------------------------------------------------
function DaySection({
  day,
  isToday,
  isTomorrow,
  meals,
  store,
  glowIds,
  sectionRef,
}: {
  day: DemoDay
  isToday: boolean
  isTomorrow: boolean
  meals: ReturnType<typeof usePlan>
  store: ReturnType<typeof useSelectedStore>
  glowIds: string[]
  sectionRef: (el: HTMLElement | null) => void
}) {
  const t = useT()
  const plan = usePlan()
  const cost = useMemo(() => dayCost(plan, day.id, store), [plan, day.id, store])
  return (
    <section ref={sectionRef} aria-label={t(day.long)}>
      <div className="mb-2 flex items-end justify-between gap-2 px-1">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-title-3 text-label">
            <span className="truncate">{t(day.long)}</span>
            {isToday && <Badge tone="solid">{t(T.today)}</Badge>}
            {isTomorrow && <Badge tone="neutral">{t(T.tomorrow)}</Badge>}
          </h2>
          {day.note && (
            <p className="mt-0.5 flex items-center gap-1 text-footnote text-label-2">
              {day.fasting ? <span>🌿</span> : day.holiday ? <span>🇬🇷</span> : <SparkleIcon className="text-primary" weight="fill" />}
              <span>{t(day.note)}</span>
            </p>
          )}
        </div>
        <span className="shrink-0 pb-0.5 text-footnote text-label-2 tnum">
          <AnimatedNumber value={cost} format="eur" />
        </span>
      </div>
      <div className="overflow-hidden rounded-[14px] bg-bg-grouped-2 shadow-card">
        {meals.map((m, i) => (
          <MealRow key={m.id} meal={m} store={store} glow={glowIds.includes(m.id)} last={i === meals.length - 1} />
        ))}
      </div>
    </section>
  )
}
