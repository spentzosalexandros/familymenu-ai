// Data contract shared by every part of the mockup.
// Owned by the content agent: it may ADD optional fields or new exports, but must not
// rename, remove or change the meaning of anything below (other agents code against it).

export type Lang = 'el' | 'en'
/** Every user-visible piece of content exists in both languages. */
export type L10n = { el: string; en: string }

// ---------- family ----------
export type MemberId = 'maria' | 'giorgos' | 'nikos' | 'eleni'
export type AllergenId = 'nuts' | 'peanuts' | 'gluten' | 'lactose' | 'eggs' | 'fish' | 'shellfish' | 'sesame' | 'soy'
export type DietId = 'fasting-wed' | 'fasting-fri' | 'vegetarian' | 'pescatarian'
export type Preference = 'love' | 'eats' | 'refuses'
/** Food category ids used for taste profiles, e.g. 'pasta', 'chicken', 'fish', 'legumes', 'visible-veg'. */
export type FoodTag = string

export type Member = {
  id: MemberId
  name: L10n
  role: 'adult' | 'child'
  age: number
  /** Emoji used as avatar. */
  avatar: string
  /** Hex color for the avatar ring. */
  color: string
  allergies: AllergenId[]
}

export type ChildTaste = { memberId: MemberId; foods: { tag: FoodTag; pref: Preference }[] }

export type FoodOption = { tag: FoodTag; label: L10n; emoji: string }
export type ChipOption = { id: string; label: L10n; emoji?: string }

export type Family = {
  members: Member[]
  tastes: ChildTaste[]
  likes: ChipOption[]
  dislikes: ChipOption[]
  diets: DietId[]
  city: L10n
  postcode: string
  /** Weekly food budget in €. */
  budget: number
  slots: MealSlot[]
  /** "Cook once, eat twice" preference. */
  batchCooking: boolean
  /** Max minutes for weekday cooking. */
  weekdayMinutes: number
}

// ---------- calendar ----------
export type DayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type MealSlot = 'breakfast' | 'snack' | 'lunch' | 'dinner'
export type DemoDay = {
  id: DayId
  /** ISO date, e.g. '2026-10-27'. */
  date: string
  short: L10n // 'Τρ' / 'Tue'
  long: L10n // 'Τρίτη 27 Οκτωβρίου' / 'Tuesday, 27 October'
  /** Optional day note, e.g. national holiday or fasting day. */
  note?: L10n
  /** Public holiday (no school, shops closed). Drives the holiday dot in the day strip. */
  holiday?: boolean
  /** Family fasting day (νηστεία): every meal is fasting-friendly. Drives the 🌿 dot. */
  fasting?: boolean
}
export type DemoWeek = { label: L10n; days: DemoDay[] }

// ---------- ingredients, stores, prices ----------
export type IngredientId = string
export type Aisle = 'produce' | 'meat-fish' | 'dairy-eggs' | 'bakery' | 'pantry' | 'frozen'
export type Ingredient = {
  id: IngredientId
  name: L10n
  aisle: Aisle
  /** Unit used in recipe quantities. */
  unit: 'g' | 'ml' | 'pcs'
  /** Retail pack, e.g. { size: 1000, label: { el: '1 κιλό', en: '1 kg' } }. */
  pack: { size: number; label: L10n }
  emoji: string
  allergens?: AllergenId[]
}

export type StoreId = 'sklavenitis' | 'lidl' | 'ab' | 'mymarket'
export type Store = {
  id: StoreId
  /** Real chain name, names only (no logos). */
  name: string
  distanceKm: number
  address: L10n
  /** Brand-neutral accent color used for the store dot in the UI. */
  color: string
  openUntil: string // '21:00'
}
/** € per pack, per store, per ingredient. Indicative demo prices. */
export type PriceTable = Record<StoreId, Record<IngredientId, number>>

// ---------- recipes & plan ----------
export type RecipeTag = 'kid-favorite' | 'fasting' | 'quick' | 'budget' | 'leftovers' | 'hidden-veg' | 'make-ahead' | 'family-classic'
export type Recipe = {
  id: string
  name: L10n
  /** Slots this recipe fits. */
  slots: MealSlot[]
  /** Public path, e.g. '/images/food/chicken-giouvetsi.jpg'. Always this pattern: /images/food/<id>.jpg */
  image: string
  /** Total time, in minutes (what the cards show). */
  minutes: number
  /** Hands-on minutes (the rest is oven/simmering). The weekday ≤45' rule applies to this. */
  activeMinutes?: number
  difficulty: 'easy' | 'medium'
  /** Base servings that the ingredient quantities are written for (the family: 4). */
  servings: number
  tags: RecipeTag[]
  foodTags: FoodTag[]
  ingredients: { id: IngredientId; qty: number; note?: L10n }[]
  steps: L10n[]
  /** Practical tip for getting kids to eat it. */
  kidTip?: L10n
  nutrition: { kcal: number; protein: number }
  /** Union of ingredient allergens. Must never intersect a member's allergies in any planned meal or alternative. */
  allergens: AllergenId[]
}

