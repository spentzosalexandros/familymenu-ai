// Data integrity + calibration check for src/data. Run with plain Node 24 (native type stripping):
//   node scripts/check-data.ts
// Exits with code 1 when any check fails. Prints store totals, the split, cost per day and recap stats.
import {
  DAY_IDS,
  alternatives,
  alternativesFor,
  applyFeedback,
  bestSplit,
  cheapestStore,
  dayCost,
  family,
  feedbackBefore,
  feedbackHistory,
  fitsMeal,
  foodTagInfo,
  groceryList,
  ingredients,
  initialInsights,
  initialPlan,
  isFastingDay,
  isFastingFriendly,
  isSafeFor,
  mealCost,
  nextWeek,
  nextWeekPlan,
  onboarding,
  pendingFeedback,
  planSummary,
  prices,
  recapStats,
  recipes,
  refusedBy,
  regeneratePlan,
  storeIds,
  storeTotals,
  stores,
  swapCostDelta,
  swapMeal,
  week,
} from '../src/data/index.ts'
import type { FeedbackEntry, PlannedMeal, Rating, StoreId } from '../src/data/index.ts'

let failures = 0
let warnings = 0
const fail = (msg: string) => {
  failures++
  console.log(`  ✗ ${msg}`)
}
const warn = (msg: string) => {
  warnings++
  console.log(`  ! ${msg}`)
}
const section = (title: string) => console.log(`\n— ${title}`)
const eur = (x: number) => `${x.toFixed(2).replace('.', ',')} €`
const pct = (a: number, b: number) => `${(((a - b) / b) * 100).toFixed(1)}%`
const members = family.members.map((m) => m.id)

// ---------------------------------------------------------------- catalog (BUILD-SPEC §2)
const CATALOG: [string, string, string][] = [
  ['yogurt-honey-banana', 'Γιαούρτι με μέλι και μπανάνα', 'Yogurt with honey & banana'],
  ['oat-pancakes', 'Τηγανίτες βρώμης με μπανάνα', 'Banana oat pancakes'],
  ['tahini-honey-bread', 'Ψωμί με ταχίνι και μέλι', 'Bread with tahini & honey'],
  ['boiled-eggs-toast', 'Βραστά αυγά με φρυγανιές', 'Boiled eggs with toast'],
  ['cheese-toast-juice', 'Τοστ με τυρί και χυμό πορτοκάλι', 'Cheese toast & orange juice'],
  ['honey-pancakes', 'Τηγανίτες με μέλι', 'Pancakes with honey'],
  ['omelette-bread', 'Ομελέτα με ψωμί', 'Omelette with bread'],
  ['koulouri-milk', 'Κουλούρι Θεσσαλονίκης με γάλα', 'Sesame bread ring & milk'],
  ['koulouri-apple', 'Κουλούρι και μήλο', 'Sesame bread ring & apple'],
  ['turkey-cheese-toast', 'Τοστ με γαλοπούλα και κασέρι', 'Turkey & cheese toastie'],
  ['fruit-salad', 'Φρουτοσαλάτα', 'Fruit salad'],
  ['oat-honey-bar', 'Μπάρα βρώμης με μέλι (χωρίς ξηρούς καρπούς)', 'Nut-free oat & honey bar'],
  ['cheese-pie', 'Τυρόπιτα κουρού', 'Greek cheese pie'],
  ['fruit-yogurt', 'Γιαούρτι με φρούτα', 'Yogurt with fruit'],
  ['breadsticks-grapes', 'Κριτσίνια και σταφύλι', 'Breadsticks & grapes'],
  ['carrot-muffins', 'Μάφινς καρότου', 'Carrot muffins'],
  ['lemon-chicken-potatoes', 'Κοτόπουλο λεμονάτο με πατάτες φούρνου', 'Lemon chicken with roast potatoes'],
  ['chicken-giouvetsi', 'Γιουβέτσι κοτόπουλο με κριθαράκι', 'Chicken giouvetsi with orzo'],
  ['lentil-soup', 'Φακές σούπα', 'Lentil soup'],
  ['meatballs-pilaf', 'Κεφτεδάκια με ρύζι πιλάφι', 'Meatballs with rice pilaf'],
  ['spaghetti-bolognese', 'Μακαρόνια με κιμά', 'Spaghetti with meat sauce'],
  ['burgers-potatoes', 'Μπιφτέκια με πατάτες φούρνου', 'Greek burgers with roast potatoes'],
  ['pastitsio', 'Παστίτσιο', 'Pastitsio'],
  ['chicken-avgolemono', 'Κοτόσουπα αυγολέμονο', 'Chicken avgolemono soup'],
  ['chicken-hilopites', 'Κοτόπουλο με χυλοπίτες', 'Chicken with hilopites pasta'],
  ['fasolada', 'Φασολάδα', 'Bean soup (fasolada)'],
  ['gemista', 'Γεμιστά', 'Stuffed tomatoes & peppers'],
  ['cod-croquettes', 'Ψαροκροκέτες μπακαλιάρου', 'Cod croquettes'],
  ['baked-giant-beans', 'Γίγαντες φούρνου', 'Baked giant beans'],
  ['souvlaki-pita', 'Σουβλάκι χοιρινό με πίτα', 'Pork souvlaki with pita'],
  ['orzo-tomato', 'Κριθαρότο με ντομάτα', 'Tomato orzo'],
  ['chickpea-soup', 'Ρεβιθάδα', 'Chickpea soup'],
  ['spinach-rice', 'Σπανακόρυζο με φέτα', 'Spinach rice with feta'],
  ['potato-omelette', 'Ομελέτα με πατάτες και ντομάτα', 'Potato & tomato omelette'],
  ['chickpea-fritters', 'Ρεβιθοκεφτέδες με σάλτσα ντομάτας', 'Chickpea fritters with tomato sauce'],
  ['zucchini-fritters', 'Κολοκυθοκεφτέδες με γιαούρτι', 'Zucchini fritters with yogurt'],
  ['spinach-pies', 'Σπανακοπιτάκια', 'Mini spinach pies'],
  ['homemade-pizza', 'Σπιτική πίτσα μαργαρίτα', 'Homemade pizza margherita'],
  ['horiatiki-salad', 'Χωριάτικη σαλάτα', 'Greek village salad'],
  ['tomato-soup-orzo', 'Ντοματόσουπα με κριθαράκι', 'Tomato soup with orzo'],
  ['toast-salad', 'Τοστ με σαλάτα', 'Toastie with salad'],
  ['buttered-pasta', 'Μακαρόνια με βούτυρο και τυρί', 'Buttered pasta with cheese'],
  ['chicken-wraps', 'Τορτίγιες με κοτόπουλο και λαχανικά', 'Chicken & veggie wraps'],
  ['greens-pie', 'Χορτόπιτα νηστίσιμη', 'Fasting greens pie'],
]

