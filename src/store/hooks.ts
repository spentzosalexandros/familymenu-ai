import { useMemo } from 'react'
import {
  cheapestStore,
  family,
  groceryList,
  nextWeek,
  planCost,
  storeTotals,
  week,
} from '../data'
import type { DayId, FoodTag, MemberId, PlannedMeal, Preference, StoreId } from '../data/types'
import { useAppStore } from './store'

// Typed selector hooks. All derived values are memoised from stable store slices,
// so components re-render only when their inputs change.

export const useSettings = () => useAppStore((s) => s.settings)
export const usePalette = () => useAppStore((s) => s.settings.palette)
export const useThemeSetting = () => useAppStore((s) => s.settings.theme)

export const useOnboarding = () => useAppStore((s) => s.onboarding)

// ---------- plan ----------
export const usePlan = () => useAppStore((s) => s.plan)
export const useMeal = (mealId: string | undefined) =>
  useAppStore((s) => (mealId ? s.plan.find((m) => m.id === mealId) : undefined))

const SLOT_ORDER = { breakfast: 0, snack: 1, lunch: 2, dinner: 3 } as const
export function useMealsForDay(day: DayId): PlannedMeal[] {
  const plan = usePlan()
  return useMemo(
    () => plan.filter((m) => m.day === day).sort((a, b) => SLOT_ORDER[a.slot] - SLOT_ORDER[b.slot]),
    [plan, day],
  )
}
/** True while a meal should glow after a swap / feedback / regenerate. */
export const useIsHighlighted = (mealId: string) => useAppStore((s) => s.highlight.includes(mealId))
export const useHighlight = () => useAppStore((s) => s.highlight)
/** Next week: meals with a "προσαρμόστηκε" badge. */
export const useIsAdapted = (mealId: string) => useAppStore((s) => s.adapted.includes(mealId))

// ---------- calendar / clock ----------
export const useClock = () => useAppStore((s) => s.clock)
/** The demo's current day (defaults to TODAY = 'tue'; follows setClock / startNextWeek). */
export const useToday = () => useAppStore((s) => s.clock.day)
export const useWeekIndex = () => useAppStore((s) => s.weekIndex)
/** The DemoWeek currently shown (demo week, or next week after the recap). */
export const useWeek = () => (useAppStore((s) => s.weekIndex) === 1 ? nextWeek : week)
export function useDemoDay(day?: DayId) {
  const w = useWeek()
  const today = useToday()
  const id = day ?? today
  return w.days.find((d) => d.id === id)
}

// ---------- budget & shopping ----------
export const useBudget = () => useAppStore((s) => s.prefs.budget)
export const usePrefs = () => useAppStore((s) => s.prefs)
export const useShopping = () => useAppStore((s) => s.shopping)
export const usePantry = () => useAppStore((s) => s.shopping.pantry)
export const useChecked = () => useAppStore((s) => s.shopping.checked)

/** Grocery list for the current plan (data selector groceryList). */
export function useGroceryList() {
  const plan = usePlan()
  return useMemo(() => groceryList(plan), [plan])
}
/** € per store for the current plan, minus pantry items. */
export function useStoreTotals() {
  const items = useGroceryList()
  const pantry = usePantry()
  return useMemo(() => storeTotals(items, pantry), [items, pantry])
}
export function useCheapestStore(): StoreId {
  const items = useGroceryList()
  const pantry = usePantry()
  return useMemo(() => cheapestStore(items, pantry), [items, pantry])
}
/** The store driving prices: the user's choice, or the cheapest one. */
export function useSelectedStore(): StoreId {
  const chosen = useAppStore((s) => s.shopping.selectedStore)
  const cheapest = useCheapestStore()
  return chosen ?? cheapest
}
/** Weekly plan cost at a store (default: the selected store). */
export function usePlanCost(store?: StoreId) {
  const plan = usePlan()
  const selected = useSelectedStore()
  const st = store ?? selected
  return useMemo(() => planCost(plan, st), [plan, st])
}

// ---------- feedback & learning ----------
export const useFeedbackState = () => useAppStore((s) => s.feedback)
export const useInsights = () => useAppStore((s) => s.feedback.insights)
export const usePendingFeedback = () => useAppStore((s) => s.feedback.pending)
export const useFeedbackEntries = () => useAppStore((s) => s.feedback.entries)
export const useLastLearning = () => useAppStore((s) => s.feedback.last)
export const useTasteChanges = () => useAppStore((s) => s.feedback.tasteChanges)

/** A child's taste profile with this session's feedback moves applied. */
export function useChildTaste(memberId: MemberId): { tag: FoodTag; pref: Preference }[] {
  const changes = useTasteChanges()
  return useMemo(() => {
    const base = family.tastes.find((t) => t.memberId === memberId)?.foods ?? []
    const map = new Map<FoodTag, Preference>(base.map((f) => [f.tag, f.pref]))
    for (const c of changes) if (c.memberId === memberId) map.set(c.tag, c.to)
    return [...map.entries()].map(([tag, pref]) => ({ tag, pref }))
  }, [changes, memberId])
}

// ---------- subscription ----------
export function useTrial() {
  const sub = useAppStore((s) => s.subscription)
  const clock = useClock()
  const w = useWeek()
  return useMemo(() => {
    const start = sub.trialStart ?? '2026-10-26'
    const todayIso = w.days.find((d) => d.id === clock.day)?.date ?? '2026-10-27'
    const days = Math.round((Date.parse(todayIso) - Date.parse(start)) / 86_400_000)
    return { active: sub.status === 'trial', daysLeft: Math.max(0, 7 - days), price: 3.99 }
  }, [sub, clock.day, w])
}

// ---------- navigation ----------
export const useTab = () => useAppStore((s) => s.tab)
