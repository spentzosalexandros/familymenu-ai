// Pure selectors over the demo data. Screens must compute every number through these (no hardcoded totals).
import { alternatives } from './alternatives.ts'
import { childIds, family, prefOf } from './family.ts'
import { feedbackHistory, previousRatings } from './feedback.ts'
import { aisles, ingredients } from './ingredients.ts'
import { initialPlan } from './plan.ts'
import { prices, unitPrice } from './prices.ts'
import { recipes } from './recipes/index.ts'
import { storeIds } from './stores.ts'
import type {
  Alternative,
  DayId,
  FeedbackEntry,
  GroceryItem,
  IngredientId,
  L10n,
  MemberId,
  PlannedMeal,
  PlanSummary,
  PreviousRating,
  Recipe,
  StoreId,
} from './types.ts'
import { DAY_IDS, TODAY, dayIndex, isFastingDay, slotIndex } from './week.ts'

const round2 = (x: number): number => Math.round(x * 100) / 100

// ---------- lookups ----------
export const getRecipe = (id: string): Recipe | undefined => recipes[id]
export const mealById = (plan: PlannedMeal[], id: string): PlannedMeal | undefined => plan.find((m) => m.id === id)
/** Meals of one day, in slot order (breakfast → dinner). */
export const mealsOfDay = (plan: PlannedMeal[], day: DayId): PlannedMeal[] =>
  plan.filter((m) => m.day === day).sort((a, b) => slotIndex(a.slot) - slotIndex(b.slot))
/** Day of a planned-meal id such as 'tue-lunch'. */
export const dayOfMealId = (id: string): DayId => id.split('-')[0] as DayId

// ---------- safety ----------
/** True when the recipe contains none of the allergens of the given members. */
export function isSafeFor(recipeId: string, memberIds: string[]): boolean {
  const r = recipes[recipeId]
  if (!r) return false
  const allergies = new Set(family.members.filter((m) => memberIds.includes(m.id)).flatMap((m) => m.allergies))
  return !r.allergens.some((a) => allergies.has(a))
}
export const allMemberIds: MemberId[] = family.members.map((m) => m.id)
export const isSafeForAll = (recipeId: string): boolean => isSafeFor(recipeId, allMemberIds)

/** No meat, fish, dairy or eggs (Orthodox fasting; olive oil allowed). */
export function isFastingFriendly(recipeId: string): boolean {
  const r = recipes[recipeId]
  if (!r) return false
  return r.ingredients.every(({ id }) => {
    const ing = ingredients[id]
    if (ing.aisle === 'meat-fish' || id === 'turkey') return false
    return !(ing.allergens ?? []).some((a) => a === 'eggs' || a === 'lactose' || a === 'fish' || a === 'shellfish')
  })
}

/** Children who refuse one of the recipe's foods (initial taste profiles), e.g. fish → Νίκος. */
export const refusedBy = (recipeId: string): MemberId[] =>
  childIds.filter((c) => (recipes[recipeId]?.foodTags ?? []).some((t) => prefOf(c, t) === 'refuses'))

/**
 * Can this recipe go in this planned meal? Slot fits, no allergen of any member, fasting-friendly on fasting days,
 * nobody refuses it. Leftover meals ignore the slot (a leftover can be eaten at any meal).
 */
export function fitsMeal(recipeId: string, meal: Pick<PlannedMeal, 'day' | 'slot' | 'leftoverOf'>, opts: { allowRefused?: boolean } = {}): boolean {
  const r = recipes[recipeId]
  if (!r) return false
  if (!meal.leftoverOf && !r.slots.includes(meal.slot)) return false
  if (!isSafeForAll(recipeId)) return false
  if (isFastingDay(meal.day) && !isFastingFriendly(recipeId)) return false
  if (!opts.allowRefused && refusedBy(recipeId).length > 0) return false
  return true
}