section('Catalog & recipes')
const catalogIds = new Set(CATALOG.map((c) => c[0]))
for (const [id, el, en] of CATALOG) {
  const r = recipes[id]
  if (!r) {
    fail(`catalog id missing: ${id}`)
    continue
  }
  if (r.name.el !== el || r.name.en !== en) fail(`${id}: name differs from catalog ("${r.name.el}" / "${r.name.en}")`)
}
for (const id of Object.keys(recipes)) if (!catalogIds.has(id)) fail(`recipe not in catalog: ${id}`)
for (const r of Object.values(recipes)) {
  if (r.image !== `/images/food/${r.id}.jpg`) fail(`${r.id}: image path ${r.image}`)
  if (r.servings !== 4) fail(`${r.id}: servings ${r.servings}`)
  const mainOnly = r.slots.some((s) => s === 'lunch' || s === 'dinner')
  const n = r.ingredients.length
  if (n > 12 || n < (mainOnly ? 6 : 2)) fail(`${r.id}: ${n} ingredients`)
  else if (n < 6) console.log(`  · ${r.id}: ${n} ingredients (simple assembly breakfast/snack)`)
  if (r.steps.length < 4 || r.steps.length > 7) fail(`${r.id}: ${r.steps.length} steps (want 4–7)`)
  for (const { id, qty } of r.ingredients) {
    if (!ingredients[id]) fail(`${r.id}: unknown ingredient ${id}`)
    if (!(qty > 0)) fail(`${r.id}: bad qty for ${id}`)
  }
  const union = new Set(r.ingredients.flatMap(({ id }) => ingredients[id]?.allergens ?? []))
  if (union.size !== r.allergens.length || r.allergens.some((a) => !union.has(a))) fail(`${r.id}: allergens ≠ union of ingredient allergens`)
  if (r.tags.includes('fasting') && !isFastingFriendly(r.id)) fail(`${r.id}: tagged fasting but has meat/fish/dairy/eggs`)
  if (!r.kidTip) warn(`${r.id}: no kid tip`)
  if (!r.nutrition.kcal || !r.nutrition.protein) fail(`${r.id}: nutrition missing`)
  for (const t of r.foodTags) if (!foodTagInfo[t]) fail(`${r.id}: food tag "${t}" has no label in foodTagInfo`)
  for (const s of [...r.steps, r.name, ...(r.kidTip ? [r.kidTip] : [])]) if (!s.el.trim() || !s.en.trim()) fail(`${r.id}: empty text`)
}
console.log(`  ${Object.keys(recipes).length} recipes, ${Object.keys(ingredients).length} ingredients`)
const ingCount = Object.keys(ingredients).length
if (ingCount < 60 || ingCount > 80) fail(`ingredient count ${ingCount} (want ~70)`)
const unused = Object.keys(ingredients).filter((id) => !Object.values(recipes).some((r) => r.ingredients.some((i) => i.id === id)))
if (unused.length) warn(`unused ingredients: ${unused.join(', ')}`)

