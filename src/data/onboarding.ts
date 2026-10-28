// Option lists for onboarding (and labels reused by the child profile / family screens).
// The demo family's selections live in family.ts and use the same ids/tags.
import type { ChipOption, FoodOption, FoodTag } from './types.ts'

const food = (tag: FoodTag, el: string, en: string, emoji: string): FoodOption => ({ tag, label: { el, en }, emoji })
const chip = (id: string, el: string, en: string, emoji?: string): ChipOption => (emoji ? { id, label: { el, en }, emoji } : { id, label: { el, en } })

/** Kids-taste step: one chip per food tag used in the children's taste profiles. */
const foods: FoodOption[] = [
  food('pasta', 'Ζυμαρικά', 'Pasta', '🍝'),
  food('meatballs', 'Κεφτεδάκια', 'Meatballs', '🧆'),
  food('pizza', 'Πίτσα', 'Pizza', '🍕'),
  food('chicken', 'Κοτόπουλο', 'Chicken', '🍗'),
  food('potatoes', 'Πατάτες', 'Potatoes', '🥔'),
  food('rice', 'Ρύζι', 'Rice', '🍚'),
  food('eggs', 'Αυγά', 'Eggs', '🥚'),
  food('orzo', 'Κριθαράκι', 'Orzo', '🥣'),
  food('yogurt', 'Γιαούρτι με μέλι', 'Yogurt with honey', '🍯'),
  food('banana', 'Μπανάνα', 'Banana', '🍌'),
  food('legumes', 'Όσπρια', 'Legumes', '🫘'),
  food('fish', 'Ψάρι', 'Fish', '🐟'),
  food('visible-veg', 'Λαχανικά που φαίνονται', 'Visible veggies', '🥦'),
  food('spinach', 'Σπανάκι', 'Spinach', '🥬'),
  food('eggplant', 'Μελιτζάνα', 'Aubergine', '🍆'),
  food('mushrooms', 'Μανιτάρια', 'Mushrooms', '🍄'),
]

/** Labels for every food tag used anywhere in the data (taste profiles + recipe foodTags). */
export const foodTagInfo: Record<FoodTag, FoodOption> = Object.fromEntries(
  [
    ...foods,
    food('beef', 'Μοσχάρι', 'Beef', '🥩'),
    food('pork', 'Χοιρινό', 'Pork', '🥩'),
    food('cheese', 'Τυρί', 'Cheese', '🧀'),
    food('bread', 'Ψωμί', 'Bread', '🍞'),
    food('fruit', 'Φρούτα', 'Fruit', '🍎'),
    food('honey', 'Μέλι', 'Honey', '🍯'),
    food('soup', 'Σούπα', 'Soup', '🍲'),
    food('pie', 'Πίτα', 'Savoury pie', '🥧'),
    food('hidden-veg', 'Κρυμμένα λαχανικά', 'Hidden veggies', '🫣'),
  ].map((f) => [f.tag, f]),
)

export const onboarding: {
  foods: FoodOption[]
  cuisines: ChipOption[]
  dislikes: ChipOption[]
  allergens: ChipOption[]
  diets: ChipOption[]
} = {
  foods,
  cuisines: [
    chip('greek-home', 'Ελληνική σπιτική', 'Greek home cooking', '🫒'),
    chip('casseroles', 'Μαγειρευτά', 'Slow-cooked stews', '🍲'),
    chip('pies', 'Πίτες', 'Savoury pies', '🥧'),
    chip('oven', 'Ταψί στον φούρνο', 'Oven bakes', '🔥'),
    chip('legumes-ladera', 'Όσπρια & λαδερά', 'Legumes & veg stews', '🫘'),
    chip('grill', 'Ψητά & σχάρα', 'Grills', '🍢'),
    chip('italian', 'Ιταλική', 'Italian', '🍝'),
    chip('mediterranean', 'Μεσογειακή', 'Mediterranean', '🥗'),
    chip('street-food', 'Street food', 'Street food', '🥙'),
    chip('mexican', 'Μεξικάνικη', 'Mexican', '🌮'),
    chip('asian', 'Ασιατική', 'Asian', '🥢'),
  ],
  dislikes: [
    chip('liver', 'Συκώτι', 'Liver', '🫀'),
    chip('okra', 'Μπάμιες', 'Okra', '🌿'),
    chip('eggplant', 'Μελιτζάνα', 'Aubergine', '🍆'),
    chip('mushrooms', 'Μανιτάρια', 'Mushrooms', '🍄'),
    chip('cauliflower', 'Κουνουπίδι', 'Cauliflower', '🥦'),
    chip('lamb', 'Αρνί', 'Lamb', '🐑'),
    chip('seafood', 'Θαλασσινά', 'Seafood', '🦐'),
    chip('olives', 'Ελιές', 'Olives', '🫒'),
    chip('spicy', 'Πικάντικα', 'Spicy food', '🌶️'),
    chip('coriander', 'Κόλιανδρος', 'Coriander', '🌿'),
  ],
  allergens: [
    chip('nuts', 'Ξηροί καρποί', 'Tree nuts', '🌰'),
    chip('peanuts', 'Αράπικα φιστίκια', 'Peanuts', '🥜'),
    chip('gluten', 'Γλουτένη', 'Gluten', '🌾'),
    chip('lactose', 'Λακτόζη', 'Lactose', '🥛'),
    chip('eggs', 'Αυγά', 'Eggs', '🥚'),
    chip('fish', 'Ψάρι', 'Fish', '🐟'),
    chip('shellfish', 'Οστρακοειδή', 'Shellfish', '🦐'),
    chip('sesame', 'Σουσάμι', 'Sesame', '⚪'),
    chip('soy', 'Σόγια', 'Soy', '🫛'),
  ],
  diets: [
    chip('fasting-wed', 'Νηστεία Τετάρτης', 'Fasting on Wednesdays', '🌿'),
    chip('fasting-fri', 'Νηστεία Παρασκευής', 'Fasting on Fridays', '🌿'),
    chip('vegetarian', 'Χορτοφαγική', 'Vegetarian', '🥕'),
    chip('pescatarian', 'Χωρίς κρέας, με ψάρι', 'Pescatarian', '🐟'),
  ],
}
