import type { L10n, MemberId } from '../../data/types'

/** Week tab + swap sheet strings (EL first, EN second). */
export const T = {
  // ---- week screen ----
  today: { el: 'Σήμερα', en: 'Today' },
  tomorrow: { el: 'Αύριο', en: 'Tomorrow' },
  weekCost: { el: 'Κόστος εβδομάδας', en: 'This week’s cost' },
  atStore: { el: 'στο {store}', en: 'at {store}' },
  ofBudget: { el: 'από {b}', en: 'of {b}' },
  left: { el: 'Περισσεύουν {v}', en: '{v} left' },
  over: { el: '{v} πάνω από το όριο', en: '{v} over budget' },
  reused: {
    el: { one: '{n} υλικό σε 2+ γεύματα', other: '{n} υλικά σε 2+ γεύματα' },
    en: { one: '{n} ingredient in 2+ meals', other: '{n} ingredients in 2+ meals' },
  },
  leftovers: {
    el: { one: '{n} γεύμα από περίσσευμα', other: '{n} γεύματα από περισσεύματα' },
    en: { one: '{n} meal from leftovers', other: '{n} meals from leftovers' },
  },
  meals: {
    el: { one: '{n} γεύμα', other: '{n} γεύματα' },
    en: { one: '{n} meal', other: '{n} meals' },
  },
  noAllergens: { el: '0 αλλεργιογόνα', en: '0 allergens' },
  regenerate: { el: 'Νέο πλάνο εβδομάδας', en: 'New weekly plan' },
  regenerating: { el: 'Φτιάχνουμε νέο πλάνο…', en: 'Building a new plan…' },
  regenDone: {
    el: { one: 'Νέο πλάνο: άλλαξε {n} γεύμα', other: 'Νέο πλάνο: άλλαξαν {n} γεύματα' },
    en: { one: 'New plan: {n} meal changed', other: 'New plan: {n} meals changed' },
  },
  regenKept: { el: 'Κράτησα τα κλειδωμένα και τα περισσεύματα', en: 'Locked meals and leftovers stayed put' },
  regenNone: { el: 'Το πλάνο σας είναι ήδη το καλύτερο που βρήκα', en: 'Your plan is already the best I could find' },
  perServing: { el: '{v}/μερίδα', en: '{v}/serving' },
  dayTotal: { el: '{v}', en: '{v}' },
  noCost: { el: 'Χωρίς ψώνια', en: 'No shopping' },
  adaptedBanner: { el: 'Το πλάνο προσαρμόστηκε', en: 'Your plan adapted' },
  show: { el: 'Δείξε μου', en: 'Show me' },

  // ---- badges ----
  lovedByBoth: { el: 'Αγαπημένο των παιδιών', en: 'Kids’ favourite' },
  fasting: { el: 'Νηστίσιμο', en: 'Fasting' },
  leftoverFrom: { el: 'Περίσσευμα από {day}', en: 'Leftovers from {day}' },
  batch: { el: 'Μαγειρεύεις για 2 μέρες', en: 'Cook once, eat twice' },
  eatingOut: { el: 'Τρώμε έξω', en: 'Eating out' },
  locked: { el: 'Κλειδωμένο', en: 'Locked' },
  ready: { el: 'Έτοιμο', en: 'Ready' },

  // ---- actions (swipe + context menu) ----
  swap: { el: 'Αλλαγή', en: 'Swap' },
  lock: { el: 'Κλείδωμα', en: 'Lock' },
  unlock: { el: 'Ξεκλείδωμα', en: 'Unlock' },
  eatOut: { el: 'Τρώμε έξω', en: 'Eating out' },
  eatHome: { el: 'Τρώμε σπίτι', en: 'Eating at home' },
  recipe: { el: 'Συνταγή', en: 'Recipe' },
  lockedToast: { el: 'Κλείδωσε: το νέο πλάνο δεν θα το αλλάξει', en: 'Locked: a new plan won’t change it' },
  unlockedToast: { el: 'Ξεκλείδωσε', en: 'Unlocked' },
  eatOutToast: { el: 'Τρώτε έξω: βγήκε από τα ψώνια', en: 'Eating out: removed from the shopping list' },
  eatHomeToast: { el: 'Ξανά στο πλάνο', en: 'Back in the plan' },

  // ---- swap sheet ----
  swapTitle: { el: 'Αλλαγή γεύματος', en: 'Swap meal' },
  inPlan: { el: 'Τώρα στο πλάνο', en: 'In your plan' },
  why: { el: 'Γιατί το προτείναμε', en: 'Why we picked it' },
  suggestions: { el: 'Προτάσεις', en: 'Suggestions' },
  suggestionsHint: {
    el: 'Όλες ασφαλείς για την Ελένη και ταιριάζουν στη μέρα',
    en: 'All safe for Eleni and right for the day',
  },
  filterQuick: { el: 'Πιο γρήγορο', en: 'Quicker' },
  filterCheap: { el: 'Πιο φθηνό', en: 'Cheaper' },
  filterFasting: { el: 'Νηστίσιμο', en: 'Fasting' },
  filterKids: { el: 'Αγαπημένο παιδιών', en: 'Kids’ favourite' },
  sameCost: { el: 'Ίδιο κόστος', en: 'Same cost' },
  deltaWeek: { el: '{v} την εβδομάδα', en: '{v} a week' },
  choose: { el: 'Επιλογή', en: 'Choose' },
  chosen: { el: 'Επιλέχθηκε', en: 'Chosen' },
  noMatch: { el: 'Τίποτα με αυτά τα φίλτρα', en: 'Nothing matches these filters' },
  noMatchBody: {
    el: 'Δοκίμασε λιγότερα φίλτρα. Δεν προτείνουμε ποτέ κάτι που δεν είναι ασφαλές.',
    en: 'Try fewer filters. We never suggest anything that isn’t safe.',
  },
  clearFilters: { el: 'Καθαρισμός φίλτρων', en: 'Clear filters' },
  leftoverNote: {
    el: 'Τώρα είναι περίσσευμα. Αν το αλλάξεις, θα μαγειρευτεί φρέσκο.',
    en: 'This is leftovers now. Swap it and it gets cooked fresh.',
  },
  batchNote: {
    el: 'Μαγειρεύεται διπλό: το περίσσευμα {day} ακολουθεί την αλλαγή.',
    en: 'Cooked as a double batch: the leftovers {day} follow the swap.',
  },
  swappedToast: { el: 'Άλλαξε σε {name}', en: 'Swapped to {name}' },
  notFound: { el: 'Δεν βρέθηκε το γεύμα', en: 'Meal not found' },
  slotDay: { el: '{day} · {slot}', en: '{day} · {slot}' },
} as const

