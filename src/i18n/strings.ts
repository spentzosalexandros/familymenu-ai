import type { L10n } from '../data/types'

/** Core shell strings (tabs, system chrome, generic actions). Features keep their own strings.ts. */
export const S = {
  appName: { el: 'FamilyMenu AI', en: 'FamilyMenu AI' },
  tabs: {
    today: { el: 'Σήμερα', en: 'Today' },
    week: { el: 'Εβδομάδα', en: 'Week' },
    shop: { el: 'Ψώνια', en: 'Shopping' },
    family: { el: 'Οικογένεια', en: 'Family' },
  },
  back: { el: 'Πίσω', en: 'Back' },
  close: { el: 'Κλείσιμο', en: 'Close' },
  done: { el: 'Τέλος', en: 'Done' },
  cancel: { el: 'Άκυρο', en: 'Cancel' },
  ok: { el: 'OK', en: 'OK' },
  undo: { el: 'Αναίρεση', en: 'Undo' },
  save: { el: 'Αποθήκευση', en: 'Save' },
  continue: { el: 'Συνέχεια', en: 'Continue' },
  skip: { el: 'Παράλειψη', en: 'Skip' },
  retry: { el: 'Δοκίμασε ξανά', en: 'Try again' },
  now: { el: 'τώρα', en: 'now' },
  profile: { el: 'Προφίλ και ρυθμίσεις', en: 'Profile & settings' },
  indicativePrices: { el: 'Ενδεικτικές τιμές', en: 'Indicative prices' },
  safeFor: { el: 'Ασφαλές για {names}', en: 'Safe for {names}' },
  notification: { el: 'Ειδοποίηση', en: 'Notification' },
  routeError: {
    title: { el: 'Κάτι δεν πήγε καλά εδώ', en: 'Something went wrong here' },
    body: {
      el: 'Αυτή η οθόνη δεν φορτώθηκε. Οι υπόλοιπες λειτουργούν κανονικά.',
      en: 'This screen didn’t load. Everything else still works.',
    },
  },
  placeholder: {
    badge: { el: 'Σε κατασκευή', en: 'In progress' },
    body: {
      el: 'Η οθόνη ετοιμάζεται από την ομάδα της. Η πλοήγηση και τα δεδομένα λειτουργούν ήδη.',
      en: 'This screen is being built. Navigation and data already work.',
    },
  },
  feedbackNotif: {
    title: { el: 'Πώς πήγε το γιουβέτσι;', en: 'How was the giouvetsi?' },
    body: { el: 'Πες μας με ένα άγγιγμα 😋', en: 'Tell us with one tap 😋' },
    genericTitle: { el: 'Πώς πήγε το φαγητό;', en: 'How was the meal?' },
  },
} satisfies Record<string, unknown>

export type CoreString = L10n
