import type { AllergenId, DietId } from '../../data/types'

export const PS = {
  title: { el: 'Προφίλ', en: 'Profile' },
  familyName: { el: 'Οικογένεια Παπαδόπουλου', en: 'The Papadopoulos family' },
  people: { el: '{n} άτομα', en: '{n} people' },
  subscription: { el: 'Συνδρομή', en: 'Subscription' },
  planName: { el: 'FamilyMenu AI', en: 'FamilyMenu AI' },
  trial: { el: 'Δωρεάν δοκιμή', en: 'Free trial' },
  daysLeft: {
    el: { one: 'Απομένει {n} μέρα', other: 'Απομένουν {n} μέρες' },
    en: { one: '{n} day left', other: '{n} days left' },
  },
  thenPrice: { el: 'Μετά {price}/μήνα · ακύρωση οποτεδήποτε', en: 'Then {price}/month · cancel anytime' },
  manage: { el: 'Διαχείριση συνδρομής', en: 'Manage subscription' },
  manageAlertTitle: { el: 'Διαχείριση συνδρομής', en: 'Manage subscription' },
  manageAlertBody: {
    el: 'Στην κανονική εφαρμογή εδώ ανοίγουν οι συνδρομές του λογαριασμού σου. Στο demo δεν γίνεται καμία χρέωση.',
    en: 'In the real app this opens your account’s subscriptions. Nothing is charged in the demo.',
  },
  budget: { el: 'Προϋπολογισμός', en: 'Budget' },
  weeklyBudget: { el: 'Εβδομαδιαίος', en: 'Weekly' },
  budgetFooter: {
    el: 'Το AI φτιάχνει το πλάνο ώστε να χωράει σε αυτό το ποσό.',
    en: 'The AI builds the plan to fit this amount.',
  },
  perWeek: { el: '{v}/εβδομάδα', en: '{v}/week' },
  stores: { el: 'Καταστήματα', en: 'Stores' },
  storesFooter: {
    el: 'Ενδεικτικές τιμές από δημόσιους τιμοκαταλόγους — όχι ζωντανές τιμές.',
    en: 'Indicative prices from public price lists — not live prices.',
  },
  km: { el: '{v} χλμ.', en: '{v} km' },
  diet: { el: 'Διατροφή και αλλεργίες', en: 'Diet & allergies' },
  noAllergy: { el: 'Καμία αλλεργία', en: 'No allergies' },
  allergy: { el: 'Αλλεργία: {list}', en: 'Allergy: {list}' },
  fasting: { el: 'Νηστεία', en: 'Fasting' },
  dietsNone: { el: 'Καμία', en: 'None' },
  safetyFooter: {
    el: 'Δεν θα προτείνουμε ποτέ πιάτο με αλλεργιογόνο για μέλος που είναι αλλεργικό.',
    en: 'We will never suggest a dish with an allergen to a member who is allergic to it.',
  },
  notifications: { el: 'Ειδοποιήσεις', en: 'Notifications' },
  reminder: { el: 'Υπενθύμιση «Πώς πήγε;»', en: '“How did it go?” reminder' },
  reminderSub: { el: 'Κάθε βράδυ στις {time}', en: 'Every evening at {time}' },
  language: { el: 'Γλώσσα', en: 'Language' },
  appearance: { el: 'Εμφάνιση', en: 'Appearance' },
  light: { el: 'Φωτεινή', en: 'Light' },
  dark: { el: 'Σκοτεινή', en: 'Dark' },
  auto: { el: 'Αυτόματη', en: 'Auto' },
  colours: { el: 'Χρώματα εφαρμογής', en: 'App colours' },
  about: { el: 'Σχετικά', en: 'About' },
  version: { el: 'Έκδοση', en: 'Version' },
  versionValue: { el: 'Mockup 0.1', en: 'Mockup 0.1' },
  credits: { el: 'Πηγές φωτογραφιών', en: 'Image credits' },
  creditsSub: { el: 'Wikimedia Commons · ελεύθερες άδειες', en: 'Wikimedia Commons · free licences' },
  demoNote: {
    el: 'Ενδεικτικές τιμές — demo. Χωρίς πραγματικό AI, backend ή πληρωμές.',
    en: 'Indicative prices — demo. No real AI, backend or payments.',
  },
  resetDemo: { el: 'Επαναφορά demo', en: 'Reset demo' },
  resetTitle: { el: 'Επαναφορά του demo;', en: 'Reset the demo?' },
  resetBody: {
    el: 'Το πλάνο, η λίστα και οι αξιολογήσεις επιστρέφουν στην αρχή.',
    en: 'The plan, the list and the feedback go back to the start.',
  },
  resetDone: { el: 'Το demo ξεκίνησε από την αρχή', en: 'The demo has been reset' },
}

export const ALLERGEN_LABEL: Record<AllergenId, { el: string; en: string }> = {
  nuts: { el: 'ξηροί καρποί', en: 'tree nuts' },
  peanuts: { el: 'αράπικα φιστίκια', en: 'peanuts' },
  gluten: { el: 'γλουτένη', en: 'gluten' },
  lactose: { el: 'λακτόζη', en: 'lactose' },
  eggs: { el: 'αυγά', en: 'eggs' },
  fish: { el: 'ψάρι', en: 'fish' },
  shellfish: { el: 'οστρακοειδή', en: 'shellfish' },
  sesame: { el: 'σουσάμι', en: 'sesame' },
  soy: { el: 'σόγια', en: 'soy' },
}

export const DIET_LABEL: Record<DietId, { el: string; en: string }> = {
  'fasting-wed': { el: 'Τετάρτη', en: 'Wednesday' },
  'fasting-fri': { el: 'Παρασκευή', en: 'Friday' },
  vegetarian: { el: 'Χορτοφαγικό', en: 'Vegetarian' },
  pescatarian: { el: 'Χωρίς κρέας, με ψάρι', en: 'Pescatarian' },
}

export const FALLBACK_STORES = [
  { id: 'sklavenitis', name: 'Σκλαβενίτης', distanceKm: 0.6, color: '#E4572E' },
  { id: 'lidl', name: 'Lidl', distanceKm: 1.1, color: '#1F4FA3' },
  { id: 'ab', name: 'ΑΒ Βασιλόπουλος', distanceKm: 1.4, color: '#D62839' },
  { id: 'mymarket', name: 'My Market', distanceKm: 2.0, color: '#F2A541' },
] as const
