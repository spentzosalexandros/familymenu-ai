// Scripted, deterministic "AI" behaviour (BUILD-SPEC §1 narrative beats). Never returns an unsafe meal.
import { childIds, family, prefOf } from './family.ts'
import { previousRatings } from './feedback.ts'
import { nextWeekBase } from './plan.ts'
import { recipes } from './recipes/index.ts'
import { cheapestStore, fitsMeal, groceryList, latestFeedback, mealById, storeTotals } from './selectors.ts'
import type {
  FeedbackEntry,
  FeedbackReason,
  Insight,
  L10n,
  LearningResult,
  MemberId,
  PlannedMeal,
  Rating,
  RecapStats,
} from './types.ts'
import { ON_DAY, dayIndex, TODAY } from './week.ts'

const JUST_NOW: L10n = { el: 'Μόλις τώρα', en: 'Just now' }
const SCORE: Record<Rating, number> = { all: 1, some: 0.5, none: 0 }

const NAME: Record<MemberId, { el: string; elAcc: string; en: string }> = {
  maria: { el: 'η Μαρία', elAcc: 'τη Μαρία', en: 'Maria' },
  giorgos: { el: 'ο Γιώργος', elAcc: 'τον Γιώργο', en: 'Giorgos' },
  nikos: { el: 'ο Νίκος', elAcc: 'τον Νίκο', en: 'Nikos' },
  eleni: { el: 'η Ελένη', elAcc: 'την Ελένη', en: 'Eleni' },
}
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
/** One headline from several sentences: each gets a full stop when more than one is shown. */
const join = (parts: L10n[]): L10n => {
  const stop = (s: string) => (parts.length > 1 && /[\p{L}\p{N}]$/u.test(s) ? `${s}.` : s)
  return { el: parts.map((p) => stop(p.el)).join(' '), en: parts.map((p) => stop(p.en)).join(' ') }
}

/** Set a meal's recipe only if it is safe and fits the day; otherwise leave the plan untouched. */
function adapt(plan: PlannedMeal[], mealId: string, recipeId: string, reason: L10n, extra: Partial<PlannedMeal> = {}, allowRefused = false): PlannedMeal[] | null {
  const meal = mealById(plan, mealId)
  if (!meal || meal.locked || meal.eatingOut) return null
  const target = { ...meal, ...extra }
  if (!fitsMeal(recipeId, target, { allowRefused })) return null
  return plan.map((m) => (m.id === mealId ? { ...m, ...extra, recipeId, reason } : m))
}

/** What a child would probably say about a recipe, from the taste profile (used when a seeded rating no longer matches the plan). */
export function predictRating(recipeId: string, memberId: MemberId): Rating {
  const tags = recipes[recipeId]?.foodTags ?? []
  const prefs = tags.map((t) => prefOf(memberId, t))
  if (prefs.includes('refuses')) return 'none'
  if (prefs.includes('love')) return 'all'
  if (tags.includes('legumes') || (memberId === 'eleni' && tags.includes('visible-veg'))) return 'some'
  return 'all'
}

// ---------- applyFeedback ----------
const REASON_TEXT: Record<FeedbackReason, { msg: L10n; learned: L10n }> = {
  'visible-veg': {
    msg: { el: 'δεν θέλει να βλέπει τα λαχανικά. Από εδώ και πέρα θα τα κρύβουμε.', en: 'doesn’t like to see the veg. From now on we’ll hide it.' },
    learned: { el: 'τρώει καλύτερα όταν τα λαχανικά δεν φαίνονται.', en: 'eats better when the veg is hidden.' },
  },
  taste: {
    msg: { el: 'δεν ενθουσιάστηκε με τη γεύση. Θα δοκιμάσουμε μια πιο ήπια εκδοχή.', en: 'wasn’t keen on the taste. We’ll try a milder version.' },
    learned: { el: 'προτιμά πιο ήπιες γεύσεις.', en: 'prefers milder flavours.' },
  },
  texture: {
    msg: { el: 'θέλει πιο μαλακή υφή. Θα προτείνουμε βελουτέ ή λιωμένη εκδοχή.', en: 'wants a softer texture. We’ll suggest a smooth or mashed version.' },
    learned: { el: 'προτιμά μαλακές, βελούδινες υφές.', en: 'prefers soft, smooth textures.' },
  },
  'not-hungry': {
    msg: { el: 'δεν πεινούσε. Συμβαίνει! Δεν το μετράμε ως άρνηση.', en: 'wasn’t hungry. It happens! We won’t count it as a no.' },
    learned: { el: 'τρώει λιγότερο όταν έχει φάει κολατσιό αργά.', en: 'eats less after a late snack.' },
  },
  'too-spicy': {
    msg: { el: 'το βρήκε καυτερό. Λιγότερα μπαχαρικά την επόμενη φορά.', en: 'found it too spicy. Fewer spices next time.' },
    learned: { el: 'θέλει τα φαγητά χωρίς πολλά μπαχαρικά.', en: 'likes food without much spice.' },
  },
  'new-food': {
    msg: {
      el: 'το βρήκε καινούργιο. Τα νέα φαγητά θέλουν 8–10 δοκιμές· θα το ξαναδοκιμάσουμε σε μικρή μερίδα.',
      en: 'found it new. New foods take 8–10 tries; we’ll offer it again in a small portion.',
    },
    learned: { el: 'χρειάζεται μικρές, επαναλαμβανόμενες δοκιμές για τα νέα φαγητά.', en: 'needs small, repeated tries of new foods.' },
  },
}

