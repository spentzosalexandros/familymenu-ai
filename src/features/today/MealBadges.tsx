import type { ReactNode } from 'react'
import { Badge } from '../../ui'
import { childIds, getRecipe, isFastingDay, prefOf } from '../../data'
import type { MemberId, PlannedMeal } from '../../data/types'
import { useT } from '../../i18n'
import { FROM_DAY, GENITIVE, S as T } from './strings'

/** Children who love at least one of the recipe's food tags (initial taste profile). */
export function lovedBy(recipeId: string): MemberId[] {
  const r = getRecipe(recipeId)
  if (!r) return []
  return childIds.filter((c) => r.foodTags.some((tag) => prefOf(c, tag) === 'love'))
}

/** ⭐ favourite · 🌿 fasting · ♻️ leftovers · ×2 batch · adapted. SafeBadge is rendered by the caller. */
export function MealBadges({ meal, recipeId, adapted, max = 3 }: { meal?: PlannedMeal; recipeId: string; adapted?: boolean; max?: number }) {
  const t = useT()
  const r = getRecipe(recipeId)
  if (!r) return null
  const out: ReactNode[] = []
  if (adapted || meal?.adaptedFor) {
    out.push(
      <Badge key="adapted" tone="accent" emoji="✨">
        {t(T.adapted)}
      </Badge>,
    )
  }
  if (meal?.leftoverOf) {
    const day = meal.leftoverOf.split('-')[0]
    out.push(
      <Badge key="left" tone="success" emoji="♻️">
        {FROM_DAY[day] ? t(T.leftoverFrom, { day: t(FROM_DAY[day]) }) : t(T.leftover)}
      </Badge>,
    )
  }
  if (meal?.batch && meal.batch > 1) {
    out.push(
      <Badge key="batch" tone="success" emoji="♻️">
        {t(T.batch)}
      </Badge>,
    )
  }
  const fans = lovedBy(recipeId)
  if (fans.length > 1) {
    out.push(
      <Badge key="fav-kids" tone="warning" emoji="⭐">
        {t(T.favKids)}
      </Badge>,
    )
  } else if (fans.length === 1) {
    out.push(
      <Badge key={`fav-${fans[0]}`} tone="warning" emoji="⭐">
        {t(T.favOf, { who: t(GENITIVE[fans[0]]) })}
      </Badge>,
    )
  }
  if ((meal && isFastingDay(meal.day)) || r.tags.includes('fasting')) {
    out.push(
      <Badge key="fast" tone="primary" emoji="🌿">
        {t(T.fasting)}
      </Badge>,
    )
  }
  return <>{out.slice(0, max)}</>
}
