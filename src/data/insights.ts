// What "the AI has learned" by Tuesday morning (newest first). No plan-dependent numbers in the copy:
// screens compute € and counts through the selectors.
import type { Insight } from './types.ts'

export const initialInsights: Insight[] = [
  {
    id: 'ins-holiday-shopping',
    kind: 'tip',
    icon: '🛒',
    text: {
      el: 'Αύριο είναι αργία και τα σούπερ μάρκετ θα είναι κλειστά. Ψώνισε σήμερα για την Τετάρτη.',
      en: 'Tomorrow is a public holiday and supermarkets will be closed. Shop today for Wednesday.',
    },
    when: { el: 'Σήμερα', en: 'Today' },
  },
  {
    id: 'ins-nikos-lemon-chicken',
    memberId: 'nikos',
    kind: 'learned',
    icon: '⭐',
    text: {
      el: 'Ο Νίκος έφαγε όλο το λεμονάτο κοτόπουλο. Το κρατάμε στα σίγουρα της εβδομάδας.',
      en: 'Nikos finished all of the lemon chicken. It stays on our list of sure hits.',
    },
    when: { el: 'Χθες', en: 'Yesterday' },
  },
  {
    id: 'ins-eleni-crispy-potatoes',
    memberId: 'eleni',
    kind: 'learned',
    icon: '🥔',
    text: {
      el: 'Η Ελένη τρώει πρώτα τις τραγανές πατάτες από τη γωνία του ταψιού. Θα το θυμόμαστε στις συνταγές.',
      en: 'Eleni goes for the crispy corner potatoes first. We’ll remember that in the recipes.',
    },
    when: { el: 'Χθες', en: 'Yesterday' },
  },
  {
    id: 'ins-batch-thursday',
    kind: 'waste',
    icon: '♻️',
    text: {
      el: 'Τα κεφτεδάκια της Πέμπτης μαγειρεύονται διπλά: η Παρασκευή βγαίνει χωρίς μαγείρεμα και χωρίς ψώνια.',
      en: 'Thursday’s meatballs are a double batch: Friday dinner needs no cooking and no shopping.',
    },
    when: { el: 'Αυτή την εβδομάδα', en: 'This week' },
  },
  {
    id: 'ins-nuts-safe',
    memberId: 'eleni',
    kind: 'tip',
    icon: '🛡️',
    text: {
      el: 'Κανένα πιάτο της εβδομάδας δεν έχει ξηρούς καρπούς. Ελέγχουμε κάθε υλικό, ακόμα και στα σνακ για το σχολείο.',
      en: 'No dish this week contains nuts. We check every ingredient, even in the school snacks.',
    },
    when: { el: 'Αυτή την εβδομάδα', en: 'This week' },
  },
]