/** Pick the dinner that gets the hidden-spinach pies: Sunday, or the latest free dinner after today. */
function spinachTarget(plan: PlannedMeal[]): string | null {
  const ok = (m: PlannedMeal | undefined) => !!m && !m.locked && !m.eatingOut && !m.leftoverOf && dayIndex(m.day) > dayIndex(TODAY)
  if (ok(mealById(plan, 'sun-dinner'))) return 'sun-dinner'
  const later = plan
    .filter((m) => m.slot === 'dinner' && ok(m) && fitsMeal('spinach-pies', m))
    .sort((a, b) => dayIndex(b.day) - dayIndex(a.day))
  return later[0]?.id ?? null
}

/**
 * The "AI" reacting to one piece of feedback: narrative beats 1–2 of the spec, otherwise a generic,
 * never-dead-end response. Deterministic; plan changes always pass the safety checks.
 */
export function applyFeedback(plan: PlannedMeal[], entry: FeedbackEntry): LearningResult {
  let next = plan
  const insights: Insight[] = []
  const changedMealIds: string[] = []
  const tasteChanges: LearningResult['tasteChanges'] = []
  const messages: L10n[] = []
  const rating = (id: MemberId) => entry.ratings.find((r) => r.memberId === id)
  const recipe = recipes[entry.recipeId]
  const dish = recipe?.name ?? { el: 'το φαγητό', en: 'the dish' }
  const insightId = (suffix: string) => `ins-${entry.plannedMealId}-${suffix}`

  // Beat 1: Monday's spinach rice and Eleni
  const eleni = rating('eleni')
  if (entry.recipeId === 'spinach-rice' && eleni) {
    if (eleni.rating === 'all') {
      messages.push({ el: 'Μπράβο Ελένη! Το σπανακόρυζο μπαίνει στα αγαπημένα της', en: 'Well done Eleni! Spinach rice joins her favourites' })
      tasteChanges.push({ memberId: 'eleni', tag: 'spinach', from: prefOf('eleni', 'spinach') ?? 'eats', to: 'love' })
      insights.push({
        id: insightId('spinach-love'),
        memberId: 'eleni',
        kind: 'learned',
        icon: '🥬',
        text: { el: 'Η Ελένη έφαγε όλο το σπανακόρυζο! Το σπανάκι μπαίνει στα αγαπημένα της.', en: 'Eleni finished all of her spinach rice! Spinach joins her favourites.' },
        when: JUST_NOW,
      })
    } else {
      const target = spinachTarget(next)
      const adapted = target
        ? adapt(next, target, 'spinach-pies', { el: 'Το σπανάκι κρυμμένο σε τραγανό φύλλο, όπως το θέλει η Ελένη', en: 'Spinach hidden in crisp filo, the way Eleni likes it' }, { adaptedFor: 'eleni' })
        : null
      if (adapted && target) {
        next = adapted
        changedMealIds.push(target)
        const day = mealById(next, target)!.day
        messages.push(
          target === 'sun-dinner'
            ? { el: 'Κατάλαβα! Η Ελένη θέλει το σπανάκι κρυμμένο. Την Κυριακή θα έχει σπανακοπιτάκια 🥧', en: 'Got it! Eleni wants her spinach hidden. On Sunday she’ll have mini spinach pies 🥧' }
            : { el: `Κατάλαβα! Η Ελένη θέλει το σπανάκι κρυμμένο. ${cap(ON_DAY[day].el)} θα έχει σπανακοπιτάκια 🥧`, en: `Got it! Eleni wants her spinach hidden. ${cap(ON_DAY[day].en)} she’ll have mini spinach pies 🥧` },
        )
      } else {
        messages.push({ el: 'Κατάλαβα! Η Ελένη θέλει το σπανάκι κρυμμένο. Θα το βάζουμε σε πίτες και κεφτέδες.', en: 'Got it! Eleni wants her spinach hidden. We’ll tuck it into pies and fritters.' })
      }
      tasteChanges.push({ memberId: 'eleni', tag: 'visible-veg', from: prefOf('eleni', 'visible-veg') ?? 'eats', to: 'refuses' })
      insights.push({
        id: insightId('visible-veg'),
        memberId: 'eleni',
        kind: 'learned',
        icon: '🥧',
        text: {
          el: 'Η Ελένη αφήνει το σπανάκι όταν φαίνεται. Από εδώ και πέρα το κρύβουμε σε πίτες και κεφτέδες.',
          en: 'Eleni leaves spinach when she can see it. From now on we hide it in pies and fritters.',
        },
        when: JUST_NOW,
      })
    }
  }

  // Beat 2: the 16:30 push about Tuesday's giouvetsi
  if (entry.plannedMealId === 'tue-lunch' && entry.recipeId === 'chicken-giouvetsi') {
    if (rating('nikos')?.rating === 'all') {
      messages.push({ el: '⭐ Ο Νίκος λάτρεψε το γιουβέτσι, θα το ξαναδεί σε 2 εβδομάδες', en: '⭐ Nikos loved the giouvetsi, he’ll see it again in 2 weeks' })
      tasteChanges.push({ memberId: 'nikos', tag: 'orzo', from: prefOf('nikos', 'orzo') ?? 'eats', to: 'love' })
      insights.push({
        id: insightId('orzo-love'),
        memberId: 'nikos',
        kind: 'learned',
        icon: '⭐',
        text: { el: 'Ο Νίκος λάτρεψε το κριθαράκι στο γιουβέτσι. Ξανά στο πλάνο σε 2 εβδομάδες.', en: 'Nikos loved the orzo in the giouvetsi. Back on the plan in 2 weeks.' },
        when: JUST_NOW,
      })
    }
    if (entry.leftovers === 'little' || entry.leftovers === 'lots') {
      const snack = mealById(next, 'thu-snack')
      const adapted =
        snack && !snack.leftoverOf
          ? adapt(next, 'thu-snack', 'chicken-giouvetsi', { el: '♻️ Το περίσσευμα γίνεται κολατσιό την Πέμπτη', en: '♻️ The leftovers become Thursday’s snack' }, { leftoverOf: 'tue-lunch' })
          : null
      if (adapted) {
        next = adapted
        changedMealIds.push('thu-snack')
        messages.push({ el: '♻️ Το περίσσευμα γίνεται κολατσιό την Πέμπτη', en: '♻️ The leftovers become Thursday’s snack' })
        insights.push({
          id: insightId('leftover-snack'),
          kind: 'waste',
          icon: '♻️',
          text: {
            el: 'Το γιουβέτσι που περίσσεψε γίνεται κολατσιό την Πέμπτη: τίποτα στα σκουπίδια και ένα κολατσιό λιγότερο στα ψώνια.',
            en: 'The leftover giouvetsi becomes Thursday’s snack: nothing in the bin and one snack fewer to shop for.',
          },
          when: JUST_NOW,
        })
      }
    }
  }

  // Beat 3: generic, warm, never a dead end
  if (messages.length === 0) {
    const kids = entry.ratings.filter((r) => childIds.includes(r.memberId))
    const worst = [...kids].sort((a, b) => SCORE[a.rating] - SCORE[b.rating])[0]
    if (!worst || worst.rating === 'all') {
      messages.push({ el: `Τέλεια! Όλοι έφαγαν με όρεξη: «${dish.el}» ξαναμπαίνει σύντομα στο πλάνο.`, en: `Brilliant! Everyone tucked in: “${dish.en}” will be back on the plan soon.` })
      insights.push({
        id: insightId('hit'),
        kind: 'learned',
        icon: '😋',
        text: { el: `«${dish.el}»: επιτυχία σε όλη την οικογένεια.`, en: `“${dish.en}”: a hit with the whole family.` },
        when: JUST_NOW,
      })
    } else {
      const n = NAME[worst.memberId]
      const ate: L10n = worst.rating === 'none' ? { el: 'δεν το άγγιξε', en: 'didn’t touch it' } : { el: 'έφαγε λίγο', en: 'only had a little' }
      if (worst.reason) {
        const t = REASON_TEXT[worst.reason]
        messages.push({ el: `Ευχαριστούμε! ${cap(n.el)} ${t.msg.el}`, en: `Thanks! ${n.en} ${t.msg.en}` })
        insights.push({
          id: insightId(`learned-${worst.memberId}`),
          memberId: worst.memberId,
          kind: 'learned',
          icon: '💡',
          text: { el: `${cap(n.el)} ${t.learned.el}`, en: `${n.en} ${t.learned.en}` },
          when: JUST_NOW,
        })
      } else {
        messages.push({
          el: `Ευχαριστούμε! ${cap(n.el)} ${ate.el}· θα το λάβουμε υπόψη στο επόμενο πλάνο.`,
          en: `Thanks! ${n.en} ${ate.en}; we’ll take it into account in the next plan.`,
        })
        insights.push({
          id: insightId(`learned-${worst.memberId}`),
          memberId: worst.memberId,
          kind: 'learned',
          icon: '📝',
          text: { el: `«${dish.el}»: ${n.el} ${ate.el}. Την επόμενη φορά, μικρότερη μερίδα για δοκιμή.`, en: `“${dish.en}”: ${n.en} ${ate.en}. Next time, a smaller taster portion.` },
          when: JUST_NOW,
        })
      }
    }
  }
  if (entry.leftovers === 'lots' && !changedMealIds.includes('thu-snack')) {
    insights.push({
      id: insightId('waste'),
      kind: 'waste',
      icon: '♻️',
      text: { el: `Περίσσεψε αρκετό φαγητό από «${dish.el}». Την επόμενη φορά θα μαγειρέψουμε λιγότερο.`, en: `Quite a lot of “${dish.en}” was left over. Next time we’ll cook less.` },
      when: JUST_NOW,
    })
  }

  return { plan: next, insights, message: join(messages), changedMealIds, tasteChanges }
}

