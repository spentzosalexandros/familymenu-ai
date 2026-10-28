// Shared hooks and small pieces for the family feature. All numbers come from src/data selectors.
import { useEffect, useMemo, useRef, useState } from 'react'
import { dayOfMealId, family, feedbackBefore, feedbackHistory, initialPlan, recapStats } from '../../data'
import type { FeedbackEntry, FoodTag, MemberId, Preference, RecapStats } from '../../data/types'
import { useFeedbackEntries, usePlan, useTasteChanges, useToday, useWeekIndex } from '../../store'
import type { TasteChange } from '../../store'

export const memberOf = (id: string) => family.members.find((m) => m.id === id)
export const children = family.members.filter((m) => m.role === 'child')

/**
 * Feedback that has "happened" on the current demo day: the seeded history before today
 * (the whole week on Sunday) plus everything the user answered in this session.
 */
export function useWeekFeedback(): FeedbackEntry[] {
  const today = useToday()
  const entries = useFeedbackEntries()
  const weekIndex = useWeekIndex()
  return useMemo(() => {
    const seeded = weekIndex === 1 || today === 'sun' ? feedbackHistory : feedbackBefore(today)
    const user = new Set(entries.map((e) => e.plannedMealId))
    return [...seeded.filter((e) => !user.has(e.plannedMealId)), ...entries]
  }, [today, entries, weekIndex])
}

/** Week acceptance (recapStats) for the cards. After the recap, last week's numbers. */
export function useAcceptance(): { stats: RecapStats; lastWeek: boolean } {
  const plan = usePlan()
  const weekIndex = useWeekIndex()
  const fb = useWeekFeedback()
  return useMemo(
    () => ({ stats: recapStats(weekIndex === 1 ? initialPlan : plan, fb), lastWeek: weekIndex === 1 }),
    [plan, fb, weekIndex],
  )
}

/** True when the member has at least one rating in the entries. */
export const hasRatings = (entries: FeedbackEntry[], memberId: MemberId) =>
  entries.some((e) => e.ratings.some((r) => r.memberId === memberId))

/** Per-day acceptance of a child (null = no answers that day). */
export function useDailyAcceptance(memberId: MemberId) {
  const plan = usePlan()
  const weekIndex = useWeekIndex()
  const fb = useWeekFeedback()
  return useMemo(() => {
    const p = weekIndex === 1 ? initialPlan : plan
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
    return days.map((d) => {
      const dayEntries = fb.filter((e) => dayOfMealId(e.plannedMealId) === d)
      if (!hasRatings(dayEntries, memberId)) return { day: d, percent: null as number | null }
      const pct = recapStats(p, dayEntries).acceptance.find((a) => a.memberId === memberId)?.percent ?? 0
      return { day: d, percent: pct }
    })
  }, [plan, fb, weekIndex, memberId])
}

// ---------- taste profile with "move" animations ----------
const seenChanges = new Set<string>()
const changeKey = (c: TasteChange, i: number) => `${i}:${c.memberId}:${c.tag}:${c.to}`

function tasteMap(memberId: MemberId, changes: TasteChange[], skip: Set<string>) {
  const base = family.tastes.find((t) => t.memberId === memberId)?.foods ?? []
  const map = new Map<FoodTag, Preference>(base.map((f) => [f.tag, f.pref]))
  changes.forEach((c, i) => {
    if (c.memberId === memberId && !skip.has(changeKey(c, i))) map.set(c.tag, c.to)
  })
  return map
}

/**
 * The child's taste profile as shown on screen. Changes the profile has not shown yet start in their
 * old column and move to the new one shortly after the screen appears (layout animation).
 */
export function useAnimatedTaste(memberId: MemberId) {
  const changes = useTasteChanges()
  const [held, setHeld] = useState<Set<string>>(() => {
    const s = new Set<string>()
    changes.forEach((c, i) => {
      const k = changeKey(c, i)
      if (c.memberId === memberId && !seenChanges.has(k)) s.add(k)
    })
    return s
  })
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!held.size) return
    timer.current = window.setTimeout(() => {
      held.forEach((k) => seenChanges.add(k))
      setHeld(new Set())
    }, 1100)
    return () => window.clearTimeout(timer.current)
  }, [held])
  // Changes that arrive while the screen is visible animate right away.
  useEffect(() => {
    changes.forEach((c, i) => seenChanges.add(changeKey(c, i)))
  }, [changes])

  return useMemo(() => {
    const map = tasteMap(memberId, changes, held)
    const recent = new Set(changes.filter((c) => c.memberId === memberId).map((c) => c.tag))
    return { map, recent, pending: held.size > 0 }
  }, [memberId, changes, held])
}