// ---------- costs ----------
/** Cooked portions multiplier ("cook once, eat twice" → 2). */
const batchOf = (m: PlannedMeal): number => Math.max(1, m.batch ?? 1)

/** Meals that need shopping: not eaten out, and not leftovers of a meal that is still cooked. */
export function shoppedMeals(plan: PlannedMeal[]): PlannedMeal[] {
  return plan.filter((m) => {
    if (m.eatingOut) return false
    if (!m.leftoverOf) return true
    const src = mealById(plan, m.leftoverOf)
    return !src || !!src.eatingOut // orphaned leftover → it has to be cooked after all
  })
}

/** Aggregated shopping list for the plan, rounded up to retail packs, in aisle order. */
export function groceryList(plan: PlannedMeal[]): GroceryItem[] {
  const acc = new Map<IngredientId, { qty: number; usedIn: string[] }>()
  for (const meal of shoppedMeals(plan)) {
    const r = recipes[meal.recipeId]
    if (!r) continue
    for (const { id, qty } of r.ingredients) {
      const cur = acc.get(id) ?? { qty: 0, usedIn: [] }
      cur.qty += qty * batchOf(meal)
      if (!cur.usedIn.includes(meal.id)) cur.usedIn.push(meal.id)
      for (const dep of plan) if (dep.leftoverOf === meal.id && !dep.eatingOut && !cur.usedIn.includes(dep.id)) cur.usedIn.push(dep.id)
      acc.set(id, cur)
    }
  }
  const items: GroceryItem[] = []
  for (const [ingredientId, { qty, usedIn }] of acc) {
    const packs = Math.max(1, Math.ceil(qty / ingredients[ingredientId].pack.size - 1e-9))
    const price = Object.fromEntries(storeIds.map((s) => [s, round2(packs * prices[s][ingredientId])])) as Record<StoreId, number>
    items.push({ ingredientId, qty: round2(qty), packs, usedIn, price })
  }
  return items.sort((a, b) => {
    const ia = ingredients[a.ingredientId]
    const ib = ingredients[b.ingredientId]
    return aisles[ia.aisle].order - aisles[ib.aisle].order || ia.name.el.localeCompare(ib.name.el, 'el')
  })
}

/** € per store for the list, skipping ingredients already at home (pantry). */
export function storeTotals(items: GroceryItem[], pantry: IngredientId[] = []): Record<StoreId, number> {
  const totals = { sklavenitis: 0, lidl: 0, ab: 0, mymarket: 0 } as Record<StoreId, number>
  for (const it of items) {
    if (pantry.includes(it.ingredientId)) continue
    for (const s of storeIds) totals[s] += it.price[s]
  }
  for (const s of storeIds) totals[s] = round2(totals[s])
  return totals
}

export function cheapestStore(items: GroceryItem[], pantry: IngredientId[] = []): StoreId {
  const t = storeTotals(items, pantry)
  return storeIds.reduce((best, s) => (t[s] < t[best] ? s : best), storeIds[0])
}

/** Best two-store split: every item bought where it is cheaper, over the best pair of stores. */
export function bestSplit(items: GroceryItem[], pantry: IngredientId[] = []): { total: number; byStore: Partial<Record<StoreId, IngredientId[]>> } {
  const list = items.filter((it) => !pantry.includes(it.ingredientId))
  let best: { total: number; byStore: Partial<Record<StoreId, IngredientId[]>> } = { total: Infinity, byStore: {} }
  for (let i = 0; i < storeIds.length; i++) {
    for (let j = i + 1; j < storeIds.length; j++) {
      const a = storeIds[i]
      const b = storeIds[j]
      const byStore: Partial<Record<StoreId, IngredientId[]>> = { [a]: [], [b]: [] }
      let total = 0
      for (const it of list) {
        const s = it.price[a] <= it.price[b] ? a : b
        total += it.price[s]
        byStore[s]!.push(it.ingredientId)
      }
      if (total < best.total - 1e-9) best = { total: round2(total), byStore }
    }
  }
  if (best.total === Infinity) return { total: 0, byStore: {} }
  for (const s of Object.keys(best.byStore) as StoreId[]) if (best.byStore[s]!.length === 0) delete best.byStore[s]
  return best
}