section('Prices')
for (const s of storeIds) for (const id of Object.keys(ingredients)) if (!(prices[s][id] > 0)) fail(`price missing: ${s}/${id}`)
if (stores.length !== 4) fail('want 4 stores')

// ---------------------------------------------------------------- initial plan (BUILD-SPEC §1 table)
section('Initial plan')
const TABLE: Record<string, [string, string, string, string]> = {
  mon: ['oat-pancakes', 'koulouri-apple', 'lemon-chicken-potatoes', 'spinach-rice'],
  tue: ['yogurt-honey-banana', 'turkey-cheese-toast', 'chicken-giouvetsi', 'potato-omelette'],
  wed: ['tahini-honey-bread', 'fruit-salad', 'lentil-soup', 'chickpea-fritters'],
  thu: ['boiled-eggs-toast', 'oat-honey-bar', 'meatballs-pilaf', 'zucchini-fritters'],
  fri: ['cheese-toast-juice', 'cheese-pie', 'spaghetti-bolognese', 'meatballs-pilaf'],
  sat: ['honey-pancakes', 'fruit-yogurt', 'burgers-potatoes', 'homemade-pizza'],
  sun: ['omelette-bread', 'breadsticks-grapes', 'pastitsio', 'tomato-soup-orzo'],
}
const SLOTS = ['breakfast', 'snack', 'lunch', 'dinner'] as const
if (initialPlan.length !== 28) fail(`initialPlan has ${initialPlan.length} meals`)
for (const d of DAY_IDS)
  SLOTS.forEach((slot, i) => {
    const m = initialPlan.find((x) => x.id === `${d}-${slot}`)
    if (!m) return fail(`missing ${d}-${slot}`)
    if (m.day !== d || m.slot !== slot) fail(`${m.id}: day/slot mismatch`)
    if (m.recipeId !== TABLE[d][i]) fail(`${m.id}: ${m.recipeId} ≠ ${TABLE[d][i]}`)
  })
const friDinner = initialPlan.find((m) => m.id === 'fri-dinner')
if (friDinner?.leftoverOf !== 'thu-lunch') fail('fri-dinner must be leftoverOf thu-lunch')
if (initialPlan.find((m) => m.id === 'thu-lunch')?.batch !== 2) fail('thu-lunch must be batch 2')
if (week.days.length !== 7 || week.days[1].date !== '2026-10-27') fail('week dates')
if (!week.days[2].holiday || !week.days[2].fasting || !week.days[2].note) fail('Wed 28 Oct must be holiday + fasting with a note')
if (nextWeek.days[0].date !== '2026-11-02' || nextWeek.days[6].date !== '2026-11-08') fail('next week dates')

