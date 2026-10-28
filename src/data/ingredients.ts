// ~70 ingredients as sold in Greek supermarkets (retail packs, Oct 2026).
import type { AllergenId, Aisle, AisleInfo, Ingredient, IngredientId, L10n } from './types.ts'

type Def = [
  id: IngredientId,
  el: string,
  en: string,
  aisle: Aisle,
  unit: Ingredient['unit'],
  packSize: number,
  packEl: string,
  packEn: string,
  emoji: string,
  allergens?: AllergenId[],
]

const DEFS: Def[] = [
  // ---- produce (λαχανικά & φρούτα) ----
  ['potatoes', 'Πατάτες', 'Potatoes', 'produce', 'g', 2000, '2 κιλά', '2 kg', '🥔'],
  ['tomatoes', 'Ντομάτες', 'Tomatoes', 'produce', 'g', 500, '½ κιλό', '500 g', '🍅'],
  ['onions', 'Ξερά κρεμμύδια', 'Onions', 'produce', 'g', 1000, '1 κιλό', '1 kg', '🧅'],
  ['garlic', 'Σκόρδο', 'Garlic', 'produce', 'pcs', 30, '3 κεφάλια (~30 σκελίδες)', '3 bulbs (~30 cloves)', '🧄'],
  ['zucchini', 'Κολοκυθάκια', 'Courgettes', 'produce', 'g', 500, '½ κιλό', '500 g', '🥒'],
  ['carrots', 'Καρότα', 'Carrots', 'produce', 'g', 1000, '1 κιλό', '1 kg', '🥕'],
  ['peppers', 'Πιπεριές πράσινες', 'Green peppers', 'produce', 'g', 500, '½ κιλό', '500 g', '🫑'],
  ['spinach', 'Σπανάκι φρέσκο', 'Fresh spinach', 'produce', 'g', 500, '500 γρ.', '500 g', '🥬'],
  ['leeks', 'Πράσα', 'Leeks', 'produce', 'g', 1000, '1 κιλό', '1 kg', '🌱'],
  ['lettuce', 'Μαρούλι', 'Romaine lettuce', 'produce', 'pcs', 1, '1 τεμ.', '1 head', '🥬'],
  ['cucumber', 'Αγγούρι', 'Cucumber', 'produce', 'pcs', 1, '1 τεμ.', '1 pc', '🥒'],
  ['lemons', 'Λεμόνια', 'Lemons', 'produce', 'pcs', 4, '½ κιλό (~4 τεμ.)', '500 g (~4 pcs)', '🍋'],
  ['apples', 'Μήλα', 'Apples', 'produce', 'pcs', 3, '½ κιλό (~3 τεμ.)', '500 g (~3 pcs)', '🍎'],
  ['bananas', 'Μπανάνες', 'Bananas', 'produce', 'pcs', 3, '½ κιλό (~3 τεμ.)', '500 g (~3 pcs)', '🍌'],
  ['oranges', 'Πορτοκάλια', 'Oranges', 'produce', 'pcs', 12, '2 κιλά (~12 τεμ.)', '2 kg (~12 pcs)', '🍊'],
  ['mandarins', 'Μανταρίνια', 'Mandarins', 'produce', 'pcs', 5, '½ κιλό (~5 τεμ.)', '500 g (~5 pcs)', '🍊'],
  ['grapes', 'Σταφύλι', 'Grapes', 'produce', 'g', 500, '½ κιλό', '500 g', '🍇'],
  ['parsley', 'Μαϊντανός', 'Parsley', 'produce', 'pcs', 1, '1 ματσάκι', '1 bunch', '🌿'],
  ['dill', 'Άνηθος', 'Dill', 'produce', 'pcs', 1, '1 ματσάκι', '1 bunch', '🌿'],
  ['mint', 'Δυόσμος', 'Mint', 'produce', 'pcs', 1, '1 ματσάκι', '1 bunch', '🌱'],
  ['spring-onions', 'Φρέσκα κρεμμυδάκια', 'Spring onions', 'produce', 'pcs', 6, '1 ματσάκι (~6 τεμ.)', '1 bunch (~6)', '🧅'],
  ['celery', 'Σέλινο', 'Celery', 'produce', 'pcs', 1, '1 ματσάκι', '1 bunch', '🥬'],

  // ---- meat & fish (κρεοπωλείο) ----
  ['chicken-legs', 'Μπούτια κοτόπουλου', 'Chicken legs', 'meat-fish', 'g', 1000, '1 κιλό', '1 kg', '🍗'],
  ['chicken-breast', 'Στήθος κοτόπουλου φιλέτο', 'Chicken breast fillet', 'meat-fish', 'g', 500, '500 γρ.', '500 g', '🍗'],
  ['minced-meat', 'Κιμάς ανάμεικτος (μοσχάρι-χοιρινό)', 'Mixed minced beef & pork', 'meat-fish', 'g', 500, '500 γρ.', '500 g', '🥩'],
  ['pork-shoulder', 'Χοιρινή σπάλα', 'Pork shoulder', 'meat-fish', 'g', 1000, '1 κιλό', '1 kg', '🥩'],

  // ---- fridge: dairy, eggs, deli ----
  ['eggs', 'Αυγά', 'Eggs', 'dairy-eggs', 'pcs', 10, '10 τεμ.', '10 pcs', '🥚', ['eggs']],
  ['milk', 'Φρέσκο γάλα', 'Fresh milk', 'dairy-eggs', 'ml', 1000, '1 λίτρο', '1 litre', '🥛', ['lactose']],
  ['yogurt', 'Γιαούρτι στραγγιστό', 'Greek strained yogurt', 'dairy-eggs', 'g', 1000, '1 κιλό', '1 kg', '🥣', ['lactose']],
  ['feta', 'Φέτα ΠΟΠ', 'Feta PDO', 'dairy-eggs', 'g', 400, '400 γρ.', '400 g', '🧀', ['lactose']],
  ['kasseri', 'Κασέρι σε φέτες', 'Sliced kasseri cheese', 'dairy-eggs', 'g', 300, '300 γρ.', '300 g', '🧀', ['lactose']],
  ['grated-cheese', 'Κεφαλογραβιέρα τριμμένη', 'Grated kefalograviera', 'dairy-eggs', 'g', 200, '200 γρ.', '200 g', '🧀', ['lactose']],
  ['mozzarella', 'Μοτσαρέλα τριμμένη', 'Grated mozzarella', 'dairy-eggs', 'g', 200, '200 γρ.', '200 g', '🧀', ['lactose']],
  ['butter', 'Βούτυρο', 'Butter', 'dairy-eggs', 'g', 250, '250 γρ.', '250 g', '🧈', ['lactose']],
  ['turkey', 'Γαλοπούλα καπνιστή σε φέτες', 'Smoked turkey slices', 'dairy-eggs', 'g', 200, '200 γρ.', '200 g', '🦃'],

  // ---- bakery (φούρνος) ----
  ['bread', 'Ψωμί χωριάτικο', 'Village bread loaf', 'bakery', 'g', 500, '500 γρ.', '500 g', '🍞', ['gluten']],
  ['toast-bread', 'Ψωμί του τοστ', 'Sandwich bread', 'bakery', 'pcs', 24, '700 γρ. (24 φέτες)', '700 g (24 slices)', '🍞', ['gluten']],
  ['koulouri', 'Κουλούρι Θεσσαλονίκης', 'Koulouri sesame ring', 'bakery', 'pcs', 4, '4 τεμ.', '4 pcs', '🥯', ['gluten', 'sesame']],
  ['breadsticks', 'Κριτσίνια με σουσάμι', 'Sesame breadsticks', 'bakery', 'g', 250, '250 γρ.', '250 g', '🥖', ['gluten', 'sesame']],
  ['rusks', 'Φρυγανιές ολικής', 'Wholegrain rusks', 'bakery', 'g', 250, '250 γρ.', '250 g', '🍞', ['gluten']],
  ['pita-bread', 'Πίτες για σουβλάκι', 'Souvlaki pitas', 'bakery', 'pcs', 10, '10 τεμ.', '10 pcs', '🫓', ['gluten']],
  ['tortillas', 'Τορτίγιες', 'Tortilla wraps', 'bakery', 'pcs', 8, '8 τεμ.', '8 pcs', '🌯', ['gluten']],

  // ---- pantry (ντουλάπι) ----
  ['olive-oil', 'Ελαιόλαδο εξαιρετικό παρθένο', 'Extra virgin olive oil', 'pantry', 'ml', 1000, '1 λίτρο', '1 litre', '🫒'],
  ['sunflower-oil', 'Ηλιέλαιο', 'Sunflower oil', 'pantry', 'ml', 1000, '1 λίτρο', '1 litre', '🌻'],
  ['flour', 'Αλεύρι για όλες τις χρήσεις', 'All-purpose flour', 'pantry', 'g', 1000, '1 κιλό', '1 kg', '🌾', ['gluten']],
  ['baking-powder', 'Μπέικιν πάουντερ', 'Baking powder', 'pantry', 'g', 60, '3 φακελάκια', '3 sachets', '🥄'],
  ['yeast', 'Μαγιά ξηρή', 'Dry yeast', 'pantry', 'g', 24, '3 φακελάκια', '3 sachets', '🥄'],
  ['sugar', 'Ζάχαρη', 'Sugar', 'pantry', 'g', 1000, '1 κιλό', '1 kg', '🍬'],
  ['honey', 'Μέλι ανθέων', 'Blossom honey', 'pantry', 'g', 450, '450 γρ.', '450 g', '🍯'],
  ['tahini', 'Ταχίνι', 'Tahini', 'pantry', 'g', 300, '300 γρ.', '300 g', '🫙', ['sesame']],
  ['oats', 'Νιφάδες βρώμης', 'Oat flakes', 'pantry', 'g', 500, '500 γρ.', '500 g', '🌾', ['gluten']],
  ['spaghetti', 'Σπαγγέτι', 'Spaghetti', 'pantry', 'g', 500, '500 γρ.', '500 g', '🍝', ['gluten']],
  ['pasta-no2', 'Μακαρόνια για παστίτσιο Νο 2', 'Pastitsio pasta (No. 2)', 'pantry', 'g', 500, '500 γρ.', '500 g', '🍝', ['gluten']],
  ['orzo', 'Κριθαράκι', 'Orzo', 'pantry', 'g', 500, '500 γρ.', '500 g', '🍚', ['gluten']],
  ['hilopites', 'Χυλοπίτες', 'Hilopites egg noodles', 'pantry', 'g', 500, '500 γρ.', '500 g', '🍜', ['gluten', 'eggs']],
  ['rice', 'Ρύζι Καρολίνα', 'Carolina rice', 'pantry', 'g', 500, '500 γρ.', '500 g', '🍚'],
  ['lentils', 'Φακές ψιλές', 'Small lentils', 'pantry', 'g', 500, '500 γρ.', '500 g', '🫘'],
  ['chickpeas', 'Ρεβίθια', 'Chickpeas', 'pantry', 'g', 500, '500 γρ.', '500 g', '🫘'],
  ['giant-beans', 'Γίγαντες', 'Giant beans', 'pantry', 'g', 500, '500 γρ.', '500 g', '🫘'],
  ['white-beans', 'Φασόλια μέτρια', 'White beans', 'pantry', 'g', 500, '500 γρ.', '500 g', '🫘'],
  ['passata', 'Χυμός ντομάτας (πασάτα)', 'Tomato passata', 'pantry', 'g', 500, '500 γρ.', '500 g', '🥫'],
  ['canned-tomatoes', 'Ντομάτα ψιλοκομμένη', 'Chopped tomatoes (tin)', 'pantry', 'g', 400, '400 γρ.', '400 g', '🥫'],
  ['oregano', 'Ρίγανη', 'Dried oregano', 'pantry', 'g', 50, '50 γρ.', '50 g', '🌿'],
  ['cinnamon', 'Κανέλα τριμμένη', 'Ground cinnamon', 'pantry', 'g', 50, '50 γρ.', '50 g', '🫙'],
  ['olives', 'Ελιές Καλαμών', 'Kalamata olives', 'pantry', 'g', 350, '350 γρ.', '350 g', '🫒'],
  ['vinegar', 'Ξίδι', 'Vinegar', 'pantry', 'ml', 400, '400 ml', '400 ml', '🍶'],
  ['breadcrumbs', 'Φρυγανιά τριμμένη', 'Breadcrumbs', 'pantry', 'g', 180, '180 γρ.', '180 g', '🍞', ['gluten']],

  // ---- frozen (κατεψυγμένα) ----
  ['cod-fillet', 'Φιλέτο μπακαλιάρου', 'Cod fillet', 'frozen', 'g', 600, '600 γρ.', '600 g', '🐟', ['fish']],
  ['filo', 'Φύλλο κρούστας', 'Filo pastry', 'frozen', 'g', 450, '450 γρ.', '450 g', '🥧', ['gluten']],
]

