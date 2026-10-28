// Family feature strings (EL first, EN second). Shell strings live in src/i18n/strings.ts.
import type { FeedbackReason, L10n, MemberId, Preference, Rating } from '../../data/types'

export const T = {
  // ---------- Family tab ----------
  title: { el: 'Οικογένεια', en: 'Family' },
  members: { el: 'Τα μέλη', en: 'Members' },
  parent: { el: 'Γονιός', en: 'Parent' },
  parents: { el: 'Γονείς', en: 'Parents' },
  child: { el: 'Παιδί', en: 'Child' },
  years: { el: '{n} ετών', en: '{n} years old' },
  noAllergies: { el: 'Χωρίς αλλεργίες', en: 'No allergies' },
  allergyTo: { el: 'Αλλεργία: {a}', en: 'Allergy: {a}' },
  acceptance: { el: 'αποδοχή', en: 'acceptance' },
  acceptanceWeek: { el: 'Αποδοχή αυτή την εβδομάδα', en: 'Acceptance this week' },
  acceptanceLastWeek: { el: 'Αποδοχή την προηγούμενη εβδομάδα', en: 'Acceptance last week' },
  lastWeekShort: { el: 'προηγ. εβδομάδα', en: 'last week' },
  loves: { el: 'Λατρεύει', en: 'Loves' },
  parentsNote: {
    el: 'Αγαπούν την παραδοσιακή σπιτική κουζίνα. Όχι συκώτι, όχι μπάμιες.',
    en: 'Love traditional Greek home cooking. No liver, no okra.',
  },
  learned: { el: 'Τι έμαθε το AI', en: 'What the AI learned' },
  learnedSub: { el: 'Από τις απαντήσεις σας, μέρα με τη μέρα', en: 'From your answers, day by day' },
  newBadge: { el: 'Νέο', en: 'New' },
  pendingTitle: { el: 'Περιμένουν την απάντησή σας', en: 'Waiting for your answer' },
  pendingCta: { el: 'Πες μας', en: 'Tell us' },
  recapCardTitle: { el: 'Η εβδομάδα σας με μια ματιά', en: 'Your week at a glance' },
  recapCardBody: { el: 'Χρόνος, χρήματα και τα αγαπημένα των παιδιών.', en: 'Time, money and the kids’ favourites.' },
  recapCardCta: { el: 'Άνοιγμα ανασκόπησης', en: 'Open the recap' },
  safeNote: {
    el: 'Δεν θα προτείνουμε ποτέ πιάτο με αλλεργιογόνο.',
    en: 'We will never suggest a dish with an allergen.',
  },

  // ---------- Child profile ----------
  profileOf: { el: 'Προφίλ', en: 'Profile' },
  tasteTitle: { el: 'Τα γούστα', en: 'Taste profile' },
  tasteSub: { el: 'Ενημερώνονται μόνα τους από τις απαντήσεις σας', en: 'They update themselves from your answers' },
  prefLove: { el: 'Λατρεύει', en: 'Loves' },
  prefEats: { el: 'Τρώει', en: 'Eats' },
  prefRefuses: { el: 'Όχι ακόμα', en: 'Not yet' },
  emptyColumn: { el: 'Τίποτα ακόμα', en: 'Nothing yet' },
  justChanged: { el: 'Μόλις άλλαξε', en: 'Just changed' },
  chartTitle: { el: 'Αποδοχή ανά μέρα', en: 'Acceptance by day' },
  chartSub: { el: 'Πόσο έφαγε στα κυρίως γεύματα', en: 'How much was eaten at main meals' },
  chartEmpty: { el: 'Θα γεμίσει μέσα στην εβδομάδα', en: 'Fills up during the week' },
  recentTitle: { el: 'Πρόσφατες απαντήσεις', en: 'Recent feedback' },
  recentEmpty: { el: 'Δεν υπάρχουν ακόμα απαντήσεις αυτή την εβδομάδα.', en: 'No feedback yet this week.' },
  insightsTitle: { el: 'Τι μάθαμε', en: 'What we learned' },
  insightsEmpty: { el: 'Θα μαθαίνουμε από κάθε γεύμα.', en: 'We learn from every meal.' },
  allergyCard: { el: 'Αλλεργίες', en: 'Allergies' },
  allergyGuard: {
    el: 'Ελέγχουμε κάθε υλικό, ακόμα και στα σνακ για το σχολείο.',
    en: 'We check every ingredient, even in the school snacks.',
  },
  notFound: { el: 'Δεν βρέθηκε το προφίλ', en: 'Profile not found' },

  // ---------- Feedback sheet ----------
  feedbackTitle: { el: 'Πώς πήγε;', en: 'How did it go?' },
  yesterday: { el: 'Χθες', en: 'Yesterday' },
  today: { el: 'Σήμερα', en: 'Today' },
  howMuch: { el: 'Πόσο έφαγε {name};', en: 'How much did {name} eat?' },
  why: { el: 'Τι δεν του άρεσε; (προαιρετικό)', en: 'What didn’t work? (optional)' },
  whyF: { el: 'Τι δεν της άρεσε; (προαιρετικό)', en: 'What didn’t work? (optional)' },
  leftoversQ: { el: 'Περίσσεψε φαγητό;', en: 'Any leftovers?' },
  leftoversHint: { el: 'Θα το αξιοποιήσουμε σε άλλο γεύμα.', en: 'We’ll reuse it in another meal.' },
  submit: { el: 'Αποστολή', en: 'Send' },
  submitHint: { el: 'Διάλεξε για κάθε παιδί', en: 'Pick an answer for each child' },
  thinking: { el: 'Το AI προσαρμόζει το πλάνο…', en: 'The AI is adapting the plan…' },
  thinkingSteps: [
    { el: 'Διαβάζουμε τις απαντήσεις', en: 'Reading your answers' },
    { el: 'Ενημερώνουμε τα γούστα', en: 'Updating taste profiles' },
    { el: 'Ελέγχουμε την υπόλοιπη εβδομάδα', en: 'Checking the rest of the week' },
  ] as L10n[],
  learnedHeader: { el: 'Το AI έμαθε', en: 'The AI learned' },
  changedMeals: { el: 'Άλλαξε στο πλάνο', en: 'Changed in the plan' },
  tasteMoves: { el: 'Άλλαξε στα γούστα', en: 'Taste profile updates' },
  noChanges: { el: 'Το πλάνο μένει ως έχει: όλα πάνε καλά.', en: 'The plan stays as it is: all good.' },
  great: { el: 'Τέλεια', en: 'Great' },
  seePlan: { el: 'Δες το πλάνο', en: 'See the plan' },
  seeProfile: { el: 'Προφίλ: {name}', en: '{name}’s profile' },
  planUpdated: { el: 'Το πλάνο ενημερώθηκε', en: 'Plan updated' },
  thanks: { el: 'Ευχαριστούμε!', en: 'Thank you!' },
  show: { el: 'Προβολή', en: 'Show' },
  mealMissing: { el: 'Δεν βρέθηκε το γεύμα', en: 'Meal not found' },
  leftoverBadge: { el: 'Περίσσευμα', en: 'Leftovers' },

  // ---------- Recap ----------
  recapTitle: { el: 'Η εβδομάδα σας', en: 'Your week' },
  recapHello: { el: 'Μπράβο, οικογένεια Παπαδόπουλου!', en: 'Well done, Papadopoulos family!' },
  recapIntro: {
    el: 'Δείτε τι κερδίσατε αυτή την εβδομάδα με το FamilyMenu.',
    en: 'Here’s what you gained this week with FamilyMenu.',
  },
  statTime: { el: 'χρόνος που γλιτώσατε', en: 'time saved' },
  statSpent: { el: 'ξοδέψατε στα ψώνια', en: 'spent on groceries' },
  statUnder: { el: '{v} κάτω από τον στόχο', en: '{v} under budget' },
  statOver: { el: '{v} πάνω από τον στόχο', en: '{v} over budget' },
  statWaste: { el: 'λιγότερη σπατάλη', en: 'less food waste' },
  statLeftovers: { el: 'γεύματα από περισσεύματα', en: 'meals from leftovers' },
  statLeftoversN: {
    el: { one: 'γεύμα από περισσεύματα', other: 'γεύματα από περισσεύματα' },
    en: { one: 'meal from leftovers', other: 'meals from leftovers' },
  },
  minutesUnit: { el: ' λεπτά', en: ' min' },
  kidsAte: { el: 'Πόσο έφαγαν τα παιδιά', en: 'How much the kids ate' },
  overall: { el: 'συνολικά', en: 'overall' },
  topHits: { el: 'Οι επιτυχίες της εβδομάδας', en: 'Hits of the week' },
  newFavs: { el: 'Νέα αγαπημένα', en: 'New favourites' },
  favOf: { el: 'Νέο αγαπημένο {name}', en: '{name} new favourite' },
  hitOf: { el: 'Το λάτρεψε {name}', en: '{name} loved it' },
  learnedWeek: { el: 'Τι έμαθε το AI αυτή την εβδομάδα', en: 'What the AI learned this week' },
  recapCta: { el: 'Φτιάξε την επόμενη εβδομάδα', en: 'Plan next week' },
  genTitle: { el: 'Φτιάχνουμε την επόμενη εβδομάδα', en: 'Building next week' },
  genSteps: [
    { el: 'Κρατάμε τα αγαπημένα του Νίκου και της Ελένης', en: 'Keeping Nikos’ and Eleni’s favourites' },
    { el: 'Κρύβουμε τα λαχανικά όπου χρειάζεται', en: 'Hiding veggies where needed' },
    { el: 'Αποκλείουμε τους ξηρούς καρπούς', en: 'Excluding tree nuts' },
    { el: 'Συγκρίνουμε τιμές σε 4 σούπερ μάρκετ', en: 'Comparing prices at 4 supermarkets' },
  ] as L10n[],
  genSkip: { el: 'Άγγιξε για παράλειψη', en: 'Tap to skip' },
  readyTitle: { el: 'Η επόμενη εβδομάδα είναι έτοιμη', en: 'Next week is ready' },
  readyBody: {
    el: 'Ίδια δομή, με {n} αλλαγές από όσα μάθαμε.',
    en: 'Same structure, with {n} changes from what we learned.',
  },
  readyCost: { el: 'Εκτίμηση κόστους', en: 'Estimated cost' },
  adaptedFor: { el: 'Προσαρμόστηκε για {name}', en: 'Adapted for {name}' },
  seeWeek: { el: 'Δες την εβδομάδα', en: 'See the week' },
  alreadyNext: { el: 'Η νέα εβδομάδα έχει ήδη ξεκινήσει', en: 'The new week has already started' },
}