/** Cost of the ingredients one recipe actually uses (4 servings), proportional to the pack price. */
export function mealCost(recipeId: string, store: StoreId): number {
  const r = recipes[recipeId]
  if (!r) return 0
  return round2(r.ingredients.reduce((sum, { id, qty }) => sum + qty * unitPrice(id, store), 0))
}
export const servingCost = (recipeId: string, store: StoreId): number => {
  const r = recipes[recipeId]
  return r ? round2(mealCost(recipeId, store) / r.servings) : 0
}

/** Week cost at a store = the pack-rounded shopping total (same number the Shop tab shows). */
export const planCost = (plan: PlannedMeal[], store: StoreId): number => storeTotals(groceryList(plan))[store]

/** Ingredient cost of the meals of one day (leftovers and eating out cost 0). */
export function dayCost(plan: PlannedMeal[], day: DayId, store: StoreId): number {
  const shopped = new Set(shoppedMeals(plan).map((m) => m.id))
  return round2(plan.filter((m) => m.day === day && shopped.has(m.id)).reduce((s, m) => s + mealCost(m.recipeId, store) * batchOf(m), 0))
}

/** Numbers for summary cards: budget ring, week summary, onboarding "ready". */
export function planSummary(plan: PlannedMeal[], pantry: IngredientId[] = [], store?: StoreId): PlanSummary {
  const items = groceryList(plan)
  const s = store ?? cheapestStore(items, pantry)
  return {
    store: s,
    total: storeTotals(items, pantry)[s],
    budget: family.budget,
    meals: plan.filter((m) => !m.eatingOut).length,
    leftoverMeals: plan.filter((m) => m.leftoverOf && !m.eatingOut).length,
    reusedIngredients: items.filter((it) => it.usedIn.length >= 2).length,
    allergenMeals: plan.filter((m) => !m.eatingOut && !isSafeForAll(m.recipeId)).length,
  }
}

// ---------- swaps ----------
const recipeName = (id: string): L10n => recipes[id]?.name ?? { el: id, en: id }

function autoReason(recipeId: string, current: PlannedMeal): L10n {
  const r = recipes[recipeId]
  const cur = recipes[current.recipeId]
  const fasting = isFastingDay(current.day)
  const pre = fasting ? { el: 'Νηστίσιμο. ', en: 'Fasting-friendly. ' } : { el: '', en: '' }
  const lovedBy = childIds.find((c) => r.foodTags.some((t) => prefOf(c, t) === 'love'))
  let body: L10n
  if (cur && r.minutes <= cur.minutes - 10) body = { el: `Πιο γρήγορο: έτοιμο σε ${r.minutes}’`, en: `Quicker: ready in ${r.minutes}’` }
  else if (cur && mealCost(recipeId, 'lidl') < mealCost(current.recipeId, 'lidl') - 0.5) body = { el: 'Πιο οικονομικό, με απλά υλικά', en: 'Cheaper, with simple ingredients' }
  else if (lovedBy === 'nikos') body = { el: 'Ταιριάζει σε ό,τι λατρεύει ο Νίκος', en: 'Matches what Nikos loves' }
  else if (lovedBy === 'eleni') body = { el: 'Ταιριάζει σε ό,τι λατρεύει η Ελένη', en: 'Matches what Eleni loves' }
  else if (r.tags.includes('hidden-veg')) body = { el: 'Με λαχανικά κρυμμένα μέσα', en: 'With the veg hidden inside' }
  else body = { el: 'Ταιριάζει στα γούστα και στον προϋπολογισμό σας', en: 'Fits your tastes and your budget' }
  return { el: pre.el + body.el, en: pre.en + body.en }
}

