import { ArrowsClockwiseIcon, BookOpenTextIcon, CaretRightIcon, ClockIcon, SparkleIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { navigate, openModal, openSheet, push } from '../../app'
import { dayIndex, getRecipe, servingCost, slots, storeById } from '../../data'
import type { PlannedMeal } from '../../data/types'
import { S, formatEUR, formatMinutes, parseClock, useLang, useT } from '../../i18n'
import {
  useBudget,
  useClock,
  useDemoDay,
  useInsights,
  useIsAdapted,
  useIsHighlighted,
  useMealsForDay,
  usePendingFeedback,
  usePlan,
  usePlanCost,
  useSelectedStore,
  useToday,
} from '../../store'
import { AnimatedNumber, Badge, Button, Card, FoodImage, Ring, SafeBadge, Screen, SectionHeader, spring } from '../../ui'
import { MealBadges } from './MealBadges'
import { S as T } from './strings'

const slotMinutes = (m: PlannedMeal) => parseClock(slots[m.slot].time)

/** The next cooked meal (lunch or dinner) that hasn't finished yet; falls back to tonight's dinner. */
function pickHero(meals: PlannedMeal[], now: number) {
  const cooked = meals.filter((m) => (m.slot === 'lunch' || m.slot === 'dinner') && !m.eatingOut)
  const upcoming = cooked.find((m) => slotMinutes(m) + 90 > now)
  return { meal: upcoming ?? cooked[cooked.length - 1] ?? meals[0], upcoming: !!upcoming }
}

export function TodayScreen() {
  const t = useT()
  const today = useToday()
  const day = useDemoDay()
  const clock = useClock()
  const meals = useMealsForDay(today)
  const hero = pickHero(meals, clock.minutes)
  const rest = meals.filter((m) => m.id !== hero.meal?.id)

  return (
    <Screen title={t(T.title)} subtitle={day ? t(day.long) : undefined} avatar>
      <div className="space-y-6 pt-1">
        {today === 'sun' && <RecapBanner />}
        {hero.meal && <HeroCard meal={hero.meal} upcoming={hero.upcoming} />}
        <PendingFeedbackCard />
        {rest.length > 0 && (
          <section>
            <SectionHeader title={t(T.restOfDay)} />
            <div className="mx-4 overflow-hidden rounded-[18px] bg-bg-grouped-2 shadow-card">
              {rest.map((m, i) => (
                <MealRow key={m.id} meal={m} past={slotMinutes(m) + 60 < clock.minutes} first={i === 0} />
              ))}
            </div>
          </section>
        )}
        <BudgetCard />
        <InsightCard />
      </div>
    </Screen>
  )
}

// ---------------------------------------------------------------------------
// Hero: next meal
// ---------------------------------------------------------------------------
function HeroCard({ meal, upcoming }: { meal: PlannedMeal; upcoming: boolean }) {
  const t = useT()
  const lang = useLang()
  const store = useSelectedStore()
  const highlighted = useIsHighlighted(meal.id)
  const adapted = useIsAdapted(meal.id)
  const r = getRecipe(meal.recipeId)
  if (!r) return null
  const slot = slots[meal.slot]
  const open = () => push('recipe', { id: meal.recipeId, mealId: meal.id })
  return (
    <motion.div layout transition={spring.layout} className="px-4" data-meal={meal.id}>
      <Card padding="none" highlight={highlighted} className="shadow-raised">
        <button type="button" onClick={open} className="block w-full text-left active:opacity-90" aria-label={t(r.name)}>
          <FoodImage recipeId={meal.recipeId} aspect="16 / 11" rounded="rounded-none" priority>
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full material-regular px-2.5 py-1 text-footnote font-semibold text-label shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
              <span aria-hidden>{slot.emoji}</span>
              {upcoming ? t(T.upNext) : t(T.tonight)} · {t(slot.label)} {slot.time}
            </div>
          </FoodImage>
        </button>
        <div className="space-y-3 p-4 pt-3.5">
          <div>
            <h2 className="text-title-2 font-bold text-label">{t(r.name)}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-subhead text-label-2 tnum">
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="text-[16px]" />
                {formatMinutes(r.minutes, lang)}
              </span>
              <span>{t(T.perServing, { v: formatEUR(servingCost(meal.recipeId, store), lang) })}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <SafeBadge recipeId={meal.recipeId} />
            <MealBadges meal={meal} recipeId={meal.recipeId} adapted={adapted} max={2} />
          </div>
          {meal.reason && (
            <p className="flex gap-1.5 text-subhead text-label-2">
              <SparkleIcon weight="fill" className="mt-[3px] shrink-0 text-[15px] text-accent-ink" />
              <span>{t(meal.reason)}</span>
            </p>
          )}
          <div className="flex gap-2.5 pt-1">
            <Button variant="filled" size="md" className="min-w-0 flex-1" icon={<BookOpenTextIcon weight="bold" />} onClick={open}>
              {t(T.recipe)}
            </Button>
            <Button
              variant="gray"
              tone="primary"
              size="md"
              className="min-w-0 flex-1"
              icon={<ArrowsClockwiseIcon weight="bold" />}
              onClick={() => openSheet('swap', { mealId: meal.id })}
            >
              {t(T.swap)}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Compact meal rows
// ---------------------------------------------------------------------------
function MealRow({ meal, past, first }: { meal: PlannedMeal; past: boolean; first: boolean }) {
  const t = useT()
  const highlighted = useIsHighlighted(meal.id)
  const r = getRecipe(meal.recipeId)
  if (!r) return null
  const slot = slots[meal.slot]
  return (
    <button
      type="button"
      data-meal={meal.id}
      onClick={() => push('recipe', { id: meal.recipeId, mealId: meal.id })}
      className={`relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 active:bg-fill-4 ${highlighted ? 'bg-primary-tint' : ''}`}
    >
      <FoodImage recipeId={meal.recipeId} aspect="1 / 1" rounded="rounded-[10px]" className={`w-14 shrink-0 ${past ? 'opacity-60' : ''}`} />
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center gap-1.5 text-footnote text-label-2">
          <span aria-hidden>{slot.emoji}</span>
          <span>
            {t(slot.label)} · {slot.time}
          </span>
          {past && !meal.eatingOut && <Badge size="sm">{t(T.eaten)}</Badge>}
          {meal.eatingOut && <Badge size="sm" emoji="🍽️">{t(T.eatingOut)}</Badge>}
          {meal.leftoverOf && <Badge size="sm" tone="success" emoji="♻️">{t(T.leftover)}</Badge>}
        </div>
        <div className={`truncate text-headline ${past ? 'text-label-2' : 'text-label'}`}>{t(r.name)}</div>
      </div>
      <CaretRightIcon weight="bold" className="shrink-0 text-[14px] text-label-3" />
      {!first && <span aria-hidden className="absolute top-0 right-0 left-[84px] h-px origin-top scale-y-50 bg-separator" />}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Pending feedback
// ---------------------------------------------------------------------------
function PendingFeedbackCard() {
  const t = useT()
  const pending = usePendingFeedback()
  const plan = usePlan()
  const today = useToday()
  const meal = pending.map((id) => plan.find((m) => m.id === id)).find(Boolean)
  if (!meal) return null
  const r = getRecipe(meal.recipeId)
  if (!r) return null
  const slot = t(slots[meal.slot].label).toLocaleLowerCase()
  const rel = dayIndex(today) - dayIndex(meal.day)
  const q = rel === 1 ? T.fbYesterday : rel === 0 ? T.fbToday : T.fbGeneric
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring.default} className="px-4">
      <Card padding="none" onPress={() => openSheet('feedback', { mealId: meal.id })} className="bg-accent-tint/60">
        <div className="flex items-center gap-3 p-4">
          <FoodImage recipeId={meal.recipeId} aspect="1 / 1" rounded="rounded-[12px]" className="w-16 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-headline text-label">{t(q, { slot })}</div>
            <div className="truncate text-subhead text-label-2">{t(r.name)}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex gap-1 text-[20px] leading-none" aria-hidden>
                <span>😋</span>
                <span>😐</span>
                <span>🙅</span>
              </span>
              <span className="ml-auto inline-flex h-8 items-center gap-0.5 rounded-full bg-primary px-3 text-subhead font-semibold text-on-primary">
                {t(T.fbCta)}
                <CaretRightIcon weight="bold" className="text-[12px]" />
              </span>
            </div>
          </div>
        </div>
        {pending.length > 1 && (
          <div className="hairline-t px-4 py-2 text-footnote text-label-2">{t(T.fbMore, { n: pending.length - 1 })}</div>
        )}
      </Card>
      <p className="px-1 pt-1.5 text-footnote text-label-2">{t(T.fbSub)}</p>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Budget ring
// ---------------------------------------------------------------------------
function BudgetCard() {
  const t = useT()
  const lang = useLang()
  const cost = usePlanCost()
  const budget = useBudget()
  const store = useSelectedStore()
  const ratio = budget > 0 ? cost / budget : 0
  const color = ratio > 1 ? 'var(--danger)' : ratio > 0.96 ? 'var(--warning)' : 'var(--primary)'
  const left = budget - cost
  return (
    <div className="px-4">
      <Card onPress={() => navigate({ tab: 'shop' })} className="flex items-center gap-4">
        <Ring
          value={Math.min(1, ratio)}
          size={92}
          stroke={10}
          color={color}
          aria-label={t(T.budgetRing, { v: formatEUR(cost, lang), b: formatEUR(budget, lang, { decimals: 0 }) })}
        >
          <AnimatedNumber value={cost} format="eur" className="text-[14px] leading-tight font-semibold tracking-tight text-label" />
          <span className="text-caption-2 text-label-2">{t(T.of, { b: formatEUR(budget, lang, { decimals: 0 }) })}</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <div className="text-headline text-label">{t(T.budgetTitle)}</div>
          <div className={`mt-0.5 text-subhead font-medium tnum ${left < 0 ? 'text-danger' : 'text-primary'}`}>
            {left >= 0 ? t(T.left, { v: formatEUR(left, lang) }) : t(T.over, { v: formatEUR(-left, lang) })}
          </div>
          <div className="mt-1 text-footnote text-label-2">{t(T.budgetAt, { store: storeById(store)?.name ?? store })}</div>
          <div className="text-caption text-label-3">{t(S.indicativePrices)}</div>
        </div>
        <CaretRightIcon weight="bold" className="shrink-0 text-[14px] text-label-3" />
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AI insight
// ---------------------------------------------------------------------------
function InsightCard() {
  const t = useT()
  const insights = useInsights()
  const ins = insights.find((i) => i.kind === 'learned' || i.kind === 'waste') ?? insights[0]
  if (!ins) return null
  return (
    <section>
      <SectionHeader title={t(T.learned)} action={t(T.seeAll)} onAction={() => navigate({ tab: 'family' })} />
      <div className="px-4">
        <motion.div key={ins.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={spring.default}>
          <Card className="flex gap-3">
            <div aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-tint text-[22px]">
              {ins.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-body text-label">{t(ins.text)}</p>
              <p className="mt-1 text-footnote text-label-2">{t(ins.when)}</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sunday recap banner
// ---------------------------------------------------------------------------
function RecapBanner() {
  const t = useT()
  return (
    <div className="px-4">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
        onClick={() => openModal('recap')}
        className="relative block w-full overflow-hidden rounded-[18px] p-5 text-left text-on-primary shadow-raised"
        style={{ background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 55%, var(--accent)))' }}
      >
        <div className="text-footnote font-semibold opacity-85">🎉 {t(T.recapKicker)}</div>
        <div className="mt-1 text-title-2 font-bold">{t(T.recapTitle)}</div>
        <div className="mt-1 text-subhead opacity-90">{t(T.recapSub)}</div>
        <span className="mt-4 inline-flex h-9 items-center gap-1 rounded-full bg-white/95 px-4 text-subhead font-semibold text-primary">
          {t(T.recapCta)}
          <CaretRightIcon weight="bold" className="text-[12px]" />
        </span>
      </motion.button>
    </div>
  )
}
