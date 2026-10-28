// The weekly plans. initialPlan is exactly the table in BUILD-SPEC §1.
import type { DayId, MealSlot, PlannedMeal } from './types.ts'

type Row = [slot: MealSlot, recipeId: string, el: string, en: string, extra?: Partial<PlannedMeal>]

const day = (d: DayId, rows: Row[]): PlannedMeal[] =>
  rows.map(([slot, recipeId, el, en, extra]) => ({ id: `${d}-${slot}`, day: d, slot, recipeId, reason: { el, en }, ...extra }))

export const initialPlan: PlannedMeal[] = [
  ...day('mon', [
    ['breakfast', 'oat-pancakes', 'Γλυκό ξεκίνημα της εβδομάδας, με τη μπανάνα που λατρεύει η Ελένη', 'A sweet start to the week, with the banana Eleni loves'],
    ['snack', 'koulouri-apple', 'Κλασικό σχολικό κολατσιό, έτοιμο σε 3 λεπτά', 'A classic school snack, ready in 3 minutes'],
    ['lunch', 'lemon-chicken-potatoes', 'Αγαπημένο του Νίκου, με τις πατάτες που ζητάει η Ελένη', 'Nikos’ favourite, with the potatoes Eleni asks for'],
    ['dinner', 'spinach-rice', 'Το σπανάκι είναι στην εποχή του· ελαφρύ βραδινό με φέτα', 'Spinach is in season: a light dinner with feta'],
  ]),
  ...day('tue', [
    ['breakfast', 'yogurt-honey-banana', 'Το αγαπημένο πρωινό της Ελένης, έτοιμο σε 5 λεπτά', 'Eleni’s favourite breakfast, ready in 5 minutes'],
    ['snack', 'turkey-cheese-toast', 'Χορταστικό τοστ για το διάλειμμα· ο Νίκος έχει γυμναστική σήμερα', 'A filling toastie for break time: Nikos has PE today'],
    ['lunch', 'chicken-giouvetsi', 'Κριθαράκι για την Ελένη, κοτόπουλο για τον Νίκο: ένα ταψί, όλοι χαρούμενοι', 'Orzo for Eleni, chicken for Nikos: one dish, everyone happy'],
    ['dinner', 'potato-omelette', 'Γρήγορο βραδινό σε 25’, με πατάτες και αυγά που τρώνε και οι δύο', 'A quick 25’ dinner, with potatoes and eggs they both eat'],
  ]),
  ...day('wed', [
    ['breakfast', 'tahini-honey-bread', 'Νηστίσιμο πρωινό με ταχίνι και μέλι, γλυκό σαν κρέμα', 'A fasting breakfast with tahini and honey, sweet like a spread'],
    ['snack', 'fruit-salad', 'Αργία σήμερα: φρουτοσαλάτα με φρούτα της εποχής', 'Holiday today: a fruit salad with seasonal fruit'],
    ['lunch', 'lentil-soup', 'Νηστίσιμη Τετάρτη: φακές, το όσπριο της εβδομάδας, με λίγα υλικά', 'Fasting Wednesday: lentils, this week’s legumes, from a few ingredients'],
    ['dinner', 'chickpea-fritters', 'Νηστίσιμοι κεφτέδες που θυμίζουν τα αγαπημένα κεφτεδάκια του Νίκου', 'Fasting fritters that look just like Nikos’ beloved meatballs'],
  ]),
  ...day('thu', [
    ['breakfast', 'boiled-eggs-toast', 'Πρωτεΐνη για να κρατήσουν μέχρι το διάλειμμα', 'Protein to keep them going until break time'],
    ['snack', 'oat-honey-bar', 'Σπιτική μπάρα χωρίς ξηρούς καρπούς, ασφαλής για την Ελένη', 'A homemade bar with no nuts, safe for Eleni'],
    ['lunch', 'meatballs-pilaf', 'Μαγειρεύεις μία φορά, τρώτε δύο: τα μισά κεφτεδάκια είναι για την Παρασκευή', 'Cook once, eat twice: half the meatballs are for Friday', { batch: 2 }],
    ['dinner', 'zucchini-fritters', 'Κολοκυθάκι κρυμμένο σε τραγανούς κεφτέδες: δοκιμή για την Ελένη', 'Courgette hidden in crispy fritters: a little test for Eleni'],
  ]),
  ...day('fri', [
    ['breakfast', 'cheese-toast-juice', 'Φρέσκος χυμός από τα πρώτα πορτοκάλια της χρονιάς', 'Fresh juice from the first oranges of the season'],
    ['snack', 'cheese-pie', 'Σπιτική τυρόπιτα, το κολατσιό που δεν γυρίζει ποτέ πίσω', 'Homemade cheese pie, the snack that never comes back home'],
    ['lunch', 'spaghetti-bolognese', 'Παρασκευή, μακαρονάδα! Ο Νίκος την περιμένει όλη την εβδομάδα', 'Friday means spaghetti! Nikos waits for it all week'],
    ['dinner', 'meatballs-pilaf', 'Από το διπλό μαγείρεμα της Πέμπτης: βραδινό έτοιμο σε 5’', 'From Thursday’s double batch: dinner ready in 5’', { leftoverOf: 'thu-lunch' }],
  ]),
  ...day('sat', [
    ['breakfast', 'honey-pancakes', 'Σαββατιάτικο πρωινό χωρίς βιασύνη', 'A slow Saturday breakfast'],
    ['snack', 'fruit-yogurt', 'Ελαφρύ δεκατιανό με γιαούρτι, το αγαπημένο της Ελένης', 'A light morning snack with yogurt, Eleni’s favourite'],
    ['lunch', 'burgers-potatoes', 'Μπιφτέκια με κρυμμένο κολοκυθάκι και πατάτες φούρνου: σίγουρη επιτυχία', 'Burgers with hidden courgette and roast potatoes: a sure hit'],
    ['dinner', 'homemade-pizza', 'Πίτσα με τα παιδιά: ο Νίκος απλώνει τη σάλτσα, η Ελένη το τυρί', 'Pizza with the kids: Nikos spreads the sauce, Eleni adds the cheese'],
  ]),
  ...day('sun', [
    ['breakfast', 'omelette-bread', 'Κυριακάτικη ομελέτα με φρέσκο ψωμί από τον φούρνο', 'A Sunday omelette with fresh bread from the bakery'],
    ['snack', 'breadsticks-grapes', 'Τα τελευταία σταφύλια της χρονιάς, με κριτσίνια', 'The last grapes of the season, with breadsticks'],
    ['lunch', 'pastitsio', 'Κυριακάτικο τραπέζι: παστίτσιο, και ό,τι περισσέψει παγώνει για μια βιαστική μέρα', 'Sunday table: pastitsio, and any leftovers freeze for a busy day'],
    ['dinner', 'tomato-soup-orzo', 'Ελαφριά σούπα μετά το κυριακάτικο τραπέζι, με το κριθαράκι της Ελένης', 'A light soup after the Sunday feast, with Eleni’s orzo'],
  ]),
]