/** Every recipe that could replace this meal (safe, right slot, fasting-aware), best first, with generated reasons. */
export function swapCandidates(plan: PlannedMeal[], mealId: string): Alternative[] {
  const meal = mealById(plan, mealId)
  if (!meal) return []
  const usedThisWeek = new Set(plan.map((m) => m.recipeId))
  const sameDay = new Set(plan.filter((m) => m.day === meal.day).map((m) => m.recipeId))
  const slot = meal.slot
  return Object.values(recipes)
    .filter((r) => r.id !== meal.recipeId && !sameDay.has(r.id) && fitsMeal(r.id, { day: meal.day, slot }))
    .map((r) => {
      const score =
        (r.tags.includes('kid-favorite') ? 2 : 0) + (r.tags.includes('quick') ? 1 : 0) + (usedThisWeek.has(r.id) ? -3 : 0) + (r.slots[0] === slot ? 1 : 0)
      return { r, score }
    })
    .sort((a, b) => b.score - a.score || a.r.id.localeCompare(b.r.id))
    .map(({ r }) => ({ recipeId: r.id, reason: autoReason(r.id, meal) }))
}

/**
 * Alternatives to show in the swap sheet for the meal as it is now in `plan`: the curated ones (and the
 * original suggestion, if the user already swapped), topped up with generated candidates. Always safe.
 */
export function alternativesFor(plan: PlannedMeal[], mealId: string, count?: number): Alternative[] {
  const meal = mealById(plan, mealId)
  if (!meal) return []
  const n = count ?? (meal.slot === 'lunch' || meal.slot === 'dinner' ? 3 : 2)
  const original = initialPlan.find((m) => m.id === mealId)
  const curated = alternatives[mealId] ?? []
  const list: Alternative[] = []
  const onCuratedTrack = original && (original.recipeId === meal.recipeId || curated.some((c) => c.recipeId === meal.recipeId))
  if (onCuratedTrack && original) {
    if (original.recipeId !== meal.recipeId) list.push({ recipeId: original.recipeId, reason: original.reason })
    list.push(...curated)
  }
  for (const c of swapCandidates(plan, mealId)) list.push(c)
  const seen = new Set<string>()
  return list
    .filter((a) => {
      if (a.recipeId === meal.recipeId || seen.has(a.recipeId) || !fitsMeal(a.recipeId, { day: meal.day, slot: meal.slot })) return false
      seen.add(a.recipeId)
      return true
    })
    .slice(0, n)
}

/**
 * Replace a planned meal's recipe, keeping "cook once, eat twice" consistent:
 * leftovers of a swapped batch follow it; a swapped leftover becomes a freshly cooked meal.
 */
export function swapMeal(plan: PlannedMeal[], mealId: string, recipeId: string, reason?: L10n): PlannedMeal[] {
  const target = mealById(plan, mealId)
  if (!target || !fitsMeal(recipeId, { day: target.day, slot: target.slot })) return plan
  const why = reason ?? alternativesFor(plan, mealId, 99).find((x) => x.recipeId === recipeId)?.reason ?? autoReason(recipeId, target)
  const swapped = plan.map((m) => {
    if (m.id === mealId) {
      // now cooked fresh, and chosen by the family rather than adapted by the AI
      const next: PlannedMeal = { ...m, recipeId, reason: why }
      delete next.adaptedFor
      delete next.leftoverOf
      return next
    }
    if (m.leftoverOf === mealId) {
      if (fitsMeal(recipeId, m)) return { ...m, recipeId } // leftovers follow the batch
      const standalone: PlannedMeal = { ...m }
      delete standalone.leftoverOf
      return standalone
    }
    return m
  })
  // a batch cooks one portion for itself plus one per leftover meal that still points at it
  return swapped.map((m) => {
    if (!m.batch || m.batch <= 1) return m
    const portions = 1 + swapped.filter((d) => d.leftoverOf === m.id).length
    if (portions >= m.batch) return m
    const next: PlannedMeal = { ...m, batch: portions }
    if (portions === 1) delete next.batch
    return next
  })
}

