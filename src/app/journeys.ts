import type { L10n } from '../data/types'
import { getState, makeModal, makeSheet } from '../store'
import { notifyFeedback } from './nav'

export type Journey = { id: string; emoji: string; title: L10n; description: L10n; run: () => void }

const recipeOf = (mealId: string, fallback: string) => getState().plan.find((m) => m.id === mealId)?.recipeId ?? fallback

/** Puts the app in a clean, "today" state before a journey (keeps settings + the plan as is). */
function prepare(opts: { day?: 'tue' | 'sun'; time?: string } = {}) {
  const s = getState()
  if (!s.onboarding.done) s.completeOnboarding()
  s.hideBanner()
  s.hideAlert()
  s.dismissAll()
  if (opts.day || opts.time) s.setClock({ day: opts.day, time: opts.time })
}

/** The six demo journeys of the presenter panel. */
export const JOURNEYS: Journey[] = [
  {
    id: 'onboarding',
    emoji: '👋',
    title: { el: 'Πρώτη γνωριμία', en: 'First run' },
    description: {
      el: 'Από το καλωσόρισμα στο έτοιμο πλάνο και τη δωρεάν δοκιμή.',
      en: 'From welcome to a ready plan and the free trial.',
    },
    run: () => {
      getState().restartOnboarding('welcome')
    },
  },
  {
    id: 'today',
    emoji: '🍲',
    title: { el: 'Τι τρώμε σήμερα', en: 'What’s for today' },
    description: {
      el: 'Το σημερινό μενού, η συνταγή του γιουβετσιού και το μαγείρεμα βήμα βήμα.',
      en: 'Today’s menu, the giouvetsi recipe and step-by-step cooking.',
    },
    run: () => {
      prepare({ day: 'tue', time: '11:20' })
      getState().navigate({ tab: 'today', screen: 'recipe', params: { id: recipeOf('tue-lunch', 'chicken-giouvetsi'), mealId: 'tue-lunch' } })
    },
  },
  {
    id: 'swap',
    emoji: '🔄',
    title: { el: 'Αλλαγή γεύματος', en: 'Swap a meal' },
    description: {
      el: 'Τρεις ασφαλείς εναλλακτικές με κόστος και αναίρεση με ένα άγγιγμα.',
      en: 'Three safe alternatives with cost and one-tap undo.',
    },
    run: () => {
      prepare({ day: 'tue', time: '9:41' })
      getState().navigate({ tab: 'week', sheet: 'swap', sheetParams: { mealId: 'tue-lunch' } })
    },
  },
  {
    id: 'shop',
    emoji: '🧺',
    title: { el: 'Έξυπνα ψώνια', en: 'Smart shopping' },
    description: {
      el: 'Λίστα ανά διάδρομο και σύγκριση τιμών σε 4 σούπερ μάρκετ.',
      en: 'A list by aisle and price comparison across 4 supermarkets.',
    },
    run: () => {
      prepare({ day: 'tue', time: '18:05' })
      getState().navigate({ tab: 'shop', sheet: 'compare' })
    },
  },
  {
    id: 'learn',
    emoji: '✨',
    title: { el: 'Το AI μαθαίνει', en: 'The AI learns' },
    description: {
      el: 'Η Ελένη δεν έφαγε το σπανακόρυζο — το πλάνο προσαρμόζεται μόνο του.',
      en: 'Eleni skipped the spinach rice — the plan adapts by itself.',
    },
    run: () => {
      prepare({ day: 'tue', time: '9:41' })
      getState().navigate({ tab: 'today', sheet: 'feedback', sheetParams: { mealId: 'mon-dinner' } })
    },
  },
  {
    id: 'recap',
    emoji: '🏆',
    title: { el: 'Κυριακάτικη ανασκόπηση', en: 'Sunday recap' },
    description: {
      el: 'Χρόνος, χρήματα και σπατάλη που γλιτώσατε — και η επόμενη εβδομάδα.',
      en: 'Time, money and waste saved — and next week’s plan.',
    },
    run: () => skipToSunday(),
  },
]

/** Presenter: the 16:30 push "Πώς πήγε το γιουβέτσι;" → feedback for tue-lunch. */
export function sendFeedbackNotification() {
  const s = getState()
  if (!s.onboarding.done) s.completeOnboarding()
  s.dismissAll()
  s.setClock({ day: 'tue', time: '16:30' })
  s.setTab('today')
  window.setTimeout(() => notifyFeedback('tue-lunch'), 250)
}

/** Presenter: jump to Sunday evening and open the recap. */
export function skipToSunday() {
  prepare({ day: 'sun', time: '19:30' })
  const s = getState()
  s.navigate({ tab: 'today' })
  window.setTimeout(() => s.present(makeModal('recap')), 200)
}

export function resetDemo() {
  const s = getState()
  s.hideBanner()
  s.hideAlert()
  s.resetDemo()
}

export function openPresenterSheet() {
  getState().present(makeSheet('presenter'))
}
