import { ArrowsClockwiseIcon, CheckCircleIcon, CircleIcon, ClockIcon, CookingPotIcon, SparkleIcon } from '@phosphor-icons/react'
import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { openModal, openSheet, useScreen, useStatusBarStyle } from '../../app'
import { feedbackBefore, feedbackHistory, getRecipe, ingredients, lastRatings, membersById, servingCost, slots } from '../../data'
import { formatEUR, formatMinutes, useLang, useT } from '../../i18n'
import { actions, useFeedbackEntries, useMeal, usePantry, useSelectedStore, useToday } from '../../store'
import { Avatar, Button, Card, EmptyState, FoodImage, IconButton, SafeBadge, Screen, Stepper, spring } from '../../ui'
import { MealBadges } from '../today/MealBadges'
import { formatQty } from './quantity'
import { DAY_LONG, RATING, S as T } from './strings'

const HERO_H = 340

export function RecipeScreen({ id, mealId }: { id: string; mealId?: string }) {
  const t = useT()
  const lang = useLang()
  const meal = useMeal(mealId)
  // Follow the planned meal if it gets swapped while this screen is open (Αλλαγή from here).
  const [openedWith] = useState(meal?.recipeId)
  const recipeId = meal && openedWith === id ? meal.recipeId : id
  const r = getRecipe(recipeId)
  const store = useSelectedStore()
  const pantry = usePantry()
  const today = useToday()
  const entries = useFeedbackEntries()
  const [servings, setServings] = useState(r?.servings ?? 4)
  const { isTop } = useScreen()

  // Scroll tracking for the stretchy hero (scrollRef is filled by <Screen> before this effect runs).
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const y = useMotionValue(0)
  const [heroVisible, setHeroVisible] = useState(true)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const on = () => y.set(el.scrollTop)
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [y])
  useMotionValueEvent(y, 'change', (v) => {
    const vis = v < HERO_H - 110
    if (vis !== heroVisible) setHeroVisible(vis)
  })
  useStatusBarStyle('light', isTop && heroVisible)
  const heroScale = useTransform(y, (v) => (v < 0 ? 1 + -v / HERO_H : 1))
  const heroY = useTransform(y, (v) => (v < 0 ? v : v * 0.35))

  if (!r) {
    return (
      <Screen title={t(T.recipe)}>
        <EmptyState emoji="🍽️" title={t(T.notFound)} />
      </Screen>
    )
  }

  const members = membersById()
  const rating = lastRatings(recipeId, [...feedbackBefore(today, feedbackHistory), ...entries])
  const scale = servings / r.servings
  const leftover = !!meal?.leftoverOf

  return (
    <Screen
      title={t(r.name)}
      transparentNav={HERO_H}
      backTitle=""
      scrollRef={scrollRef}
      bottomBar={
        <>
          {mealId && (
            <IconButton
              label={t(T.swap)}
              icon={<ArrowsClockwiseIcon weight="bold" />}
              variant="gray"
              size={52}
              onClick={() => openSheet('swap', { mealId })}
            />
          )}
          <Button variant="filled" size="lg" className="min-w-0 flex-1" icon={<CookingPotIcon weight="fill" />} onClick={() => openModal('cook', { id: recipeId })}>
            {t(T.startCooking)}
          </Button>
        </>
      }
    >
      {/* Stretchy hero */}
      <div className="relative overflow-hidden" style={{ height: HERO_H }}>
        <motion.div className="absolute inset-0 origin-top" style={{ scale: heroScale, y: heroY }}>
          <motion.div
            key={recipeId}
            className="absolute inset-0"
            initial={{ opacity: 0.4, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring.gentle}
          >
            <FoodImage recipeId={recipeId} aspect="auto" rounded="rounded-none" priority className="absolute inset-0 h-full w-full" />
          </motion.div>
          <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent" />
        </motion.div>
      </div>

      {/* Body sheet overlapping the hero */}
      <div className="relative -mt-6 rounded-t-[24px] bg-bg-grouped pt-5">
        <div className="space-y-6">
          <header className="space-y-3 px-5">
            {meal && (
              <div className="text-footnote font-semibold text-primary">
                {slots[meal.slot].emoji} {t(DAY_LONG[meal.day])} · {t(slots[meal.slot].label)}
              </div>
            )}
            <motion.h1 key={recipeId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring.default} className="text-title-1 font-bold text-label">
              {t(r.name)}
            </motion.h1>
            <div className="grid grid-cols-3 gap-2">
              <Stat
                icon={<ClockIcon weight="bold" />}
                value={formatMinutes(r.minutes, lang)}
                label={r.activeMinutes && r.activeMinutes < r.minutes ? t(T.handsOn, { v: formatMinutes(r.activeMinutes, lang) }) : t(T.totalTime)}
              />
              <Stat icon={<span>👩‍🍳</span>} value={t(r.difficulty === 'easy' ? T.easy : T.medium)} label={t(T.kcal, { n: r.nutrition.kcal })} />
              <Stat icon={<span>€</span>} value={formatEUR(servingCost(recipeId, store), lang)} label={t(T.perServing)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <SafeBadge recipeId={recipeId} size="md" />
              <MealBadges meal={meal} recipeId={recipeId} max={3} />
            </div>
          </header>

          {/* Why the AI picked it */}
          <div className="px-4">
            <Card className="bg-accent-tint/70">
              <div className="flex items-center gap-1.5 text-footnote font-semibold text-accent-ink">
                <SparkleIcon weight="fill" />
                {t(T.whyTitle)}
              </div>
              <p className="mt-1.5 text-body text-label">{meal?.reason && meal.recipeId === recipeId ? t(meal.reason) : t(T.whyGeneric)}</p>
              {leftover && <p className="mt-2 text-footnote text-label-2">♻️ {t(T.leftoverNote)}</p>}
            </Card>
          </div>

          {/* Kids' last ratings */}
          <div className="px-4">
            <Card>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-headline text-label">{t(T.lastTime)}</h2>
                {rating && <span className="text-footnote text-label-2">{t(rating.when)}</span>}
              </div>
              {rating ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {rating.ratings.map((x) => {
                    const m = members[x.memberId]
                    return (
                      <div key={x.memberId} className="flex items-center gap-2.5 rounded-[12px] bg-fill-4 p-2.5">
                        {m && <Avatar member={m} size={34} />}
                        <div className="min-w-0">
                          <div className="text-subhead font-semibold text-label">{m ? t(m.name) : x.memberId}</div>
                          <div className="truncate text-footnote text-label-2">
                            {RATING[x.rating].emoji} {t(RATING[x.rating].label)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-1.5 text-subhead text-label-2">{t(T.firstTime)}</p>
              )}
            </Card>
          </div>

          {/* Ingredients */}
          <section>
            <div className="flex items-center justify-between px-5 pb-2.5">
              <h2 className="text-title-3 font-bold text-label">{t(T.ingredients)}</h2>
              <Stepper
                variant="inline"
                value={servings}
                min={1}
                max={12}
                onChange={setServings}
                label={t(T.servings)}
                format={(v) => (
                  <span className="min-w-[78px] text-center text-subhead font-semibold tnum">
                    {v === 1 ? t(T.servingsOne) : t(T.servingsN, { n: v })}
                  </span>
                )}
              />
            </div>
            <div className="mx-4 overflow-hidden rounded-[12px] bg-bg-grouped-2">
              {r.ingredients.map((it, i) => {
                const ing = ingredients[it.id]
                if (!ing) return null
                const have = pantry.includes(it.id)
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => actions.togglePantry(it.id)}
                    aria-pressed={have}
                    className="relative flex min-h-[52px] w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-100 active:bg-fill-4"
                  >
                    {i > 0 && <span aria-hidden className="absolute top-0 right-0 left-[52px] h-px origin-top scale-y-50 bg-separator" />}
                    <span aria-hidden className="w-6 text-center text-[20px]">
                      {ing.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-body transition-colors ${have ? 'text-label-3 line-through' : 'text-label'}`}>{t(ing.name)}</span>
                      {it.note && !/πρέζα|pinch|σταγόνες|squeeze/i.test(it.note.el + it.note.en) && <span className="block text-footnote text-label-2">{t(it.note)}</span>}
                    </span>
                    <motion.span key={servings} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} className="text-subhead text-label-2 tnum">
                      {formatQty(ing, it.qty * scale, lang, it.note)}
                    </motion.span>
                    <span className="flex w-[54px] shrink-0 flex-col items-center text-caption-2">
                      {have ? (
                        <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.snappy} className="flex flex-col items-center text-success">
                          <CheckCircleIcon weight="fill" className="text-[24px]" />
                          {t(T.haveIt)}
                        </motion.span>
                      ) : (
                        <span className="flex flex-col items-center text-label-3">
                          <CircleIcon className="text-[24px]" />
                          {t(T.haveIt)}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="px-5 pt-1.5 text-footnote text-label-2">{t(T.haveItHint)}</p>
          </section>

          {/* Steps */}
          <section>
            <h2 className="px-5 pb-2.5 text-title-3 font-bold text-label">{t(T.steps)}</h2>
            <ol className="mx-4 space-y-2">
              {r.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-[14px] bg-bg-grouped-2 p-3.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-tint text-subhead font-bold text-primary tnum">{i + 1}</span>
                  <p className="pt-0.5 text-body text-label">{t(s)}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Kid tip */}
          {r.kidTip && (
            <div className="px-4">
              <Card className="flex gap-3">
                <span aria-hidden className="text-[28px] leading-none">
                  🧒
                </span>
                <div>
                  <div className="text-headline text-label">{t(T.kidTip)}</div>
                  <p className="mt-1 text-body text-label-2">{t(r.kidTip)}</p>
                </div>
              </Card>
            </div>
          )}

          <p className="px-5 text-footnote text-label-3">{t(T.nutrition, { kcal: r.nutrition.kcal, p: r.nutrition.protein })}</p>
        </div>
      </div>
    </Screen>
  )
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-[14px] bg-bg-grouped-2 px-3 py-2.5 shadow-card">
      <div className="flex items-center gap-1 text-[15px] text-primary">{icon}</div>
      <div className="mt-1 truncate text-headline text-label tnum">{value}</div>
      <div className="truncate text-caption text-label-2">{label}</div>
    </div>
  )
}