// ---------------------------------------------------------------- safety
function checkPlanSafe(plan: PlannedMeal[], label: string, allowTrials = false) {
  for (const m of plan) {
    if (m.eatingOut) continue
    const r = recipes[m.recipeId]
    if (!r) {
      fail(`${label} ${m.id}: unknown recipe ${m.recipeId}`)
      continue
    }
    if (!isSafeFor(m.recipeId, members)) fail(`${label} ${m.id}: ${m.recipeId} contains an allergen of a member (${r.allergens.join(',')})`)
    if (isFastingDay(m.day) && !isFastingFriendly(m.recipeId)) fail(`${label} ${m.id}: ${m.recipeId} is not fasting-friendly on a fasting day`)
    if (!m.leftoverOf && !r.slots.includes(m.slot)) fail(`${label} ${m.id}: ${m.recipeId} does not fit slot ${m.slot}`)
    const refused = refusedBy(m.recipeId)
    if (refused.length && !(allowTrials && refused.every((c) => m.adaptedFor === c))) fail(`${label} ${m.id}: ${m.recipeId} is refused by ${refused.join(',')}`)
    if (m.leftoverOf && !plan.some((s) => s.id === m.leftoverOf)) fail(`${label} ${m.id}: leftover source missing`)
  }
  const ids = new Set(plan.map((m) => m.id))
  if (ids.size !== plan.length) fail(`${label}: duplicate meal ids`)
}
section('Safety (allergens, fasting, refused foods)')
checkPlanSafe(initialPlan, 'plan')
const eleniAllergies = family.members.find((m) => m.id === 'eleni')!.allergies
if (!eleniAllergies.includes('nuts')) fail('Eleni must be allergic to nuts')

section('Alternatives')
for (const m of initialPlan) {
  const alts = alternatives[m.id]
  const want = m.slot === 'lunch' || m.slot === 'dinner' ? 3 : 2
  if (!alts || alts.length !== want) {
    fail(`${m.id}: ${alts?.length ?? 0} alternatives (want ${want})`)
    continue
  }
  const seen = new Set<string>()
  for (const a of alts) {
    if (!recipes[a.recipeId]) fail(`${m.id}: unknown alternative ${a.recipeId}`)
    if (a.recipeId === m.recipeId) fail(`${m.id}: alternative equals the current meal`)
    if (seen.has(a.recipeId)) fail(`${m.id}: duplicate alternative ${a.recipeId}`)
    seen.add(a.recipeId)
    if (!fitsMeal(a.recipeId, { day: m.day, slot: m.slot })) fail(`${m.id}: alternative ${a.recipeId} unsafe / wrong slot / not fasting / refused`)
    if (!a.reason.el || !a.reason.en) fail(`${m.id}: alternative ${a.recipeId} without reason`)
  }
  if (alternativesFor(initialPlan, m.id).length !== want) fail(`${m.id}: alternativesFor() returns ${alternativesFor(initialPlan, m.id).length}`)
}
// swapping each lunch/dinner to each alternative keeps the plan safe (and cook-once-eat-twice consistent)
let swaps = 0
for (const m of initialPlan.filter((x) => x.slot === 'lunch' || x.slot === 'dinner')) {
  for (const a of alternatives[m.id] ?? []) {
    const p = swapMeal(initialPlan, m.id, a.recipeId)
    swaps++
    checkPlanSafe(p, `swap ${m.id}→${a.recipeId}`)
    const changed = p.find((x) => x.id === m.id)!
    if (changed.recipeId !== a.recipeId) fail(`swap ${m.id}→${a.recipeId} not applied`)
    for (const dep of p.filter((x) => x.leftoverOf === m.id)) if (dep.recipeId !== a.recipeId) fail(`swap ${m.id}: leftover ${dep.id} did not follow`)
    const total = planSummary(p).total
    if (total > family.budget + 8) warn(`swap ${m.id}→${a.recipeId}: week ${eur(total)} well over budget`)
  }
}
console.log(`  ${swaps} lunch/dinner swaps checked`)
// a swapped leftover becomes a fresh meal and the batch shrinks
{
  const p = swapMeal(initialPlan, 'fri-dinner', 'buttered-pasta')
  if (p.find((x) => x.id === 'fri-dinner')?.leftoverOf) fail('swapped leftover still marked leftover')
  if (p.find((x) => x.id === 'thu-lunch')?.batch) fail('batch should shrink when its leftover is swapped')
}