export type PlannedMeal = {
  /** `${day}-${slot}`, e.g. 'tue-lunch'. */
  id: string
  day: DayId
  slot: MealSlot
  recipeId: string
  locked?: boolean
  /** Planned-meal id whose leftovers this meal reuses (no extra shopping). */
  leftoverOf?: string
  /** Short AI reason for picking it. */
  reason: L10n
  /** Shows a "adapted for <member>" badge. */
  adaptedFor?: MemberId
  eatingOut?: boolean
  /** "Cook once, eat twice": cook N× the recipe (default 1). The extra portions feed the meals whose leftoverOf points here. */
  batch?: number
}

export type Alternative = {
  recipeId: string
  /** Why this alternative fits, e.g. "Same cost, Nikos loves minced meat". */
  reason: L10n
}
/** Keyed by planned-meal id. 3 alternatives for every lunch/dinner, 2 for breakfast/snack. */
export type Alternatives = Record<string, Alternative[]>

// ---------- feedback & learning ----------
export type Rating = 'all' | 'some' | 'none'
export type FeedbackReason = 'taste' | 'texture' | 'not-hungry' | 'visible-veg' | 'too-spicy' | 'new-food'
export type FeedbackEntry = {
  plannedMealId: string
  recipeId: string
  ratings: { memberId: MemberId; rating: Rating; reason?: FeedbackReason }[]
  leftovers?: 'none' | 'little' | 'lots'
}

export type Insight = {
  id: string
  memberId?: MemberId
  kind: 'learned' | 'waste' | 'budget' | 'tip'
  icon: string // emoji
  text: L10n
  when: L10n // 'Χθες' / 'Yesterday'
}

/** What the "AI" does after a piece of feedback. Produced by applyFeedback(). */
export type LearningResult = {
  plan: PlannedMeal[]
  insights: Insight[]
  /** Headline shown right after submitting, e.g. "Got it: Eleni prefers spinach hidden in pies". */
  message: L10n
  /** Planned-meal ids that changed because of this feedback (to highlight them). */
  changedMealIds: string[]
  /** Taste-profile moves to animate on the child profile. */
  tasteChanges: { memberId: MemberId; tag: FoodTag; from: Preference; to: Preference }[]
}

// ---------- derived ----------
export type GroceryItem = {
  ingredientId: IngredientId
  /** Total quantity needed for the plan, in ingredient units. */
  qty: number
  /** Packs to buy (rounded up). */
  packs: number
  /** Planned-meal ids that use this ingredient. */
  usedIn: string[]
  /** € for the packs, per store. */
  price: Record<StoreId, number>
}

export type RecapStats = {
  spent: number // € at the cheapest store
  budget: number
  minutesSaved: number
  wasteKgAvoided: number
  leftoverMeals: number
  /** 0–100 per child. */
  acceptance: { memberId: MemberId; percent: number }[]
  /** 0–100, both children together (all ratings pooled). */
  acceptanceOverall?: number
  topHits: { recipeId: string; memberId: MemberId }[]
  newFavorites: { recipeId: string; memberId: MemberId }[]
}

// ---------- additive helpers (content agent) ----------
/** How the children rated a recipe the last time it was cooked (before this demo week). */
export type PreviousRating = { when: L10n; ratings: { memberId: MemberId; rating: Rating }[] }

/** Display info for a meal slot. */
export type SlotInfo = { id: MealSlot; label: L10n; short: L10n; emoji: string; time: string }
/** Display info for a supermarket aisle (shopping list grouping). */
export type AisleInfo = { id: Aisle; label: L10n; emoji: string; order: number }

/** Plan-level numbers for summary cards (Today budget ring, Week summary, onboarding "ready"). */
export type PlanSummary = {
  store: StoreId
  /** € at `store` (pack-rounded shopping total, pantry excluded). Same number the Shop tab shows. */
  total: number
  budget: number
  /** Planned meals that are not eaten out. */
  meals: number
  leftoverMeals: number
  /** Ingredients bought once and used in 2+ meals. */
  reusedIngredients: number
  /** Planned meals containing an allergen of any member (always 0). */
  allergenMeals: number
}