/** Plan-level € difference of a swap at a store (default: the cheapest store of the current plan). */
export function swapCostDelta(plan: PlannedMeal[], mealId: string, recipeId: string, store?: StoreId): number {
  const s = store ?? cheapestStore(groceryList(plan))
  return round2(planCost(swapMeal(plan, mealId, recipeId), s) - planCost(plan, s))
}

/** Per-meal € difference (4 servings, proportional ingredient cost): what the swap sheet shows per card. */
export const mealCostDelta = (fromRecipeId: string, toRecipeId: string, store: StoreId): number =>
  round2(mealCost(toRecipeId, store) - mealCost(fromRecipeId, store))

/** Week total at the cheapest store (pantry empty). */
const weekTotal = (plan: PlannedMeal[]): number => {
  const items = groceryList(plan)
  return storeTotals(items)[cheapestStore(items)]
}

/**
 * "Νέο πλάνο εβδομάδας": a fresh, deterministic plan from `fromDay` on. Locked, eaten-out and leftover meals stay.
 * Different seeds give different plans; everything stays safe, fasting-aware and within the weekly budget.
 */
export function regeneratePlan(plan: PlannedMeal[], seed = 1, fromDay: DayId = TODAY): PlannedMeal[] {
  let next = plan
  const start = dayIndex(fromDay)
  const limit = Math.max(family.budget - 4, weekTotal(plan))
  const order = [...plan].sort((a, b) => dayIndex(a.day) - dayIndex(b.day) || slotIndex(a.slot) - slotIndex(b.slot))
  order.forEach((meal, i) => {
    if (dayIndex(meal.day) < start || meal.locked || meal.eatingOut || meal.leftoverOf) return
    const options = alternativesFor(next, meal.id, 6)
    const main = meal.slot === 'lunch' || meal.slot === 'dinner'
    const taken = new Set(next.filter((m) => m.id !== meal.id && (m.slot === 'lunch' || m.slot === 'dinner')).map((m) => m.recipeId))
    for (let k = 0; k < options.length; k++) {
      const pick = options[(seed + i + k) % options.length]
      if (main && taken.has(pick.recipeId)) continue
      const candidate = swapMeal(next, meal.id, pick.recipeId, pick.reason)
      if (weekTotal(candidate) > limit) continue
      next = candidate
      break
    }
  })
  return next
}

// ---------- feedback helpers ----------
/** Keep the latest entry per planned meal (user feedback overrides seeded feedback). */
export function latestFeedback(entries: FeedbackEntry[]): FeedbackEntry[] {
  const map = new Map<string, FeedbackEntry>()
  for (const e of entries) map.set(e.plannedMealId, e)
  return [...map.values()]
}

/** Feedback for meals of days strictly before `day` (what has already happened on that demo day). */
export const feedbackBefore = (day: DayId, entries: FeedbackEntry[] = feedbackHistory): FeedbackEntry[] =>
  entries.filter((e) => dayIndex(dayOfMealId(e.plannedMealId)) < dayIndex(day))

/** How the kids rated a recipe the last time: this week's feedback first (latest), then earlier weeks. */
export function lastRatings(recipeId: string, entries: FeedbackEntry[] = []): PreviousRating | undefined {
  const hit = [...entries].reverse().find((e) => e.recipeId === recipeId)
  if (hit) {
    const d = dayOfMealId(hit.plannedMealId)
    const when = DAY_IDS.includes(d) ? { el: 'Αυτή την εβδομάδα', en: 'This week' } : { el: 'Πρόσφατα', en: 'Recently' }
    return { when, ratings: hit.ratings.map(({ memberId, rating }) => ({ memberId, rating })) }
  }
  return previousRatings[recipeId]
}

export { recipeName }
