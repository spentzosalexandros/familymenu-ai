// Recipe detail + cook mode strings (EL + EN).
import type { L10n, Rating } from '../../data/types'

export const S = {
  recipe: { el: 'Συνταγή', en: 'Recipe' },
  notFound: { el: 'Δεν βρήκαμε αυτή τη συνταγή', en: 'We couldn’t find this recipe' },
  totalTime: { el: 'Συνολικά', en: 'Total' },
  handsOn: { el: '{v} δουλειά', en: '{v} hands-on' },
  easy: { el: 'Εύκολο', en: 'Easy' },
  medium: { el: 'Μέτριο', en: 'Medium' },
  perServing: { el: 'μερίδα', en: 'serving' },
  kcal: { el: '{n} kcal', en: '{n} kcal' },
  nutrition: { el: '≈ {kcal} kcal και {p} g πρωτεΐνη ανά μερίδα', en: '≈ {kcal} kcal and {p} g protein per serving' },
  whyTitle: { el: 'Γιατί το προτείνουμε', en: 'Why we suggest it' },
  whyGeneric: { el: 'Ταιριάζει στα γούστα της οικογένειας, στον χρόνο σας και στον προϋπολογισμό της εβδομάδας.', en: 'It fits the family’s tastes, your time and this week’s budget.' },
  lastTime: { el: 'Πώς το βρήκαν τα παιδιά', en: 'How the kids liked it' },
  firstTime: { el: 'Πρώτη φορά στο τραπέζι σας. Πείτε μας μετά πώς πήγε!', en: 'First time at your table. Tell us how it went!' },
  ingredients: { el: 'Υλικά', en: 'Ingredients' },
  servings: { el: 'Μερίδες', en: 'Servings' },
  servingsN: { el: '{n} μερίδες', en: '{n} servings' },
  servingsOne: { el: '1 μερίδα', en: '1 serving' },
  haveIt: { el: 'Το έχω', en: 'Got it' },
  haveItHint: { el: 'Πάτησε ό,τι έχεις ήδη στο σπίτι: βγαίνει από τη λίστα αγορών.', en: 'Tap what you already have at home: it comes off the shopping list.' },
  steps: { el: 'Βήματα', en: 'Steps' },
  kidTip: { el: 'Κόλπο για τα παιδιά', en: 'Tip for the kids' },
  startCooking: { el: 'Ξεκίνα μαγείρεμα', en: 'Start cooking' },
  swap: { el: 'Αλλαγή', en: 'Swap' },
  leftoverNote: { el: 'Περίσσευμα: απλώς ζέστανε. Τα υλικά υπολογίστηκαν ήδη.', en: 'Leftovers: just reheat. The ingredients are already counted.' },
  // cook mode
  stepOf: { el: 'Βήμα {n} από {total}', en: 'Step {n} of {total}' },
  prev: { el: 'Πίσω', en: 'Back' },
  next: { el: 'Επόμενο', en: 'Next' },
  finish: { el: 'Τελείωσα!', en: 'All done!' },
  enjoy: { el: 'Καλή όρεξη! 😋', en: 'Enjoy your meal! 😋' },
  enjoySub: { el: 'Πείτε μας μετά τι άρεσε στα παιδιά.', en: 'Tell us later what the kids liked.' },
  timer: { el: 'Χρονόμετρο {v}', en: 'Timer {v}' },
  timerPause: { el: 'Παύση', en: 'Pause' },
  timerResume: { el: 'Συνέχεια', en: 'Resume' },
  timerReset: { el: 'Επαναφορά', en: 'Reset' },
  timerDone: { el: 'Ο χρόνος τελείωσε', en: 'Time’s up' },
  swipeHint: { el: 'Σύρε για το επόμενο βήμα', en: 'Swipe for the next step' },
  ingredientsShort: { el: 'Θα χρειαστείς', en: 'You’ll need' },
} satisfies Record<string, L10n>

export const RATING: Record<Rating, { emoji: string; label: L10n }> = {
  all: { emoji: '😋', label: { el: 'Το έφαγε όλο', en: 'Ate it all' } },
  some: { emoji: '😐', label: { el: 'Έφαγε λίγο', en: 'Ate some' } },
  none: { emoji: '🙅', label: { el: 'Δεν το έφαγε', en: 'Didn’t eat it' } },
}

/** "Τρίτη · Μεσημεριανό" context line. */
export const DAY_LONG: Record<string, L10n> = {
  mon: { el: 'Δευτέρα', en: 'Monday' },
  tue: { el: 'Τρίτη', en: 'Tuesday' },
  wed: { el: 'Τετάρτη', en: 'Wednesday' },
  thu: { el: 'Πέμπτη', en: 'Thursday' },
  fri: { el: 'Παρασκευή', en: 'Friday' },
  sat: { el: 'Σάββατο', en: 'Saturday' },
  sun: { el: 'Κυριακή', en: 'Sunday' },
}