/** "Αγαπημένο του Νίκου" — genitive with article. */
export const LOVED_BY: Record<MemberId, L10n> = {
  nikos: { el: 'Αγαπημένο του Νίκου', en: 'Nikos’s favourite' },
  eleni: { el: 'Αγαπημένο της Ελένης', en: 'Eleni’s favourite' },
  maria: { el: 'Αγαπημένο της Μαρίας', en: 'Maria’s favourite' },
  giorgos: { el: 'Αγαπημένο του Γιώργου', en: 'Giorgos’s favourite' },
}

/** "Προσαρμόστηκε για την Ελένη" — accusative with article. */
export const ADAPTED_FOR: Record<MemberId, L10n> = {
  nikos: { el: 'Προσαρμόστηκε για τον Νίκο', en: 'Adapted for Nikos' },
  eleni: { el: 'Προσαρμόστηκε για την Ελένη', en: 'Adapted for Eleni' },
  maria: { el: 'Προσαρμόστηκε για τη Μαρία', en: 'Adapted for Maria' },
  giorgos: { el: 'Προσαρμόστηκε για τον Γιώργο', en: 'Adapted for Giorgos' },
}

/** Genitive day names for "το περίσσευμα της Παρασκευής". */
export const DAY_GEN: Record<string, L10n> = {
  mon: { el: 'της Δευτέρας', en: 'on Monday' },
  tue: { el: 'της Τρίτης', en: 'on Tuesday' },
  wed: { el: 'της Τετάρτης', en: 'on Wednesday' },
  thu: { el: 'της Πέμπτης', en: 'on Thursday' },
  fri: { el: 'της Παρασκευής', en: 'on Friday' },
  sat: { el: 'του Σαββάτου', en: 'on Saturday' },
  sun: { el: 'της Κυριακής', en: 'on Sunday' },
}
