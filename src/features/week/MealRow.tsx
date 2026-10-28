import {
  ArrowsClockwiseIcon,
  BookOpenTextIcon,
  CaretRightIcon,
  ForkKnifeIcon,
  HouseIcon,
  LockSimpleIcon,
  LockSimpleOpenIcon,
} from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { memo } from 'react'
import type { ReactNode } from 'react'
import { openRecipe, openSheet, toast } from '../../app'
import { ON_DAY, dayName, getRecipe, servingCost, slots } from '../../data'
import type { PlannedMeal, StoreId } from '../../data/types'
import { S, formatEUR, formatMinutes, useLang, useT } from '../../i18n'
import { actions } from '../../store'
import { Badge, ContextMenu, FoodImage, SwipeableRow, spring } from '../../ui'
import type { ContextMenuItem } from '../../ui'
import { useKidLoves } from './meal-info'
import { ADAPTED_FOR, LOVED_BY, T } from './strings'

export type MealRowProps = {
  meal: PlannedMeal
  store: StoreId
  glow: boolean
  last: boolean
}

export const MealRow = memo(function MealRow({ meal, store, glow, last }: MealRowProps) {
  const t = useT()
  const lang = useLang()
  const kidLoves = useKidLoves()
  const recipe = getRecipe(meal.recipeId)
  const slot = slots[meal.slot]
  if (!recipe) return null

  const openSwap = () => openSheet('swap', { mealId: meal.id })
  const toggleLock = () => {
    const next = !meal.locked
    actions.lockMeal(meal.id, next)
    toast(next ? T.lockedToast : T.unlockedToast, {
      icon: next ? '🔒' : '🔓',
      action: { label: S.undo, onClick: () => actions.lockMeal(meal.id, !next) },
    })
  }
  const toggleOut = () => {
    const next = !meal.eatingOut
    const undo = actions.setEatingOut(meal.id, next)
    toast(next ? T.eatOutToast : T.eatHomeToast, { icon: next ? '🍽️' : '🏠', action: { label: S.undo, onClick: undo } })
  }

  const items: ContextMenuItem[] = [
    { key: 'swap', label: T.swap, icon: <ArrowsClockwiseIcon />, onSelect: openSwap },
    {
      key: 'lock',
      label: meal.locked ? T.unlock : T.lock,
      icon: meal.locked ? <LockSimpleOpenIcon /> : <LockSimpleIcon />,
      onSelect: toggleLock,
    },
    {
      key: 'out',
      label: meal.eatingOut ? T.eatHome : T.eatOut,
      icon: meal.eatingOut ? <HouseIcon /> : <ForkKnifeIcon />,
      onSelect: toggleOut,
    },
    { key: 'recipe', label: T.recipe, icon: <BookOpenTextIcon />, onSelect: () => openRecipe(meal.recipeId, meal.id) },
  ]

  const loved = kidLoves(meal.recipeId)
  const main = meal.slot === 'lunch' || meal.slot === 'dinner'
  const badges: { key: string; node: ReactNode }[] = []
  if (meal.adaptedFor)
    badges.push({ key: 'adapted', node: <Badge tone="accent" emoji="✨">{t(ADAPTED_FOR[meal.adaptedFor])}</Badge> })
  if (meal.eatingOut) badges.push({ key: 'out', node: <Badge tone="neutral" emoji="🍽️">{t(T.eatingOut)}</Badge> })
  if (meal.leftoverOf && !meal.eatingOut) {
    const from = meal.leftoverOf.split('-')[0] as PlannedMeal['day']
    const dayLabel = lang === 'el' ? ON_DAY[from].el : dayName(from).en
    badges.push({ key: 'left', node: <Badge tone="success" emoji="♻️">{t(T.leftoverFrom, { day: dayLabel })}</Badge> })
  }
  if (meal.batch && meal.batch > 1 && !meal.eatingOut)
    badges.push({ key: 'batch', node: <Badge tone="primary" emoji="×2">{t(T.batch)}</Badge> })
  if (main && recipe.tags.includes('fasting') && !meal.eatingOut)
    badges.push({ key: 'fast', node: <Badge tone="success" emoji="🌿">{t(T.fasting)}</Badge> })
  if (loved.length && !meal.eatingOut && badges.length < 3)
    badges.push({
      key: 'love',
      node: <Badge tone="warning" emoji="⭐">{t(loved.length > 1 ? T.lovedByBoth : LOVED_BY[loved[0]])}</Badge>,
    })

  const cost = meal.leftoverOf ? 0 : servingCost(meal.recipeId, store)
  const meta = meal.eatingOut
    ? t(T.noCost)
    : [formatMinutes(meal.leftoverOf ? 5 : recipe.minutes, lang), meal.leftoverOf ? t(T.ready) : t(T.perServing, { v: formatEUR(cost, lang) })].join(' · ')

  return (
    <ContextMenu items={items} title={recipe.name}>
      <SwipeableRow
        leading={[
          {
            key: 'lock',
            label: t(meal.locked ? T.unlock : T.lock),
            icon: meal.locked ? <LockSimpleOpenIcon weight="fill" /> : <LockSimpleIcon weight="fill" />,
            color: 'var(--warning)',
            onPress: toggleLock,
          },
        ]}
        trailing={[
          { key: 'swap', label: t(T.swap), icon: <ArrowsClockwiseIcon weight="bold" />, color: 'var(--primary)', onPress: openSwap },
          {
            key: 'out',
            label: t(meal.eatingOut ? T.eatHome : T.eatOut),
            icon: meal.eatingOut ? <HouseIcon weight="fill" /> : <ForkKnifeIcon weight="fill" />,
            color: '#8e8e93',
            onPress: toggleOut,
          },
        ]}
        contentClassName="bg-bg-grouped-2"
      >
        <button
          type="button"
          data-meal={meal.id}
          data-week-meal={meal.id}
          onClick={() => openRecipe(meal.recipeId, meal.id)}
          className="relative flex w-full items-center gap-3 py-2.5 pl-3 pr-2 text-left transition-colors duration-100 select-none active:bg-fill-4"
        >
          {/* glow after a swap / feedback / new plan */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-primary-tint"
            initial={false}
            animate={{ opacity: glow ? 1 : 0 }}
            transition={{ duration: glow ? 0.25 : 1.2, ease: 'easeOut' }}
          />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={meal.recipeId + (meal.eatingOut ? '-out' : '')}
              className="relative flex min-w-0 flex-1 items-center gap-3"
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              transition={spring.default}
            >
              <span className={clsx('relative size-[60px] shrink-0', meal.eatingOut && 'opacity-40 grayscale')}>
                <FoodImage recipeId={meal.recipeId} aspect="auto" rounded="rounded-[12px]" className="size-full" />
                {meal.locked && (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-warning text-[11px] text-white shadow-raised">
                    <LockSimpleIcon weight="fill" />
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-footnote text-label-2">
                  {slot.emoji} {t(slot.label)}
                </span>
                <span className={clsx('block text-headline leading-[21px] text-label', meal.eatingOut && 'text-label-3 line-through decoration-label-3/60')}>
                  {t(recipe.name)}
                </span>
                <span className="mt-0.5 block text-footnote text-label-2 tnum">{meta}</span>
                {badges.length > 0 && (
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {badges.slice(0, 3).map((b) => (
                      <span key={b.key}>{b.node}</span>
                    ))}
                  </span>
                )}
              </span>
            </motion.span>
          </AnimatePresence>
          <CaretRightIcon className="relative shrink-0 text-[15px] text-label-4" weight="bold" />
          {!last && <span aria-hidden className="absolute bottom-0 left-[84px] right-0 h-px origin-bottom scale-y-50 bg-separator" />}
        </button>
      </SwipeableRow>
    </ContextMenu>
  )
})