/** Next week (2–8 Nov) before feedback adaptations; nextWeekPlan() applies those on top. */
export const nextWeekBase: PlannedMeal[] = [
  ...day('mon', [
    ['breakfast', 'koulouri-milk', 'Δευτέρα πρωί, χωρίς μαγείρεμα: κουλούρι και ζεστό γάλα', 'Monday morning, no cooking: koulouri and warm milk'],
    ['snack', 'koulouri-apple', 'Κλασικό σχολικό κολατσιό, έτοιμο σε 3 λεπτά', 'A classic school snack, ready in 3 minutes'],
    ['lunch', 'chicken-avgolemono', 'Ζεστή κοτόσουπα για τις πρώτες κρύες μέρες του Νοέμβρη', 'Warm chicken soup for the first cold days of November'],
    ['dinner', 'buttered-pasta', 'Γρήγορο βραδινό για την πρώτη μέρα της εβδομάδας', 'A quick dinner for the first day of the week'],
  ]),
  ...day('tue', [
    ['breakfast', 'yogurt-honey-banana', 'Το αγαπημένο πρωινό της Ελένης, έτοιμο σε 5 λεπτά', 'Eleni’s favourite breakfast, ready in 5 minutes'],
    ['snack', 'turkey-cheese-toast', 'Χορταστικό τοστ για τη μέρα της γυμναστικής', 'A filling toastie for PE day'],
    ['lunch', 'burgers-potatoes', 'Μπιφτέκια με κρυμμένο κολοκυθάκι: την περασμένη εβδομάδα τα έφαγαν όλα', 'Burgers with hidden courgette: last week every bite went'],
    ['dinner', 'potato-omelette', 'Γρήγορο βραδινό με πατάτες και αυγά', 'A quick dinner with potatoes and eggs'],
  ]),
  ...day('wed', [
    ['breakfast', 'tahini-honey-bread', 'Νηστίσιμο πρωινό με ταχίνι και μέλι', 'A fasting breakfast with tahini and honey'],
    ['snack', 'oat-honey-bar', 'Νηστίσιμη μπάρα χωρίς ξηρούς καρπούς, για το σχολείο', 'A fasting, nut-free bar for school'],
    ['lunch', 'fasolada', 'Νηστίσιμη Τετάρτη: φασολάδα, το όσπριο της εβδομάδας', 'Fasting Wednesday: bean soup, this week’s legumes'],
    ['dinner', 'chickpea-fritters', 'Νηστίσιμοι ρεβιθοκεφτέδες με σάλτσα για βούτηγμα', 'Fasting chickpea fritters with a dipping sauce'],
  ]),
  ...day('thu', [
    ['breakfast', 'boiled-eggs-toast', 'Πρωτεΐνη για να κρατήσουν μέχρι το διάλειμμα', 'Protein to keep them going until break time'],
    ['snack', 'carrot-muffins', 'Μάφινς με κρυμμένο καρότο, ψημένα από την Κυριακή', 'Muffins with hidden carrot, baked on Sunday'],
    ['lunch', 'chicken-hilopites', 'Μαγειρεύεις μία φορά, τρώτε δύο: η μισή κατσαρόλα είναι για την Παρασκευή', 'Cook once, eat twice: half the pot is for Friday', { batch: 2 }],
    ['dinner', 'horiatiki-salad', 'Ελαφρύ βραδινό με ψωμί για βούτηγμα', 'A light dinner with bread for dipping'],
  ]),
  ...day('fri', [
    ['breakfast', 'cheese-toast-juice', 'Ζεστό τοστ και φρέσκος χυμός πορτοκάλι', 'A warm toastie and fresh orange juice'],
    ['snack', 'cheese-pie', 'Σπιτική τυρόπιτα για το διάλειμμα', 'Homemade cheese pie for break time'],
    ['lunch', 'spaghetti-bolognese', 'Παρασκευή, μακαρονάδα! Η παράδοση συνεχίζεται', 'Friday means spaghetti! The tradition continues'],
    ['dinner', 'chicken-hilopites', 'Από το διπλό μαγείρεμα της Πέμπτης: βραδινό έτοιμο σε 5’', 'From Thursday’s double batch: dinner ready in 5’', { leftoverOf: 'thu-lunch' }],
  ]),
  ...day('sat', [
    ['breakfast', 'oat-pancakes', 'Τηγανίτες βρώμης για αργό πρωινό Σαββάτου', 'Oat pancakes for a slow Saturday morning'],
    ['snack', 'fruit-yogurt', 'Γιαούρτι με φρούτα, το αγαπημένο της Ελένης', 'Yogurt with fruit, Eleni’s favourite'],
    ['lunch', 'meatballs-pilaf', 'Ξανά κεφτεδάκια: την περασμένη εβδομάδα δεν έμεινε ούτε ένα', 'Meatballs again: last week not a single one was left'],
    ['dinner', 'homemade-pizza', 'Η πίτσα του Σαββάτου έγινε πια οικογενειακή παράδοση', 'Saturday pizza is now a family tradition'],
  ]),
  ...day('sun', [
    ['breakfast', 'honey-pancakes', 'Γλυκό κυριακάτικο πρωινό με μέλι', 'A sweet Sunday breakfast with honey'],
    ['snack', 'breadsticks-grapes', 'Κριτσίνια και σταφύλι για το απόγευμα', 'Breadsticks and grapes for the afternoon'],
    ['lunch', 'lemon-chicken-potatoes', 'Το κλασικό κυριακάτικο ταψί', 'The classic Sunday roast'],
    ['dinner', 'orzo-tomato', 'Ελαφρύ κριθαρότο μετά το κυριακάτικο τραπέζι', 'A light tomato orzo after the Sunday meal'],
  ]),
]
