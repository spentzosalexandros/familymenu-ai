// Today tab strings (EL + EN).
import type { L10n, MemberId } from '../../data/types'

export const S = {
  title: { el: 'Σήμερα', en: 'Today' },
  upNext: { el: 'Επόμενο', en: 'Up next' },
  tonight: { el: 'Απόψε', en: 'Tonight' },
  recipe: { el: 'Συνταγή', en: 'Recipe' },
  swap: { el: 'Αλλαγή', en: 'Swap' },
  perServing: { el: '{v} / μερίδα', en: '{v} per serving' },
  restOfDay: { el: 'Τα υπόλοιπα της ημέρας', en: 'The rest of today' },
  eaten: { el: 'Έγινε', en: 'Done' },
  eatingOut: { el: 'Τρώμε έξω', en: 'Eating out' },
  leftover: { el: 'Περίσσευμα', en: 'Leftovers' },
  leftoverFrom: { el: 'Περίσσευμα από {day}', en: 'Leftovers from {day}' },
  batch: { el: 'Μαγειρεύεις για 2 μέρες', en: 'Cook once, eat twice' },
  fasting: { el: 'Νηστίσιμο', en: 'Fasting-friendly' },
  adapted: { el: 'Προσαρμόστηκε', en: 'Adapted' },
  favOf: { el: 'Αγαπημένο {who}', en: '{who}’s favourite' },
  favKids: { el: 'Αγαπημένο των παιδιών', en: 'Kids’ favourite' },
  // feedback card
  fbYesterday: { el: 'Πώς πήγε το χθεσινό {slot};', en: 'How did yesterday’s {slot} go?' },
  fbToday: { el: 'Πώς πήγε το σημερινό {slot};', en: 'How did today’s {slot} go?' },
  fbGeneric: { el: 'Πώς πήγε το {slot};', en: 'How did the {slot} go?' },
  fbSub: { el: 'Ένα άγγιγμα για κάθε παιδί. Έτσι μαθαίνουμε τι τους αρέσει.', en: 'One tap per child, so we learn what they like.' },
  fbCta: { el: 'Πες μας', en: 'Tell us' },
  fbMore: { el: '+{n} ακόμα', en: '+{n} more' },
  // budget
  budgetTitle: { el: 'Προϋπολογισμός εβδομάδας', en: 'This week’s budget' },
  budgetAt: { el: 'Εκτίμηση: {store}', en: 'Estimate: {store}' },
  of: { el: 'από {b}', en: 'of {b}' },
  left: { el: 'Περισσεύουν {v}', en: '{v} left' },
  over: { el: '{v} πάνω από τον στόχο', en: '{v} over budget' },
  budgetRing: { el: 'Κόστος εβδομάδας {v} από {b}', en: 'Week cost {v} of {b}' },
  // insight
  learned: { el: 'Το AI έμαθε…', en: 'The AI learned…' },
  seeAll: { el: 'Όλα', en: 'See all' },
  // recap
  recapKicker: { el: 'Κυριακή · απολογισμός', en: 'Sunday · recap' },
  recapTitle: { el: 'Η εβδομάδα σας με μια ματιά', en: 'Your week at a glance' },
  recapSub: { el: 'Χρόνος, χρήματα και τι άρεσε στα παιδιά.', en: 'Time, money and what the kids loved.' },
  recapCta: { el: 'Δες τον απολογισμό', en: 'See the recap' },
} satisfies Record<string, L10n>

/** "του Νίκου" / "της Ελένης" — Greek genitive with article; English plain name. */
export const GENITIVE: Record<MemberId, L10n> = {
  nikos: { el: 'του Νίκου', en: 'Nikos' },
  eleni: { el: 'της Ελένης', en: 'Eleni' },
  maria: { el: 'της Μαρίας', en: 'Maria' },
  giorgos: { el: 'του Γιώργου', en: 'Giorgos' },
}

/** "από την Πέμπτη" style day labels for leftovers. */
export const FROM_DAY: Record<string, L10n> = {
  mon: { el: 'τη Δευτέρα', en: 'Monday' },
  tue: { el: 'την Τρίτη', en: 'Tuesday' },
  wed: { el: 'την Τετάρτη', en: 'Wednesday' },
  thu: { el: 'την Πέμπτη', en: 'Thursday' },
  fri: { el: 'την Παρασκευή', en: 'Friday' },
  sat: { el: 'το Σάββατο', en: 'Saturday' },
  sun: { el: 'την Κυριακή', en: 'Sunday' },
}
