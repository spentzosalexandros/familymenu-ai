// The demo family: the Papadopoulos family in Chalandri (story bible, BUILD-SPEC §1).
import type { ChildTaste, Family, FoodTag, Member, MemberId, Preference } from './types.ts'

const members: Member[] = [
  { id: 'maria', name: { el: 'Μαρία', en: 'Maria' }, role: 'adult', age: 38, avatar: '👩🏻', color: '#E0613A', allergies: [] },
  { id: 'giorgos', name: { el: 'Γιώργος', en: 'Giorgos' }, role: 'adult', age: 41, avatar: '👨🏻', color: '#3B82F6', allergies: [] },
  { id: 'nikos', name: { el: 'Νίκος', en: 'Nikos' }, role: 'child', age: 8, avatar: '👦🏻', color: '#22A06B', allergies: [] },
  { id: 'eleni', name: { el: 'Ελένη', en: 'Eleni' }, role: 'child', age: 4, avatar: '👧🏻', color: '#C26BD8', allergies: ['nuts'] },
]

const taste = (memberId: MemberId, prefs: Record<FoodTag, Preference>): ChildTaste => ({
  memberId,
  foods: Object.entries(prefs).map(([tag, pref]) => ({ tag, pref })),
})

/**
 * Taste profiles as the parents entered them in onboarding (start of the demo).
 * Story: Nikos loves pasta, meatballs, pizza, chicken; eats rice, eggs, potatoes; refuses fish ("not yet") and mushrooms.
 * Eleni loves potatoes, yogurt with honey, orzo, banana; refuses eggplant. She is picky with visible vegetables:
 * the parents still marked them "eats", and the AI learns otherwise from Monday's spinach rice (narrative beat 1).
 */
const tastes: ChildTaste[] = [
  taste('nikos', {
    pasta: 'love',
    meatballs: 'love',
    pizza: 'love',
    chicken: 'love',
    rice: 'eats',
    eggs: 'eats',
    potatoes: 'eats',
    orzo: 'eats',
    yogurt: 'eats',
    banana: 'eats',
    legumes: 'eats',
    'visible-veg': 'eats',
    spinach: 'eats',
    eggplant: 'eats',
    fish: 'refuses',
    mushrooms: 'refuses',
  }),
  taste('eleni', {
    potatoes: 'love',
    yogurt: 'love',
    orzo: 'love',
    banana: 'love',
    pasta: 'eats',
    meatballs: 'eats',
    pizza: 'eats',
    chicken: 'eats',
    rice: 'eats',
    eggs: 'eats',
    fish: 'eats',
    legumes: 'eats',
    mushrooms: 'eats',
    'visible-veg': 'eats',
    spinach: 'eats',
    eggplant: 'refuses',
  }),
]

export const family: Family = {
  members,
  tastes,
  likes: [
    { id: 'greek-home', label: { el: 'Ελληνική σπιτική', en: 'Greek home cooking' }, emoji: '🫒' },
    { id: 'casseroles', label: { el: 'Μαγειρευτά', en: 'Slow-cooked stews' }, emoji: '🍲' },
    { id: 'pies', label: { el: 'Πίτες', en: 'Savoury pies' }, emoji: '🥧' },
    { id: 'oven', label: { el: 'Ταψί στον φούρνο', en: 'Oven bakes' }, emoji: '🔥' },
    { id: 'italian', label: { el: 'Ιταλική', en: 'Italian' }, emoji: '🍝' },
  ],
  dislikes: [
    { id: 'liver', label: { el: 'Συκώτι', en: 'Liver' }, emoji: '🫀' },
    { id: 'okra', label: { el: 'Μπάμιες', en: 'Okra' }, emoji: '🌿' },
  ],
  diets: ['fasting-wed'],
  city: { el: 'Χαλάνδρι, Αθήνα', en: 'Chalandri, Athens' },
  postcode: '152 32',
  budget: 140,
  slots: ['breakfast', 'snack', 'lunch', 'dinner'],
  batchCooking: true,
  weekdayMinutes: 45,
}

export const membersById = (): Record<string, Member> => Object.fromEntries(family.members.map((m) => [m.id, m]))

/** Ids of the children (Νίκος, Ελένη), in family order. */
export const childIds: MemberId[] = family.members.filter((m) => m.role === 'child').map((m) => m.id)

/** Initial preference of a child for a food tag (undefined when the tag is not in the profile). */
export function prefOf(memberId: MemberId, tag: FoodTag): Preference | undefined {
  return family.tastes.find((t) => t.memberId === memberId)?.foods.find((f) => f.tag === tag)?.pref
}
