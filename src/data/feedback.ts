// Kids' feedback. The user gives mon-dinner (beat 1) and tue-lunch (beat 2) live in the demo;
// everything else of the week is seeded here so the Sunday recap has a full week to summarise.
import type { FeedbackEntry, FeedbackReason, MemberId, PreviousRating, Rating } from './types.ts'

type R = Rating | [Rating, FeedbackReason]
const entry = (plannedMealId: string, recipeId: string, nikos: R, eleni: R, leftovers: FeedbackEntry['leftovers'] = 'none'): FeedbackEntry => {
  const one = (memberId: MemberId, r: R) => (Array.isArray(r) ? { memberId, rating: r[0], reason: r[1] } : { memberId, rating: r })
  return { plannedMealId, recipeId, ratings: [one('nikos', nikos), one('eleni', eleni)], leftovers }
}

/**
 * Seeded feedback for the demo week, in chronological order. NOT mon-dinner / tue-lunch (given live)
 * and not sun-dinner (the recap is shown on Sunday afternoon). Calibrated so the recap lands on
 * ≈ 82 % overall acceptance (Νίκος ≈ 90 %, Ελένη ≈ 72 %).
 * Use feedbackBefore(day) to show only what has already happened on a given demo day.
 */
export const feedbackHistory: FeedbackEntry[] = [
  entry('mon-lunch', 'lemon-chicken-potatoes', 'all', 'all'),
  entry('tue-dinner', 'potato-omelette', 'all', ['none', 'visible-veg'], 'little'),
  entry('wed-lunch', 'lentil-soup', ['some', 'taste'], ['some', 'texture'], 'little'),
  entry('wed-dinner', 'chickpea-fritters', ['some', 'new-food'], ['some', 'new-food']),
  entry('thu-lunch', 'meatballs-pilaf', 'all', 'all'),
  entry('thu-dinner', 'zucchini-fritters', 'all', 'all'),
  entry('fri-lunch', 'spaghetti-bolognese', 'all', 'all'),
  entry('fri-dinner', 'meatballs-pilaf', 'all', ['some', 'not-hungry']),
  entry('sat-lunch', 'burgers-potatoes', 'all', 'all'),
  entry('sat-dinner', 'homemade-pizza', 'all', 'all'),
  entry('sun-lunch', 'pastitsio', 'all', ['some', 'not-hungry'], 'little'),
]

/** Planned-meal ids that are waiting for feedback on "today" (Tuesday). */
export const pendingFeedback: string[] = ['mon-dinner']

const prev = (el: string, en: string, nikos: Rating, eleni: Rating): PreviousRating => ({
  when: { el, en },
  ratings: [
    { memberId: 'nikos', rating: nikos },
    { memberId: 'eleni', rating: eleni },
  ],
})

/** How the kids rated recipes the last time they were cooked (weeks before the demo week). */
export const previousRatings: Record<string, PreviousRating> = {
  'lemon-chicken-potatoes': prev('Πριν από 2 εβδομάδες', '2 weeks ago', 'all', 'all'),
  'chicken-giouvetsi': prev('Πριν από 3 εβδομάδες', '3 weeks ago', 'some', 'all'),
  'spaghetti-bolognese': prev('Την προηγούμενη εβδομάδα', 'Last week', 'all', 'all'),
  'meatballs-pilaf': prev('Την προηγούμενη εβδομάδα', 'Last week', 'all', 'some'),
  'lentil-soup': prev('Πριν από 2 εβδομάδες', '2 weeks ago', 'some', 'some'),
  'burgers-potatoes': prev('Πριν από 3 εβδομάδες', '3 weeks ago', 'all', 'all'),
  'homemade-pizza': prev('Πριν από 2 εβδομάδες', '2 weeks ago', 'all', 'all'),
  pastitsio: prev('Πριν από 1 μήνα', 'A month ago', 'all', 'some'),
  'potato-omelette': prev('Την προηγούμενη εβδομάδα', 'Last week', 'all', 'some'),
  'tomato-soup-orzo': prev('Την προηγούμενη εβδομάδα', 'Last week', 'some', 'all'),
  'chicken-avgolemono': prev('Πριν από 2 εβδομάδες', '2 weeks ago', 'some', 'all'),
  'chicken-hilopites': prev('Πριν από 1 μήνα', 'A month ago', 'all', 'all'),
  fasolada: prev('Πριν από 3 εβδομάδες', '3 weeks ago', 'some', 'none'),
  'buttered-pasta': prev('Την προηγούμενη εβδομάδα', 'Last week', 'all', 'all'),
  'souvlaki-pita': prev('Πριν από 1 μήνα', 'A month ago', 'all', 'some'),
  'chicken-wraps': prev('Πριν από 2 εβδομάδες', '2 weeks ago', 'all', 'some'),
  'toast-salad': prev('Πριν από 3 εβδομάδες', '3 weeks ago', 'all', 'some'),
  'orzo-tomato': prev('Πριν από 2 εβδομάδες', '2 weeks ago', 'some', 'all'),
  'horiatiki-salad': prev('Πριν από 2 εβδομάδες', '2 weeks ago', 'some', 'none'),
  'cheese-pie': prev('Την προηγούμενη εβδομάδα', 'Last week', 'all', 'all'),
  'oat-pancakes': prev('Πριν από 2 εβδομάδες', '2 weeks ago', 'all', 'all'),
  'honey-pancakes': prev('Πριν από 3 εβδομάδες', '3 weeks ago', 'all', 'all'),
  'yogurt-honey-banana': prev('Την προηγούμενη εβδομάδα', 'Last week', 'some', 'all'),
}