// ---------- recap ----------
const MAIN = new Set(['lunch', 'dinner'])

/** Ratings that apply to the plan as it is now (a seeded rating for a since-swapped meal is re-predicted). */
function effectiveRatings(plan: PlannedMeal[], feedback: FeedbackEntry[]): { meal: PlannedMeal; memberId: MemberId; rating: Rating }[] {
  const out: { meal: PlannedMeal; memberId: MemberId; rating: Rating }[] = []
  for (const e of latestFeedback(feedback)) {
    const meal = mealById(plan, e.plannedMealId)
    if (!meal || meal.eatingOut) continue
    for (const r of e.ratings) {
      if (!childIds.includes(r.memberId)) continue
      out.push({ meal, memberId: r.memberId, rating: e.recipeId === meal.recipeId ? r.rating : predictRating(meal.recipeId, r.memberId) })
    }
  }
  return out.sort((a, b) => dayIndex(a.meal.day) - dayIndex(b.meal.day))
}

export function recapStats(plan: PlannedMeal[], feedback: FeedbackEntry[]): RecapStats {
  const items = groceryList(plan)
  const store = cheapestStore(items)
  const cooked = plan.filter((m) => !m.eatingOut)
  const leftovers = cooked.filter((m) => m.leftoverOf)

  // Time: ~5' of "what do we eat?" per planned meal, 20' of list-making, plus the cooking a leftover saves (30' a meal, 5' a snack).
  const minutesSaved = cooked.length * 5 + 20 + leftovers.reduce((s, m) => s + (MAIN.has(m.slot) ? 30 : 5), 0)
  // Waste: a rescued family portion per leftover meal (≈0,5 kg; a leftover snack is a small portion) + ~18 g per pack shared by 2+ meals.
  const shared = items.filter((it) => it.usedIn.length >= 2).length
  const wasteKgAvoided = Math.round((leftovers.reduce((s, m) => s + (MAIN.has(m.slot) ? 0.47 : 0.05), 0) + shared * 0.018) * 10) / 10

  const ratings = effectiveRatings(plan, feedback)
  const acceptance = childIds.map((memberId) => {
    const mine = ratings.filter((r) => r.memberId === memberId)
    const percent = mine.length ? Math.round((100 * mine.reduce((s, r) => s + SCORE[r.rating], 0)) / mine.length) : 0
    return { memberId, percent }
  })
  const acceptanceOverall = ratings.length ? Math.round((100 * ratings.reduce((s, r) => s + SCORE[r.rating], 0)) / ratings.length) : 0

  const topHits: RecapStats['topHits'] = []
  for (const memberId of childIds) {
    const loves = (id: string) => (recipes[id]?.foodTags ?? []).some((t) => prefOf(memberId, t) === 'love')
    const hits = ratings
      .filter((r) => r.memberId === memberId && r.rating === 'all' && MAIN.has(r.meal.slot) && !r.meal.leftoverOf)
      .sort((a, b) => Number(loves(b.meal.recipeId)) - Number(loves(a.meal.recipeId)))
    for (const h of hits) {
      if (topHits.filter((t) => t.memberId === memberId).length >= 2) break
      if (!topHits.some((t) => t.recipeId === h.meal.recipeId)) topHits.push({ recipeId: h.meal.recipeId, memberId })
    }
  }

  const newFavorites: RecapStats['newFavorites'] = []
  for (const r of ratings) {
    if (r.rating !== 'all' || r.meal.leftoverOf || newFavorites.length >= 4) continue
    const before = previousRatings[r.meal.recipeId]?.ratings.find((p) => p.memberId === r.memberId)?.rating
    if (before === 'all') continue
    if (!newFavorites.some((f) => f.recipeId === r.meal.recipeId && f.memberId === r.memberId)) newFavorites.push({ recipeId: r.meal.recipeId, memberId: r.memberId })
  }

  return {
    spent: storeTotals(items)[store],
    budget: family.budget,
    minutesSaved,
    wasteKgAvoided,
    leftoverMeals: leftovers.length,
    acceptance,
    acceptanceOverall,
    topHits,
    newFavorites,
  }
}