export const ingredients: Record<IngredientId, Ingredient> = Object.fromEntries(
  DEFS.map(([id, el, en, aisle, unit, size, packEl, packEn, emoji, allergens]) => {
    const name: L10n = { el, en }
    const ing: Ingredient = { id, name, aisle, unit, pack: { size, label: { el: packEl, en: packEn } }, emoji }
    if (allergens) ing.allergens = allergens
    return [id, ing]
  }),
)

export const ingredientIds: IngredientId[] = DEFS.map((d) => d[0])

/** Shopping-list aisles, in walking order through a Greek supermarket. */
export const aisles: Record<Aisle, AisleInfo> = {
  produce: { id: 'produce', label: { el: 'Φρούτα & λαχανικά', en: 'Fruit & veg' }, emoji: '🥬', order: 1 },
  bakery: { id: 'bakery', label: { el: 'Φούρνος', en: 'Bakery' }, emoji: '🥖', order: 2 },
  'meat-fish': { id: 'meat-fish', label: { el: 'Κρεοπωλείο', en: 'Butcher' }, emoji: '🥩', order: 3 },
  'dairy-eggs': { id: 'dairy-eggs', label: { el: 'Ψυγείο: γαλακτοκομικά & αυγά', en: 'Fridge: dairy & eggs' }, emoji: '🧀', order: 4 },
  pantry: { id: 'pantry', label: { el: 'Ντουλάπι', en: 'Pantry' }, emoji: '🫙', order: 5 },
  frozen: { id: 'frozen', label: { el: 'Κατεψυγμένα', en: 'Frozen' }, emoji: '🧊', order: 6 },
}

/** Display labels for allergens (same ids as AllergenId). */
export const allergenLabels: Record<AllergenId, { label: L10n; emoji: string }> = {
  nuts: { label: { el: 'Ξηροί καρποί', en: 'Tree nuts' }, emoji: '🌰' },
  peanuts: { label: { el: 'Αράπικα φιστίκια', en: 'Peanuts' }, emoji: '🥜' },
  gluten: { label: { el: 'Γλουτένη', en: 'Gluten' }, emoji: '🌾' },
  lactose: { label: { el: 'Λακτόζη', en: 'Lactose' }, emoji: '🥛' },
  eggs: { label: { el: 'Αυγά', en: 'Eggs' }, emoji: '🥚' },
  fish: { label: { el: 'Ψάρι', en: 'Fish' }, emoji: '🐟' },
  shellfish: { label: { el: 'Οστρακοειδή', en: 'Shellfish' }, emoji: '🦐' },
  sesame: { label: { el: 'Σουσάμι', en: 'Sesame' }, emoji: '⚪' },
  soy: { label: { el: 'Σόγια', en: 'Soy' }, emoji: '🫛' },
}
