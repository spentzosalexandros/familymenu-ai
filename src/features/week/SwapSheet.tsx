import { BookOpenTextIcon, CheckCircleIcon, ClockIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { openRecipe, toast, useScreen } from '../../app'
import {
  alternativesFor,
  dayName,
  getRecipe,
  isFastingDay,
  isFastingFriendly,
  mealCostDelta,
  servingCost,
  slots,
  swapCostDelta,
} from '../../data'
import type { Alternative, L10n, PlannedMeal, StoreId } from '../../data/types'
import { S, formatEUR, formatMinutes, useLang, useT } from '../../i18n'
import { useMeal, usePlan, useSelectedStore } from '../../store'
import { Badge, Button, Card, Chip, EmptyState, FoodImage, SafeBadge, Screen, haptic, spring } from '../../ui'
import { useKidLoves } from './meal-info'
import { swapMealInPlan } from './planOps'
import { DAY_GEN, LOVED_BY, T } from './strings'

type Filter = 'quick' | 'cheap' | 'fasting' | 'kids'
const FILTERS: { id: Filter; label: L10n; emoji: string }[] = [
  { id: 'quick', label: T.filterQuick, emoji: '⏱️' },
  { id: 'cheap', label: T.filterCheap, emoji: '💶' },
  { id: 'fasting', label: T.filterFasting, emoji: '🌿' },
  { id: 'kids', label: T.filterKids, emoji: '⭐' },
]

type Option = Alternative & { delta: number }

export function SwapSheet({ mealId }: { mealId: string }) {
  const t = useT()
  const lang = useLang()
  const meal = useMeal(mealId)
  const plan = usePlan()
  const store = useSelectedStore()
  const kidLoves = useKidLoves()
  const { close } = useScreen()
  const [filters, setFilters] = useState<Filter[]>([])
  const [chosen, setChosen] = useState<{ recipeId: string; frozen: Option[] } | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  const options = useMemo<Option[]>(() => {
    if (!meal) return []
    const cur = getRecipe(meal.recipeId)
    const pool = alternativesFor(plan, meal.id, filters.length ? 99 : undefined)
    let list = pool.filter((a) => {
      const r = getRecipe(a.recipeId)
      if (!r || !cur) return false
      if (filters.includes('quick') && !(r.minutes < cur.minutes)) return false
      if (filters.includes('cheap') && !(mealCostDelta(cur.id, r.id, store) < -0.3)) return false
      if (filters.includes('fasting') && !isFastingFriendly(r.id)) return false
      if (filters.includes('kids') && !(r.tags.includes('kid-favorite') || kidLoves(r.id).length > 0)) return false
      return true
    })
    if (filters.includes('cheap') && cur) list = [...list].sort((a, b) => mealCostDelta(cur.id, a.recipeId, store) - mealCostDelta(cur.id, b.recipeId, store))
    else if (filters.includes('quick')) list = [...list].sort((a, b) => (getRecipe(a.recipeId)?.minutes ?? 0) - (getRecipe(b.recipeId)?.minutes ?? 0))
    list = list.slice(0, filters.length ? 4 : 3)
    return list.map((a) => ({ ...a, delta: swapCostDelta(plan, meal.id, a.recipeId, store) }))
  }, [meal, plan, store, filters, kidLoves])

  if (!meal) {
    return (
      <Screen title={t(T.swapTitle)}>
        <div className="px-4 pt-10">
          <EmptyState emoji="🤔" title={t(T.notFound)} />
        </div>
      </Screen>
    )
  }

  const shown = chosen?.frozen ?? options
  const leftoverOfThis = plan.filter((m) => m.leftoverOf === meal.id)

  const choose = (opt: Option) => {
    if (chosen) return
    const recipe = getRecipe(opt.recipeId)
    haptic(10)
    setChosen({ recipeId: opt.recipeId, frozen: options })
    const undo = swapMealInPlan(meal.id, opt.recipeId)
    toast(t(T.swappedToast, { name: recipe ? t(recipe.name) : '' }), {
      icon: '🔄',
      description: deltaText(opt.delta, lang, t),
      action: { label: S.undo, onClick: undo },
    })
    closeTimer.current = window.setTimeout(() => close(), 750)
  }

  const toggle = (f: Filter) => setFilters((fs) => (fs.includes(f) ? fs.filter((x) => x !== f) : [...fs, f]))

  return (
    <Screen title={t(T.swapTitle)}>
    <div className="space-y-5 px-4 pb-6 pt-2">
      <CurrentMeal meal={meal} store={store} />

      {meal.leftoverOf && <Note>{t(T.leftoverNote)}</Note>}
      {!meal.leftoverOf && leftoverOfThis.length > 0 && (
        <Note>{t(T.batchNote, { day: lang === 'el' ? DAY_GEN[leftoverOfThis[0].day].el : DAY_GEN[leftoverOfThis[0].day].en })}</Note>
      )}

      <div>
        <div className="mb-2 px-1">
          <h2 className="text-title-3 text-label">{t(T.suggestions)}</h2>
          <p className="text-footnote text-label-2">{t(T.suggestionsHint)}</p>
        </div>
        <div className="ios-hscroll -mx-4 flex gap-2 px-4 pb-1" data-no-sheet-drag>
          {FILTERS.map((f) => (
            <Chip key={f.id} size="sm" emoji={f.emoji} selected={filters.includes(f.id)} onToggle={() => toggle(f.id)} disabled={!!chosen}>
              {t(f.label)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((opt) => (
            <motion.div
              key={opt.recipeId}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: chosen && chosen.recipeId !== opt.recipeId ? 0.45 : 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={spring.layout}
            >
              <OptionCard
                opt={opt}
                meal={meal}
                chosen={chosen?.recipeId === opt.recipeId}
                disabled={!!chosen}
                onChoose={() => choose(opt)}
                lovedBy={kidLoves(opt.recipeId)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {shown.length === 0 && (
          <EmptyState
            emoji="🔍"
            title={t(T.noMatch)}
            message={t(T.noMatchBody)}
            action={
              <Button variant="tinted" size="sm" onClick={() => setFilters([])}>
                {t(T.clearFilters)}
              </Button>
            }
          />
        )}
      </div>
      <p className="px-1 text-caption text-label-3">{t(S.indicativePrices)}</p>
    </div>
    </Screen>
  )
}

function deltaText(delta: number, lang: 'el' | 'en', t: ReturnType<typeof useT>) {
  if (Math.abs(delta) < 0.75) return t(T.sameCost)
  return t(T.deltaWeek, { v: formatEUR(delta, lang, { sign: true }) })
}

function Note({ children }: { children: string }) {
  return <p className="rounded-[12px] bg-fill-4 px-3 py-2 text-footnote text-label-2">♻️ {children}</p>
}

// ---------------------------------------------------------------------------
function CurrentMeal({ meal, store }: { meal: PlannedMeal; store: StoreId }) {
  const t = useT()
  const lang = useLang()
  const recipe = getRecipe(meal.recipeId)
  if (!recipe) return null
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 pl-1">
        <span className="truncate text-footnote font-semibold text-label-2">
          {t(T.inPlan)} · {t(T.slotDay, { day: t(dayName(meal.day)), slot: t(slots[meal.slot].label) })}
        </span>
        <button
          type="button"
          onClick={() => openRecipe(meal.recipeId, meal.id)}
          className="flex h-9 shrink-0 items-center gap-1 rounded-full px-1 text-subhead font-semibold text-primary active:opacity-50"
        >
          <BookOpenTextIcon />
          {t(T.recipe)}
        </button>
      </div>
      <Card padding="none" className="ring-2 ring-primary/60">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={meal.recipeId}
            className="flex gap-3 p-3"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={spring.default}
          >
            <FoodImage recipeId={meal.recipeId} aspect="auto" rounded="rounded-[12px]" className="size-[84px] shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-headline text-label">{t(recipe.name)}</div>
              <div className="mt-0.5 flex items-center gap-1 text-footnote text-label-2 tnum">
                <ClockIcon />
                {formatMinutes(recipe.minutes, lang)} · {t(T.perServing, { v: formatEUR(servingCost(recipe.id, store), lang) })}
              </div>
              <div className="mt-1 line-clamp-2 text-footnote text-label-2">
                <span className="font-semibold text-label">{t(T.why)}:</span> {t(meal.reason)}
              </div>
              <div className="mt-1.5">
                <SafeBadge recipeId={recipe.id} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
function OptionCard({
  opt,
  meal,
  chosen,
  disabled,
  onChoose,
  lovedBy,
}: {
  opt: Option
  meal: PlannedMeal
  chosen: boolean
  disabled: boolean
  onChoose: () => void
  lovedBy: ReturnType<ReturnType<typeof useKidLoves>>
}) {
  const t = useT()
  const lang = useLang()
  const r = getRecipe(opt.recipeId)
  if (!r) return null
  const same = Math.abs(opt.delta) < 0.75
  const cheaper = !same && opt.delta < 0
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onChoose}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className={clsx(
        'flex w-full gap-3 rounded-[18px] bg-bg-grouped-2 p-3 text-left shadow-card select-none',
        chosen && 'ring-2 ring-primary',
      )}
    >
      <FoodImage recipeId={r.id} aspect="auto" rounded="rounded-[12px]" className="size-[76px] shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-headline leading-[21px] text-label">{t(r.name)}</span>
          {chosen ? (
            <CheckCircleIcon weight="fill" className="mt-0.5 shrink-0 text-[22px] text-primary" aria-label={t(T.chosen)} />
          ) : null}
        </div>
        <p className="mt-0.5 text-subhead leading-[19px] text-label-2">{t(opt.reason)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <Badge tone="neutral" icon={<ClockIcon />}>
            {formatMinutes(r.minutes, lang)}
          </Badge>
          <Badge tone={same ? 'neutral' : cheaper ? 'success' : 'warning'}>
            {same ? t(T.sameCost) : t(T.deltaWeek, { v: formatEUR(opt.delta, lang, { sign: true }) })}
          </Badge>
          {lovedBy.length > 0 && <Badge tone="warning" emoji="⭐">{t(lovedBy.length > 1 ? T.lovedByBoth : LOVED_BY[lovedBy[0]])}</Badge>}
          {isFastingFriendly(r.id) && isFastingDay(meal.day) && <Badge tone="success" emoji="🌿">{t(T.fasting)}</Badge>}
          <SafeBadge recipeId={r.id} />
        </div>
      </div>
    </motion.button>
  )
}