// ---------- next week ----------
/**
 * Next week's plan (2–8 Nov): a fresh rotation adapted to this week's feedback. The adapted meals carry
 * `adaptedFor` and are listed in changedMealIds (→ "προσαρμόστηκε" badge).
 */
export function nextWeekPlan(plan: PlannedMeal[], feedback: FeedbackEntry[]): { plan: PlannedMeal[]; changedMealIds: string[] } {
  let next = nextWeekBase.map((m) => ({ ...m }))
  const changedMealIds: string[] = []
  const latest = latestFeedback(feedback)
  const childRating = (recipeId: string, memberId: MemberId) =>
    [...latest].reverse().find((e) => e.recipeId === recipeId)?.ratings.find((r) => r.memberId === memberId)?.rating
  const apply = (mealId: string, recipeId: string, memberId: MemberId, reason: L10n, allowRefused = false) => {
    const res = adapt(next, mealId, recipeId, reason, { adaptedFor: memberId }, allowRefused)
    if (res) {
      next = res
      changedMealIds.push(mealId)
    }
  }

  // 1. Eleni and spinach
  if (childRating('spinach-rice', 'eleni') === 'all') {
    apply('mon-dinner', 'spinach-rice', 'eleni', { el: 'Η Ελένη το έφαγε όλο την περασμένη Δευτέρα: ξανά σπανακόρυζο', en: 'Eleni finished it last Monday: spinach rice again' })
  } else if (mealById(plan, 'sun-dinner')?.recipeId === 'spinach-pies') {
    apply('wed-dinner', 'greens-pie', 'eleni', { el: 'Χόρτα κρυμμένα σε τραγανό φύλλο, όπως τα θέλει η Ελένη', en: 'Greens hidden in crisp filo, the way Eleni likes them' })
  } else {
    apply('mon-dinner', 'spinach-pies', 'eleni', {
      el: 'Η Ελένη αφήνει τα λαχανικά όταν φαίνονται: το σπανάκι πάει κρυμμένο σε πιτάκια',
      en: 'Eleni leaves veg she can see: the spinach goes hidden in little pies',
    })
  }
  // 2. A new favourite comes back
  if (childRating('zucchini-fritters', 'eleni') === 'all') {
    apply('tue-dinner', 'zucchini-fritters', 'eleni', {
      el: 'Νέο αγαπημένο της Ελένης: ξανά κολοκυθοκεφτέδες, στη θέση της ομελέτας με ντομάτα',
      en: 'Eleni’s new favourite: courgette fritters again, instead of the tomato omelette',
    })
  }
  // 3. A gentle first try of fish for Nikos (the one deliberate exception to "refused foods")
  apply('thu-dinner', 'cod-croquettes', 'nikos', { el: 'Πρώτη, ήπια γνωριμία με το ψάρι για τον Νίκο: σαν κεφτεδάκια, χωρίς κόκαλα', en: 'A gentle first taste of fish for Nikos: like meatballs, with no bones' }, true)

  return { plan: next, changedMealIds }
}