// ---------------------------------------------------------------- reasons vs. numbers
section('Reason copy vs. computed numbers')
const cheapest0 = cheapestStore(groceryList(initialPlan))
const reasonChecks: { where: string; from: string; to: string; el: string; leftover: boolean }[] = []
for (const m of initialPlan) {
  reasonChecks.push({ where: m.id, from: m.recipeId, to: m.recipeId, el: m.reason.el, leftover: !!m.leftoverOf })
  for (const a of alternatives[m.id] ?? []) reasonChecks.push({ where: `${m.id}→${a.recipeId}`, from: m.recipeId, to: a.recipeId, el: a.reason.el, leftover: false })
}
for (const c of reasonChecks) {
  // "έτοιμο σε 40’" must match the recipe time (a leftover is "ready in 5’": reheating, not cooking)
  const minutes = c.el.match(/(\d+)\s*(?:’|'|λεπτά)/)
  if (minutes && !c.leftover) {
    const n = Number(minutes[1])
    const r = recipes[c.to]
    if (r.minutes !== n) fail(`${c.where}: says ${n}’ but ${c.to} takes ${r.minutes}’`)
  }
  const delta = mealCost(c.to, cheapest0) - mealCost(c.from, cheapest0)
  // the week total (pack-rounded) must not contradict the copy either: the budget bar moves with it
  const mealId = c.where.split('→')[0]
  const planDelta = c.from === c.to ? 0 : swapCostDelta(initialPlan, mealId, c.to)
  if (/Ίδιο κόστος/.test(c.el) && (Math.abs(delta) > 0.6 || Math.abs(planDelta) > 1)) fail(`${c.where}: "Ίδιο κόστος" but Δ meal ${eur(delta)}, Δ week ${eur(planDelta)}`)
  if (/οικονομικό|φθηνό(?!τερο από το ντελίβερι)/.test(c.el) && !(delta < 0 && planDelta <= 0.5)) fail(`${c.where}: claims cheaper but Δ meal ${eur(delta)}, Δ week ${eur(planDelta)}`)
  if (c.from !== c.to) console.log(`  ${c.where.padEnd(34)} Δ meal ${eur(delta).padStart(8)} · Δ week ${eur(planDelta).padStart(8)}`)
}
const weekdayMain = (m: PlannedMeal) => (m.slot === 'lunch' || m.slot === 'dinner') && ['mon', 'tue', 'wed', 'thu', 'fri'].includes(m.day) && !week.days.find((d) => d.id === m.day)?.holiday
for (const m of initialPlan.filter(weekdayMain)) {
  if (!m.leftoverOf && (recipes[m.recipeId].activeMinutes ?? 0) > family.weekdayMinutes) fail(`${m.id}: ${m.recipeId} needs > ${family.weekdayMinutes}’ hands-on on a weekday`)
  for (const a of alternatives[m.id] ?? []) if ((recipes[a.recipeId].activeMinutes ?? 0) > family.weekdayMinutes) fail(`${m.id}→${a.recipeId}: > ${family.weekdayMinutes}’ hands-on on a weekday`)
}

// ---------------------------------------------------------------- money
section('Store totals (initial plan, empty pantry)')
const items = groceryList(initialPlan)
const totals = storeTotals(items)
const cheapest = cheapestStore(items)
for (const s of storeIds) console.log(`  ${stores.find((x) => x.id === s)!.name.padEnd(16)} ${eur(totals[s]).padStart(9)}  ${s === cheapest ? '← cheapest' : `+${pct(totals[s], totals[cheapest])}`}`)
console.log(`  budget ${eur(family.budget)} · ${items.length} shopping items · ${items.reduce((s, i) => s + i.packs, 0)} packs`)
if (cheapest !== 'lidl') fail(`cheapest store is ${cheapest}, want lidl`)
const t = totals[cheapest]
if (t < 124 || t > 132) fail(`cheapest total ${eur(t)} outside 124–132 €`)
if (t > family.budget) fail('plan over budget')
const lvl = (s: StoreId) => ((totals[s] - totals.lidl) / totals.lidl) * 100
if (lvl('sklavenitis') < 3.5 || lvl('sklavenitis') > 5.5) fail(`Σκλαβενίτης +${lvl('sklavenitis').toFixed(1)}% (want ≈ +4–5%)`)
if (lvl('mymarket') < 6 || lvl('mymarket') > 8) fail(`My Market +${lvl('mymarket').toFixed(1)}% (want ≈ +7%)`)
if (lvl('ab') < 12 || lvl('ab') > 14) fail(`ΑΒ +${lvl('ab').toFixed(1)}% (want ≈ +12–14%)`)
const split = bestSplit(items)
const splitGain = ((totals[cheapest] - split.total) / totals[cheapest]) * 100
console.log(
  `  best split ${eur(split.total)} (−${splitGain.toFixed(1)}% vs cheapest): ` +
    Object.entries(split.byStore)
      .map(([s, ids]) => `${s} ${ids!.length} items`)
      .join(' + '),
)
if (splitGain < 3 || splitGain > 5.5) fail(`split saves ${splitGain.toFixed(1)}% (want ≈ 4%)`)
const pantryTotals = storeTotals(items, ['olive-oil', 'flour'])
if (!(pantryTotals.lidl < totals.lidl)) fail('pantry does not reduce totals')

section('Cost per day (ingredients used, cheapest store)')
for (const d of DAY_IDS) console.log(`  ${d}  ${eur(dayCost(initialPlan, d, cheapest)).padStart(8)}`)
const sum = planSummary(initialPlan)
console.log(`  summary: ${JSON.stringify(sum)}`)
if (sum.allergenMeals !== 0) fail('allergen meals in plan')

// ---------------------------------------------------------------- feedback & the scripted AI
section('Feedback & narrative beats')
for (const id of pendingFeedback) if (!initialPlan.some((m) => m.id === id)) fail(`pending feedback ${id} not in plan`)
for (const e of feedbackHistory) {
  if (e.plannedMealId === 'mon-dinner' || e.plannedMealId === 'tue-lunch') fail(`seeded feedback must not include ${e.plannedMealId}`)
  const m = initialPlan.find((x) => x.id === e.plannedMealId)
  if (!m || m.recipeId !== e.recipeId) fail(`seeded feedback ${e.plannedMealId}: recipe mismatch`)
}
if (feedbackBefore('tue').some((e) => !e.plannedMealId.startsWith('mon'))) fail('feedbackBefore(tue) leaks future days')
if (initialInsights.length < 3 || initialInsights.length > 5) fail(`initialInsights: ${initialInsights.length}`)

const fb = (plannedMealId: string, recipeId: string, nikos: Rating, eleni: Rating, leftovers: FeedbackEntry['leftovers'] = 'none'): FeedbackEntry => ({
  plannedMealId,
  recipeId,
  ratings: [
    { memberId: 'nikos', rating: nikos },
    { memberId: 'eleni', rating: eleni },
  ],
  leftovers,
})
// Beat 1
for (const r of ['none', 'some'] as Rating[]) {
  const res = applyFeedback(initialPlan, fb('mon-dinner', 'spinach-rice', 'all', r))
  const sun = res.plan.find((m) => m.id === 'sun-dinner')!
  if (sun.recipeId !== 'spinach-pies' || sun.adaptedFor !== 'eleni') fail(`beat 1 (${r}): sun-dinner not spinach-pies for Eleni`)
  if (res.message.el !== 'Κατάλαβα! Η Ελένη θέλει το σπανάκι κρυμμένο. Την Κυριακή θα έχει σπανακοπιτάκια 🥧') fail(`beat 1 message: ${res.message.el}`)
  if (!res.tasteChanges.some((c) => c.memberId === 'eleni' && c.tag === 'visible-veg' && c.from === 'eats' && c.to === 'refuses')) fail('beat 1 taste change')
  if (!res.insights.length || !res.changedMealIds.includes('sun-dinner')) fail('beat 1 insight / changed ids')
  checkPlanSafe(res.plan, 'beat1')
}
{
  const res = applyFeedback(initialPlan, fb('mon-dinner', 'spinach-rice', 'some', 'all'))
  if (res.message.el !== 'Μπράβο Ελένη! Το σπανακόρυζο μπαίνει στα αγαπημένα της') fail(`beat 1 (all) message: ${res.message.el}`)
  if (!res.tasteChanges.some((c) => c.memberId === 'eleni' && c.tag === 'spinach' && c.to === 'love')) fail('beat 1 (all) taste change')
  if (res.changedMealIds.length) fail('beat 1 (all) should not change the plan')
  console.log(`  beat 1 → ${res.message.el}`)
}
// Beat 2
{
  const res = applyFeedback(initialPlan, fb('tue-lunch', 'chicken-giouvetsi', 'all', 'all', 'little'))
  if (!res.message.el.startsWith('⭐ Ο Νίκος λάτρεψε το γιουβέτσι, θα το ξαναδεί σε 2 εβδομάδες')) fail(`beat 2 message: ${res.message.el}`)
  if (!res.tasteChanges.some((c) => c.memberId === 'nikos' && c.tag === 'orzo' && c.from === 'eats' && c.to === 'love')) fail('beat 2 taste change')
  const snack = res.plan.find((m) => m.id === 'thu-snack')!
  if (snack.leftoverOf !== 'tue-lunch' || snack.recipeId !== 'chicken-giouvetsi') fail('beat 2: thu-snack should become giouvetsi leftover')
  if (!res.insights.some((i) => i.kind === 'waste')) fail('beat 2: waste insight missing')
  checkPlanSafe(res.plan, 'beat2')
  const before = planSummary(initialPlan).total
  const after = planSummary(res.plan).total
  console.log(`  beat 2 → ${res.message.el}  (week ${eur(before)} → ${eur(after)})`)
  const noLeft = applyFeedback(initialPlan, fb('tue-lunch', 'chicken-giouvetsi', 'all', 'all', 'none'))
  if (noLeft.changedMealIds.length) fail('beat 2 without leftovers should not change the plan')
}
// Beat 3: every other meal gets a message + an insight, never an unsafe plan
for (const m of initialPlan) {
  for (const [n, e] of [['all', 'all'], ['some', 'none'], ['none', 'some']] as [Rating, Rating][]) {
    const res = applyFeedback(initialPlan, fb(m.id, m.recipeId, n, e, 'lots'))
    if (!res.message.el || !res.message.en) fail(`${m.id}: empty message`)
    if (!res.insights.length) fail(`${m.id}: no insight`)
    checkPlanSafe(res.plan, `feedback ${m.id}`)
  }
}
{
  const res = applyFeedback(initialPlan, { plannedMealId: 'wed-lunch', recipeId: 'lentil-soup', ratings: [{ memberId: 'eleni', rating: 'some', reason: 'texture' }] })
  console.log(`  generic → ${res.message.el}`)
}

// ---------------------------------------------------------------- recap
section('Sunday recap')
// [label, plan, feedback, acceptance tolerance in points]
const scenarios: [string, PlannedMeal[], FeedbackEntry[], number][] = []
scenarios.push(['seed only', initialPlan, feedbackHistory, 2])
{
  const b1 = applyFeedback(initialPlan, fb('mon-dinner', 'spinach-rice', 'all', 'some'))
  const b2 = applyFeedback(b1.plan, fb('tue-lunch', 'chicken-giouvetsi', 'all', 'all', 'little'))
  scenarios.push(['scripted demo', b2.plan, [...feedbackHistory, fb('mon-dinner', 'spinach-rice', 'all', 'some'), fb('tue-lunch', 'chicken-giouvetsi', 'all', 'all', 'little')], 2])
  // a deliberately pessimistic path (both kids unhappy with the spinach): numbers may drift a little more
  const c2 = applyFeedback(initialPlan, fb('mon-dinner', 'spinach-rice', 'some', 'none'))
  scenarios.push(['pessimistic demo', c2.plan, [...feedbackHistory, fb('mon-dinner', 'spinach-rice', 'some', 'none'), fb('tue-lunch', 'chicken-giouvetsi', 'all', 'all')], 4])
}
for (const [label, plan, feedback, tol] of scenarios) {
  const s = recapStats(plan, feedback)
  const acc = Object.fromEntries(s.acceptance.map((a) => [a.memberId, a.percent]))
  console.log(
    `  ${label.padEnd(20)} spent ${eur(s.spent)} / ${eur(s.budget)} · ${s.minutesSaved}’ saved · ${s.wasteKgAvoided.toFixed(1).replace('.', ',')} kg · ${s.leftoverMeals} leftovers · ` +
      `acceptance ${s.acceptanceOverall}% (Νίκος ${acc.nikos}%, Ελένη ${acc.eleni}%)`,
  )
  console.log(`  ${''.padEnd(20)} top hits ${s.topHits.map((h) => `${h.memberId}:${h.recipeId}`).join(', ')} · new ${s.newFavorites.map((h) => `${h.memberId}:${h.recipeId}`).join(', ')}`)
  if (s.minutesSaved < 180 || s.minutesSaved > 205) fail(`${label}: minutes saved ${s.minutesSaved} (want ≈ 190)`)
  if (s.wasteKgAvoided < 1.1 || s.wasteKgAvoided > 1.5) fail(`${label}: waste ${s.wasteKgAvoided} kg (want ≈ 1,2)`)
  if (Math.abs((s.acceptanceOverall ?? 0) - 82) > tol) fail(`${label}: overall acceptance ${s.acceptanceOverall}% (want ≈ 82%)`)
  if (Math.abs(acc.nikos - 90) > tol + 1) fail(`${label}: Νίκος ${acc.nikos}% (want ≈ 90%)`)
  if (Math.abs(acc.eleni - 72) > tol + 1) fail(`${label}: Ελένη ${acc.eleni}% (want ≈ 72%)`)
  if (!s.topHits.length || !s.newFavorites.length) fail(`${label}: empty top hits / new favourites`)
  if (s.spent > s.budget) fail(`${label}: over budget`)
}

// ---------------------------------------------------------------- next week & regenerate
section('Next week')
for (const [label, plan, feedback] of scenarios) {
  const nw = nextWeekPlan(plan, feedback)
  checkPlanSafe(nw.plan, `next week (${label})`, true)
  if (nw.plan.length !== 28) fail(`next week (${label}): ${nw.plan.length} meals`)
  if (nw.changedMealIds.length < 2 || nw.changedMealIds.length > 3) fail(`next week (${label}): ${nw.changedMealIds.length} adaptations (want 2–3)`)
  for (const id of nw.changedMealIds) if (!nw.plan.find((m) => m.id === id)?.adaptedFor) fail(`next week ${id}: missing adaptedFor`)
  const s = planSummary(nw.plan)
  console.log(`  ${label.padEnd(20)} ${eur(s.total)} at ${s.store} · adapted: ${nw.changedMealIds.map((id) => `${id}=${nw.plan.find((m) => m.id === id)!.recipeId}→${nw.plan.find((m) => m.id === id)!.adaptedFor}`).join(', ')}`)
  if (s.total > family.budget) fail(`next week (${label}) over budget: ${eur(s.total)}`)
  for (const m of nw.plan) for (const a of alternativesFor(nw.plan, m.id)) if (!fitsMeal(a.recipeId, m)) fail(`next week ${m.id}: unsafe alternative ${a.recipeId}`)
}
section('Regenerate ("Νέο πλάνο εβδομάδας")')
for (const seed of [1, 2, 3]) {
  const p = regeneratePlan(initialPlan, seed)
  checkPlanSafe(p, `regenerate(${seed})`)
  const changed = p.filter((m, i) => m.recipeId !== initialPlan[i].recipeId).length
  const s = planSummary(p)
  console.log(`  seed ${seed}: ${changed} meals changed · ${eur(s.total)} at ${s.store}`)
  if (s.total > family.budget) fail(`regenerate(${seed}) over budget: ${eur(s.total)}`)
  if (p.filter((m) => m.day === 'mon').some((m, i) => m.recipeId !== initialPlan.filter((x) => x.day === 'mon')[i].recipeId)) fail('regenerate changed a past day')
}

// ---------------------------------------------------------------- onboarding & family
section('Onboarding & family')
const tasteTags = new Set(family.tastes.flatMap((t) => t.foods.map((f) => f.tag)))
for (const tag of ['pasta', 'meatballs', 'pizza', 'chicken', 'rice', 'eggs', 'potatoes', 'fish', 'mushrooms', 'visible-veg', 'spinach', 'eggplant', 'orzo', 'yogurt', 'banana', 'legumes'])
  if (!tasteTags.has(tag)) fail(`taste tag ${tag} missing`)
for (const t of family.tastes) if (t.foods.length < 12) fail(`${t.memberId}: only ${t.foods.length} taste tags`)
for (const tag of tasteTags) if (!onboarding.foods.some((f) => f.tag === tag)) fail(`onboarding.foods missing ${tag}`)
for (const c of family.likes) if (!onboarding.cuisines.some((x) => x.id === c.id)) fail(`family like ${c.id} not in onboarding.cuisines`)
for (const c of family.dislikes) if (!onboarding.dislikes.some((x) => x.id === c.id)) fail(`family dislike ${c.id} not in onboarding.dislikes`)
for (const d of family.diets) if (!onboarding.diets.some((x) => x.id === d)) fail(`diet ${d} not in onboarding.diets`)
for (const m of family.members) for (const a of m.allergies) if (!onboarding.allergens.some((x) => x.id === a)) fail(`allergen ${a} not in onboarding.allergens`)

console.log(`\n${failures ? `✗ ${failures} check(s) failed` : '✓ all checks passed'}${warnings ? ` · ${warnings} warning(s)` : ''}`)
if (failures) process.exitCode = 1
