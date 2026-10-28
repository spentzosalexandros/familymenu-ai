// FamilyMenu AI demo dataset + selectors. Single import point for the app: `import { … } from '../data'`.
// Contract (names and signatures used by every screen) is unchanged from the stub; extra helpers are additive.
// Inside src/data, relative imports use explicit ".ts" so `node scripts/check-data.ts` runs without a bundler.
import type { L10n, Lang } from './types.ts'

export type * from './types.ts'

export const tr = (l: L10n, lang: Lang): string => l[lang]

// calendar
export { TODAY, DAY_IDS, SLOT_IDS, week, nextWeek, slots, dayIndex, slotIndex, dayName, ON_DAY, isFastingDay } from './week.ts'
// family
export { family, membersById, childIds, prefOf } from './family.ts'
// catalog
export { recipes, recipeIds } from './recipes/index.ts'
export { ingredients, ingredientIds, aisles, allergenLabels } from './ingredients.ts'
export { stores, storeIds, storeById, PRICE_DISCLAIMER, setStoreNameLang } from './stores.ts'
export { prices, unitPrice } from './prices.ts'
// plan & content
export { initialPlan, nextWeekBase } from './plan.ts'
export { alternatives } from './alternatives.ts'
export { feedbackHistory, pendingFeedback, previousRatings } from './feedback.ts'
export { initialInsights } from './insights.ts'
export { onboarding, foodTagInfo } from './onboarding.ts'
// selectors
export {
  groceryList,
  storeTotals,
  cheapestStore,
  bestSplit,
  mealCost,
  servingCost,
  planCost,
  dayCost,
  planSummary,
  isSafeFor,
  isSafeForAll,
  isFastingFriendly,
  refusedBy,
  fitsMeal,
  shoppedMeals,
  getRecipe,
  recipeName,
  mealById,
  mealsOfDay,
  dayOfMealId,
  alternativesFor,
  swapCandidates,
  swapMeal,
  swapCostDelta,
  mealCostDelta,
  regeneratePlan,
  latestFeedback,
  feedbackBefore,
  lastRatings,
  allMemberIds,
} from './selectors.ts'
// the scripted "AI"
export { applyFeedback, recapStats, nextWeekPlan, predictRating } from './learning.ts'
