// All 44 catalog recipes (BUILD-SPEC §2), keyed by their fixed ids.
import type { Recipe } from '../types.ts'
import { breakfastDefs } from './breakfast.ts'
import { buildRecipe } from './define.ts'
import { dinnerDefs } from './dinner.ts'
import { lunchDefs } from './lunch.ts'
import { snackDefs } from './snack.ts'

/** Catalog order (breakfast → snack → lunch → dinner), as in the spec table. */
export const recipeIds: string[] = [...breakfastDefs, ...snackDefs, ...lunchDefs, ...dinnerDefs].map((d) => d.id)

export const recipes: Record<string, Recipe> = Object.fromEntries(
  [...breakfastDefs, ...snackDefs, ...lunchDefs, ...dinnerDefs].map((d) => [d.id, buildRecipe(d)]),
)
