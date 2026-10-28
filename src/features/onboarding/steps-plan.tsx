// Question steps 5–7: meals, budget, location (with the mock iOS permission alert).
import { CheckCircleIcon, CircleIcon, LockSimpleIcon, MapPinIcon, NavigationArrowIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { SLOT_IDS, family, slots, stores } from '../../data'
import type { MealSlot } from '../../data'
import { alert, toast } from '../../app'
import { formatEUR, formatMinutes, formatNumber, useLang, useT, useTp } from '../../i18n'
import { S } from '../../i18n'
import { actions, useBudget, usePrefs } from '../../store'
import { AnimatedNumber, ListGroup, ListRow, SegmentedControl, Slider, Switch, spring } from '../../ui'
import { useDraft } from './draft'
import type { WeekdayTime } from './draft'
import { StepPage, goNext } from './layout'
import { T } from './strings'

const BUDGET_MIN = 60
const BUDGET_MAX = 250
/** Local benchmark shown under the budget slider (spec copy: families of 4 in the area). */
const AREA_BENCHMARK = 130

// ---------------------------------------------------------------------------
// meals
// ---------------------------------------------------------------------------
export function MealsStep() {
  const t = useT()
  const lang = useLang()
  const d = useDraft()
  const onCount = SLOT_IDS.filter((s) => d.slots[s]).length
  const toggleSlot = (s: MealSlot, on: boolean) => {
    if (!on && onCount <= 1) {
      toast(T.meals.lastSlot, { icon: '🍽️' })
      return
    }
    d.set({ slots: { ...d.slots, [s]: on } })
  }
  return (
    <StepPage title={t(T.meals.title)} sub={t(T.meals.sub)} cta={t(S.continue)} onCta={goNext}>
      <ListGroup header={t(T.meals.slots)}>
        {SLOT_IDS.map((s) => (
          <ListRow
            key={s}
            icon={<span className="text-[22px]">{slots[s].emoji}</span>}
            title={t(slots[s].label)}
            subtitle={slots[s].time}
            accessory={<Switch checked={d.slots[s]} onChange={(on) => toggleSlot(s, on)} aria-label={t(slots[s].label)} />}
          />
        ))}
      </ListGroup>

      <section className="mx-4 mt-6">
        <div className="px-4 pb-1.5 text-footnote text-label-2">{t(T.meals.time)}</div>
        <SegmentedControl<WeekdayTime>
          value={d.weekdayTime}
          onChange={(v) => d.set({ weekdayTime: v })}
          options={[
            { value: '30', label: `≤ ${formatMinutes(30, lang)}` },
            { value: '45', label: `≤ ${formatMinutes(45, lang)}` },
            { value: 'none', label: t(T.meals.noLimit) },
          ]}
        />
        <div className="px-4 pt-1.5 text-footnote text-label-2">{t(T.meals.timeFooter)}</div>
      </section>

      <ListGroup className="mt-6">
        <ListRow
          icon={<span className="text-[22px]">♻️</span>}
          title={t(T.meals.batch)}
          subtitle={t(T.meals.batchSub)}
          accessory={<Switch checked={d.batch} onChange={(on) => d.set({ batch: on })} aria-label={t(T.meals.batch)} />}
        />
      </ListGroup>
    </StepPage>
  )
}

// ---------------------------------------------------------------------------
// budget
// ---------------------------------------------------------------------------
export function BudgetStep() {
  const t = useT()
  const lang = useLang()
  const saved = useBudget()
  const d = useDraft()
  const value = d.budget ?? saved
  const set = (v: number) => d.set({ budget: v })
  const next = () => {
    actions.setBudget(value)
    goNext()
  }
  return (
    <StepPage title={t(T.budget.title)} sub={t(T.budget.sub)} cta={t(S.continue)} onCta={next} note={t(T.budget.changeLater)}>
      <div className="mx-4 rounded-[18px] bg-bg-grouped-2 px-5 pt-6 pb-5 shadow-card">
        <div className="text-center">
          <AnimatedNumber value={value} format="eur0" className="text-[56px] leading-none font-bold tracking-[-0.03em] text-label tnum" />
          <div className="mt-1.5 text-subhead text-label-2">{t(T.budget.perWeek)}</div>
        </div>
        <div className="mt-6">
          <Slider
            value={value}
            onChange={set}
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={5}
            aria-label={t(T.budget.aria)}
            valueText={formatEUR(value, lang, { decimals: 0 })}
          />
          <div className="mt-1.5 flex justify-between text-footnote text-label-3 tnum">
            <span>{formatEUR(BUDGET_MIN, lang, { decimals: 0 })}</span>
            <span>{formatEUR(BUDGET_MAX, lang, { decimals: 0 })}</span>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 flex items-start gap-3 rounded-[14px] bg-primary-tint p-3.5">
        <MapPinIcon weight="fill" className="mt-0.5 shrink-0 text-[22px] text-primary" />
        <div className="min-w-0">
          <p className="text-subhead font-semibold text-label">
            {t(T.budget.benchmark, { v: formatEUR(AREA_BENCHMARK, lang, { decimals: 0 }) })}
          </p>
          <p className="mt-0.5 text-footnote text-label-2">{t(T.budget.benchmarkSub)}</p>
        </div>
      </div>
    </StepPage>
  )
}

// ---------------------------------------------------------------------------
// location
// ---------------------------------------------------------------------------
/** Pin positions on the mock map (percent), by store order. */
const PINS = [
  { x: 63, y: 34 },
  { x: 24, y: 30 },
  { x: 78, y: 70 },
  { x: 18, y: 76 },
]

export function LocationStep() {
  const t = useT()
  const tp = useTp()
  const lang = useLang()
  const d = useDraft()
  const prefs = usePrefs()
  const known = d.location !== 'unknown'
  const [pulse, setPulse] = useState(0)

  const ask = () =>
    alert({
      title: T.location.alertTitle,
      message: T.location.alertBody,
      actions: [
        { label: T.location.allowOnce, onPress: () => grant('granted') },
        { label: T.location.allowWhile, onPress: () => grant('granted') },
        { label: T.location.deny, onPress: () => grant('postcode') },
      ],
    })
  const grant = (how: 'granted' | 'postcode') => {
    d.set({ location: how })
    setPulse((p) => p + 1)
  }

  const km = (v: number) => `${formatNumber(v, lang, 1, 1)} ${lang === 'el' ? 'χλμ.' : 'km'}`
  const where = d.location === 'postcode' ? t(T.location.byPostcode, { pc: family.postcode }) : t(T.location.near)

  return (
    <StepPage
      title={t(T.location.title)}
      sub={t(T.location.sub)}
      cta={known ? t(T.location.cta) : t(T.location.useLocation)}
      ctaIcon={known ? undefined : <NavigationArrowIcon weight="fill" />}
      onCta={known ? goNext : ask}
      secondary={known ? undefined : t(T.location.postcode)}
      onSecondary={() => grant('postcode')}
      note={
        known ? undefined : (
          <span className="inline-flex items-center gap-1">
            <LockSimpleIcon weight="fill" /> {t(T.location.privacy)}
          </span>
        )
      }
    >
      {/* mock map */}
      <div className="relative mx-4 h-[188px] overflow-hidden rounded-[18px] bg-[#E8EEE4] shadow-card dark:bg-[#1F2A22]">
        <MapStreets />
        <AnimatePresence>
          {known &&
            stores.map((s, i) => {
              const on = prefs.stores.includes(s.id)
              return (
                <motion.div
                  key={s.id}
                  className="absolute"
                  style={{ left: `${PINS[i].x}%`, top: `${PINS[i].y}%` }}
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: on ? 1 : 0.45, y: 0, scale: 1 }}
                  transition={{ ...spring.default, delay: 0.15 + i * 0.08 }}
                >
                  <div className="-translate-x-1/2 -translate-y-full">
                    <div className="flex items-center gap-1 rounded-full bg-bg-grouped-2 py-1 pr-2.5 pl-1 text-caption font-semibold whitespace-nowrap text-label shadow-raised">
                      <span className="flex size-5 items-center justify-center rounded-full text-[10px] text-white" style={{ background: s.color }}>
                        {s.name.slice(0, 1)}
                      </span>
                      {s.name}
                    </div>
                    <div className="mx-auto h-2 w-0.5 bg-label-3" />
                  </div>
                </motion.div>
              )
            })}
        </AnimatePresence>
        {/* you */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {known && d.location === 'granted' && (
            <motion.span
              key={pulse}
              className="absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0A84FF]/25"
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 1.6, ease: 'easeOut', repeat: 2 }}
            />
          )}
          <span
            className={clsx(
              'relative block size-[18px] rounded-full border-[3px] border-white shadow-raised transition-colors duration-300',
              known ? 'bg-[#0A84FF]' : 'bg-label-3',
            )}
          />
        </div>
        <div className="absolute bottom-2.5 left-3 rounded-full material-thin px-2.5 py-1 text-caption font-semibold text-label">
          📍 {t(family.city)} · {where}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {known && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring.default}>
            <ListGroup
              className="mt-6"
              header={`${t(T.location.storesHeader)} · ${tp(prefs.stores.length, T.location.selected, { n: prefs.stores.length })}`}
              footer={t(T.location.storesFooter)}
            >
              {stores.map((s) => {
                const on = prefs.stores.includes(s.id)
                return (
                  <ListRow
                    key={s.id}
                    icon={
                      <span className="flex size-[30px] items-center justify-center rounded-[8px] text-footnote font-bold text-white" style={{ background: s.color }}>
                        {s.name.slice(0, 1)}
                      </span>
                    }
                    title={s.name}
                    subtitle={km(s.distanceKm)}
                    onPress={() => actions.togglePreferredStore(s.id)}
                    chevron={false}
                    accessory={
                      on ? (
                        <CheckCircleIcon weight="fill" className="text-[24px] text-primary" />
                      ) : (
                        <CircleIcon className="text-[24px] text-label-4" />
                      )
                    }
                    aria-label={s.name}
                  />
                )
              })}
            </ListGroup>
            <p className="mx-8 mt-3 text-footnote text-label-3">{t(S.indicativePrices)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </StepPage>
  )
}

function MapStreets() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 360 188" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g className="text-white dark:text-[#33443A]" stroke="currentColor" strokeLinecap="round" fill="none">
        <path d="M-10 120 C 80 110, 160 140, 380 96" strokeWidth="14" />
        <path d="M120 -10 L 150 200" strokeWidth="10" />
        <path d="M250 -10 C 240 60, 270 120, 260 200" strokeWidth="8" />
        <path d="M-10 46 L 380 64" strokeWidth="6" />
        <path d="M40 -10 L 70 200" strokeWidth="5" />
        <path d="M200 -10 L 330 200" strokeWidth="5" />
        <path d="M-10 165 L 380 150" strokeWidth="5" />
      </g>
      <rect x="168" y="70" width="52" height="34" rx="8" className="fill-[#CFE3C6] dark:fill-[#2A3B2F]" />
      <rect x="292" y="12" width="46" height="30" rx="8" className="fill-[#CFE3C6] dark:fill-[#2A3B2F]" />
    </svg>
  )
}
