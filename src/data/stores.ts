// Nearby supermarkets (real chain names only: no logos, no brand colours). Indicative demo data.
import type { L10n, Store, StoreId } from './types.ts'

// Chain names follow the UI language (Greek script in EL, the chains' own Latin spelling in EN).
// `name` stays a plain string for every caller: it is a getter that reads the current language,
// which the app store sets through setStoreNameLang() (screens re-render on a language change anyway).
let nameLang: 'el' | 'en' = 'el'
export function setStoreNameLang(lang: 'el' | 'en') {
  nameLang = lang
}
const NAME_EN: Partial<Record<StoreId, string>> = { sklavenitis: 'Sklavenitis', ab: 'AB Vassilopoulos' }

export const stores: Store[] = [
  {
    id: 'sklavenitis',
    name: 'Σκλαβενίτης',
    distanceKm: 0.6,
    address: { el: 'Αγίας Παρασκευής 42, Χαλάνδρι', en: '42 Agias Paraskevis St, Chalandri' },
    color: '#0F9D8A',
    openUntil: '21:00',
  },
  {
    id: 'lidl',
    name: 'Lidl',
    distanceKm: 1.1,
    address: { el: 'Λεωφ. Πεντέλης 118, Χαλάνδρι', en: '118 Pentelis Ave, Chalandri' },
    color: '#7C5CFC',
    openUntil: '21:00',
  },
  {
    id: 'ab',
    name: 'ΑΒ Βασιλόπουλος',
    distanceKm: 1.4,
    address: { el: 'Ανδρέα Παπανδρέου 31, Χαλάνδρι', en: '31 Andrea Papandreou St, Chalandri' },
    color: '#65A30D',
    openUntil: '21:00',
  },
  {
    id: 'mymarket',
    name: 'My Market',
    distanceKm: 2.0,
    address: { el: 'Λεωφ. Δουκίσσης Πλακεντίας 9, Χαλάνδρι', en: '9 Doukissis Plakentias Ave, Chalandri' },
    color: '#0284C7',
    openUntil: '21:00',
  },
]

for (const st of stores) {
  const el = st.name
  const en = NAME_EN[st.id]
  if (en) Object.defineProperty(st, 'name', { get: () => (nameLang === 'en' ? en : el), enumerable: true })
}

export const storeIds: StoreId[] = stores.map((s) => s.id)
export const storeById = (id: StoreId): Store => stores.find((s) => s.id === id) as Store

/** Label to show next to every price (brand guardrail from the research). */
export const PRICE_DISCLAIMER: L10n = {
  el: 'Ενδεικτικές τιμές · εκτίμηση για επίδειξη, 27/10/2026',
  en: 'Indicative prices · demo estimate, 27/10/2026',
}
