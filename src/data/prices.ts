// Indicative € per pack, per store. Anchored to Oct 2026 prices from docs/research/greek.json
// (ELSTAT / PosoKanei / e-shop snapshots). The planner always picks the best-value pack, so packaged staples
// use private-label / offer levels (the research shows PL 45–55 % below brands on yogurt, passata, rice, lentils).
// Store shape (whole-basket level, see scripts/check-data.ts):
//   Lidl cheapest overall (private label on packaged goods), Σκλαβενίτης ≈ +4–5 % (but sharper on fresh meat
//   and produce, which is what makes a two-store split worthwhile), My Market ≈ +7 %, ΑΒ ≈ +12–14 %.
// Demo estimates only, never real chain prices.
import { ingredients } from './ingredients.ts'
import type { Aisle, IngredientId, PriceTable, StoreId } from './types.ts'

/** Reference price per pack: average of mainstream supermarkets, best-value pack, Oct 2026. */
export const REFERENCE: Record<IngredientId, number> = {
  // produce (loose items are priced per ½ kg or per piece, as weighed at the counter)
  potatoes: 1.89, // 2 kg bag ≈ 0,95 €/kg
  tomatoes: 1.19, // ½ kg ≈ 2,38 €/kg
  onions: 0.85,
  garlic: 1.29,
  zucchini: 0.99, // ½ kg
  carrots: 1.15,
  peppers: 1.49, // ½ kg
  spinach: 1.59, // 500 g bag
  leeks: 1.99,
  lettuce: 0.79,
  cucumber: 0.59,
  lemons: 0.89, // ½ kg
  apples: 0.95, // ½ kg
  bananas: 0.99, // ½ kg
  oranges: 2.19, // 2 kg net
  mandarins: 1.19, // ½ kg
  grapes: 1.29, // ½ kg
  parsley: 0.59,
  dill: 0.59,
  mint: 0.59,
  'spring-onions': 0.69,
  celery: 0.89,
  // meat & fish
  'chicken-legs': 4.99,
  'chicken-breast': 4.99, // 500 g ≈ 9,98 €/kg
  'minced-meat': 4.49, // 500 g mixed mince ≈ 8,98 €/kg
  'pork-shoulder': 7.29,
  // fridge
  eggs: 2.79,
  milk: 1.35,
  yogurt: 2.69, // PL strained yogurt 1 kg
  feta: 4.29, // 400 g ≈ 10,7 €/kg
  kasseri: 2.89,
  'grated-cheese': 2.49,
  mozzarella: 1.99,
  butter: 2.49,
  turkey: 2.49,
  // bakery
  bread: 1.19,
  'toast-bread': 1.39,
  koulouri: 1.99,
  breadsticks: 1.19,
  rusks: 1.29,
  'pita-bread': 1.49,
  tortillas: 1.79,
  // pantry
  'olive-oil': 7.49, // PL extra virgin, offer level
  'sunflower-oil': 1.89,
  flour: 0.79,
  'baking-powder': 0.49,
  yeast: 0.59,
  sugar: 0.95,
  honey: 4.99,
  tahini: 1.95,
  oats: 0.99,
  spaghetti: 0.65,
  'pasta-no2': 0.69,
  orzo: 0.65,
  hilopites: 1.39,
  rice: 1.09, // PL ≈ 2,10 €/kg
  lentils: 0.89, // PL ≈ 1,70 €/kg
  chickpeas: 1.19,
  'giant-beans': 2.59,
  'white-beans': 1.29,
  passata: 0.45,
  'canned-tomatoes': 0.59,
  oregano: 0.99,
  cinnamon: 0.89,
  olives: 2.29,
  vinegar: 0.59,
  breadcrumbs: 0.89,
  // frozen
  'cod-fillet': 5.99,
  filo: 2.29,
}

/** Store price level per aisle, relative to the reference. */
export const LEVEL: Record<StoreId, Record<Aisle, number>> = {
  // calibrated with a grid search on the demo basket (fresh = produce + meat, packaged = the rest)
  sklavenitis: { produce: 0.9, 'meat-fish': 0.9, 'dairy-eggs': 0.99, bakery: 0.99, pantry: 0.99, frozen: 0.99 },
  lidl: { produce: 0.98, 'meat-fish': 0.98, 'dairy-eggs': 0.86, bakery: 0.86, pantry: 0.86, frozen: 0.86 },
  mymarket: { produce: 0.935, 'meat-fish': 0.935, 'dairy-eggs': 1.015, bakery: 1.015, pantry: 1.015, frozen: 1.015 },
  ab: { produce: 0.99, 'meat-fish': 0.99, 'dairy-eggs': 1.06, bakery: 1.06, pantry: 1.06, frozen: 1.06 },
}

/** Small deterministic per-item variation (±3 %), so stores are not perfectly proportional. */
function jitter(id: string, store: StoreId): number {
  let h = 2166136261
  for (const ch of `${id}@${store}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return 1 + (((h >>> 0) % 61) - 30) / 1000
}

/** Retail-looking price: ends in 9 (0,79 · 2,49 · 6,99). */
const shelf = (x: number): number => Math.max(0.19, Math.round(x * 10) / 10 - 0.01)

function build(): PriceTable {
  const table = { sklavenitis: {}, lidl: {}, ab: {}, mymarket: {} } as PriceTable
  for (const [id, ing] of Object.entries(ingredients)) {
    const ref = REFERENCE[id]
    for (const store of Object.keys(table) as StoreId[]) {
      table[store][id] = Number(shelf(ref * LEVEL[store][ing.aisle] * jitter(id, store)).toFixed(2))
    }
  }
  return table
}

export const prices: PriceTable = build()

/** € per ingredient unit (g, ml or pc) at a store. */
export const unitPrice = (id: IngredientId, store: StoreId): number => prices[store][id] / ingredients[id].pack.size
