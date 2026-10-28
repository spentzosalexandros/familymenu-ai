// Plan mutations used by the Week tab and the swap sheet.
//
// WORKAROUND (reported to integration): the store's actions.swapMeal / actions.regeneratePlan use a
// simplified local swap that keeps the old AI reason, ignores the batch size and (for regenerate)
// also rewrites past days and ignores the budget. The data layer's swapMeal / regeneratePlan do it
// right, so the Week feature applies those through the public store API, with the same undo contract.
import { regeneratePlan as regenerate, swapMeal as swapInPlan } from '../../data'
import type { DayId, PlannedMeal } from '../../data/types'
import { useAppStore } from '../../store'
import type { UndoFn } from '../../store'

const changedIds = (before: PlannedMeal[], after: PlannedMeal[]) =>
  after.filter((m) => before.find((b) => b.id === m.id)?.recipeId !== m.recipeId).map((m) => m.id)

/** Swap a meal's recipe (leftovers follow a batch, reason updated). Returns undo. */
export function swapMealInPlan(mealId: string, recipeId: string): UndoFn {
  const { plan, highlight } = useAppStore.getState()
  const next = swapInPlan(plan, mealId, recipeId)
  if (next === plan) return () => {}
  const changed = changedIds(plan, next)
  useAppStore.setState({ plan: next, highlight: changed.includes(mealId) ? changed : [mealId, ...changed] })
  return () => useAppStore.setState({ plan, highlight })
}

/** "Νέο πλάνο εβδομάδας": a fresh plan from today on (locked / leftovers / eaten-out stay). */
export function regenerateWeek(fromDay: DayId): { undo: UndoFn; changedMealIds: string[] } {
  const { plan, highlight, regenCount } = useAppStore.getState()
  const seed = (regenCount ?? 0) + 1
  let next = regenerate(plan, seed, fromDay)
  // a different seed if this one happens to land on the same plan
  if (!changedIds(plan, next).length) next = regenerate(plan, seed + 1, fromDay)
  const changed = changedIds(plan, next)
  useAppStore.setState({ plan: next, highlight: changed, regenCount: seed })
  return { undo: () => useAppStore.setState({ plan, highlight }), changedMealIds: changed }
}