export const PREF_LABEL: Record<Preference, L10n> = {
  love: T.prefLove,
  eats: T.prefEats,
  refuses: T.prefRefuses,
}

export const RATING: Record<Rating, { emoji: string; label: L10n }> = {
  all: { emoji: '😋', label: { el: 'Όλο', en: 'All of it' } },
  some: { emoji: '😐', label: { el: 'Λίγο', en: 'A little' } },
  none: { emoji: '🙅', label: { el: 'Τίποτα', en: 'None' } },
}

export const REASONS: { id: FeedbackReason; emoji: string; label: L10n }[] = [
  { id: 'visible-veg', emoji: '🥦', label: { el: 'Φαίνονταν τα λαχανικά', en: 'Could see the veg' } },
  { id: 'taste', emoji: '👅', label: { el: 'Η γεύση', en: 'The taste' } },
  { id: 'texture', emoji: '🥄', label: { el: 'Η υφή', en: 'The texture' } },
  { id: 'new-food', emoji: '🆕', label: { el: 'Καινούργιο φαγητό', en: 'New food' } },
  { id: 'too-spicy', emoji: '🌶️', label: { el: 'Πολύ πικάντικο', en: 'Too spicy' } },
  { id: 'not-hungry', emoji: '😴', label: { el: 'Δεν πεινούσε', en: 'Wasn’t hungry' } },
]

