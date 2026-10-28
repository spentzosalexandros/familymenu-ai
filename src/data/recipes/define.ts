// Compact recipe authoring format → full Recipe objects (image path and allergens are derived, never typed by hand).
import { ingredients } from '../ingredients.ts'
import type { AllergenId, FoodTag, IngredientId, MealSlot, Recipe, RecipeTag } from '../types.ts'

export type RecipeDef = {
  id: string
  el: string
  en: string
  slots: MealSlot[]
  minutes: number
  /** Hands-on minutes when they differ from the total. */
  active?: number
  difficulty?: 'easy' | 'medium'
  tags: RecipeTag[]
  foodTags: FoodTag[]
  kcal: number
  protein: number
  /** [ingredient id, quantity for 4 servings, note el?, note en?] */
  ing: [IngredientId, number, string?, string?][]
  /** [el, en] */
  steps: [string, string][]
  /** [el, en] */
  tip?: [string, string]
}

const ALLERGEN_ORDER: AllergenId[] = ['nuts', 'peanuts', 'gluten', 'lactose', 'eggs', 'fish', 'shellfish', 'sesame', 'soy']

export function buildRecipe(d: RecipeDef): Recipe {
  const allergens = new Set<AllergenId>()
  for (const [id] of d.ing) {
    const ing = ingredients[id]
    if (!ing) throw new Error(`Recipe ${d.id}: unknown ingredient ${id}`)
    for (const a of ing.allergens ?? []) allergens.add(a)
  }
  const tags = [...d.tags]
  if (d.minutes <= 30 && !tags.includes('quick')) tags.push('quick')
  const recipe: Recipe = {
    id: d.id,
    name: { el: d.el, en: d.en },
    slots: d.slots,
    image: `/images/food/${d.id}.jpg`,
    minutes: d.minutes,
    activeMinutes: d.active ?? d.minutes,
    difficulty: d.difficulty ?? 'easy',
    servings: 4,
    tags,
    foodTags: d.foodTags,
    ingredients: d.ing.map(([id, qty, nel, nen]) => (nel ? { id, qty, note: { el: nel, en: nen ?? nel } } : { id, qty })),
    steps: d.steps.map(([el, en]) => ({ el, en })),
    nutrition: { kcal: d.kcal, protein: d.protein },
    allergens: ALLERGEN_ORDER.filter((a) => allergens.has(a)),
  }
  if (d.tip) recipe.kidTip = { el: d.tip[0], en: d.tip[1] }
  return recipe
}