export const LEFTOVERS: { id: 'none' | 'little' | 'lots'; label: L10n }[] = [
  { id: 'none', label: { el: 'Όχι', en: 'No' } },
  { id: 'little', label: { el: 'Λίγο', en: 'A little' } },
  { id: 'lots', label: { el: 'Αρκετό', en: 'Quite a lot' } },
]

/** Greek names with the article, for natural sentences ("τον Νίκο", "την Ελένη"). */
export const NAME_ACC: Record<MemberId, L10n> = {
  maria: { el: 'τη Μαρία', en: 'Maria' },
  giorgos: { el: 'τον Γιώργο', en: 'Giorgos' },
  nikos: { el: 'τον Νίκο', en: 'Nikos' },
  eleni: { el: 'την Ελένη', en: 'Eleni' },
}
export const NAME_NOM: Record<MemberId, L10n> = {
  maria: { el: 'η Μαρία', en: 'Maria' },
  giorgos: { el: 'ο Γιώργος', en: 'Giorgos' },
  nikos: { el: 'ο Νίκος', en: 'Nikos' },
  eleni: { el: 'η Ελένη', en: 'Eleni' },
}
/** "του Νίκου" / "της Ελένης" */
export const NAME_GEN: Record<MemberId, L10n> = {
  maria: { el: 'της Μαρίας', en: 'Maria’s' },
  giorgos: { el: 'του Γιώργου', en: 'Giorgos’' },
  nikos: { el: 'του Νίκου', en: 'Nikos’' },
  eleni: { el: 'της Ελένης', en: 'Eleni’s' },
}
