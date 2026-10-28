// Curated swap alternatives for every planned meal of the demo week:
// 3 for lunch/dinner, 2 for breakfast/snack. All respect Eleni's nut allergy, the fasting Wednesday
// and refused foods (no fish for Nikos, no mushrooms, no eggplant). scripts/check-data.ts verifies this.
import type { Alternative, Alternatives } from './types.ts'

const a = (recipeId: string, el: string, en: string): Alternative => ({ recipeId, reason: { el, en } })

export const alternatives: Alternatives = {
  // ---- Monday ----
  'mon-breakfast': [
    a('yogurt-honey-banana', 'Χωρίς τηγάνι, έτοιμο σε 5’', 'No frying pan, ready in 5’'),
    a('koulouri-milk', 'Για πρωινά που τρέχουμε· το κουλούρι τρώγεται και στον δρόμο', 'For rushed mornings: the koulouri travels well'),
  ],
  'mon-snack': [
    a('turkey-cheese-toast', 'Πιο χορταστικό, για τις μέρες με γυμναστική', 'More filling, for PE days'),
    a('carrot-muffins', 'Ψήνονται από την Κυριακή, με κρυμμένο καρότο', 'Baked on Sunday, with hidden carrot'),
  ],
  'mon-lunch': [
    a('chicken-avgolemono', 'Ζεστή κοτόσουπα για τις κρύες μέρες, έτοιμη σε 40’', 'Warm chicken soup for cold days, ready in 40’'),
    a('burgers-potatoes', 'Ίδιες πατάτες φούρνου, με τα μπιφτέκια που λατρεύει ο Νίκος', 'The same roast potatoes, with the burgers Nikos loves'),
    a('chicken-hilopites', 'Κοτόπουλο κοκκινιστό με μαλακά ζυμαρικά που τρώνε και οι δύο', 'Chicken in tomato sauce with soft pasta they both eat'),
  ],
  'mon-dinner': [
    a('spinach-pies', 'Το ίδιο σπανάκι, κρυμμένο σε τραγανό φύλλο', 'The same spinach, hidden in crisp filo'),
    a('zucchini-fritters', 'Λαχανικά «αόρατα» μέσα σε τραγανούς κεφτέδες', '“Invisible” veg in crispy fritters'),
    a('tomato-soup-orzo', 'Ελαφριά, ζεστή σούπα με το κριθαράκι της Ελένης', 'A light, warm soup with Eleni’s orzo'),
  ],
  // ---- Tuesday ----
  'tue-breakfast': [
    a('oat-pancakes', 'Ίδια μπανάνα, σε ζεστές τηγανίτες βρώμης', 'The same banana, in warm oat pancakes'),
    a('koulouri-milk', 'Το πιο γρήγορο πρωινό: 3 λεπτά', 'The fastest breakfast: 3 minutes'),
  ],
  'tue-snack': [
    a('koulouri-apple', 'Πιο ελαφρύ, έτοιμο σε 3’', 'Lighter, ready in 3’'),
    a('cheese-pie', 'Σπιτική τυρόπιτα, αγαπημένη και των δύο', 'Homemade cheese pie, a favourite of both'),
  ],
  'tue-lunch': [
    a('spaghetti-bolognese', 'Ίδιο κόστος, ο Νίκος λατρεύει κιμά', 'Same cost, Nikos loves minced meat'),
    a('chicken-avgolemono', 'Πιο ελαφρύ, έτοιμο σε 40’', 'Lighter, ready in 40’'),
    a('chicken-hilopites', 'Μικρά, μαλακά ζυμαρικά, σαν το κριθαράκι που αγαπά η Ελένη', 'Small, soft pasta, like the orzo Eleni loves'),
  ],
  'tue-dinner': [
    a('toast-salad', 'Έτοιμο σε 15’, χωρίς κατσαρολικά', 'Ready in 15’, no pots and pans'),
    a('buttered-pasta', 'Το πιο σίγουρο βραδινό για κουρασμένα παιδιά', 'The safest bet for tired kids'),
    a('chicken-wraps', 'Τορτίγιες με κοτόπουλο, τις τυλίγουν μόνα τους', 'Chicken wraps they roll themselves'),
  ],
  // ---- Wednesday: holiday + fasting ----
  'wed-breakfast': [
    a('honey-pancakes', 'Νηστίσιμες τηγανίτες για πρωινό αργίας', 'Fasting pancakes for a holiday morning'),
    a('koulouri-apple', 'Νηστίσιμο και έτοιμο σε 3’', 'Fasting-friendly and ready in 3’'),
  ],
  'wed-snack': [
    a('oat-honey-bar', 'Νηστίσιμη μπάρα, χωρίς ξηρούς καρπούς', 'A fasting bar, with no nuts'),
    a('breadsticks-grapes', 'Νηστίσιμο τσιμπολόγημα για τη βόλτα στην παρέλαση', 'A fasting nibble for the parade outing'),
  ],
  'wed-lunch': [
    a('fasolada', 'Η φασολάδα της γιαγιάς, νηστίσιμη και για δύο μέρες', 'Grandma’s bean soup, fasting-friendly and enough for two days'),
    a('orzo-tomato', 'Νηστίσιμο κριθαρότο που αγαπά η Ελένη', 'A fasting tomato orzo that Eleni loves'),
    a('chickpea-soup', 'Βελούδινη ρεβιθάδα με λεμόνι, πιο ήπια για τα παιδιά', 'Silky chickpea soup with lemon, milder for the kids'),
  ],
  'wed-dinner': [
    a('greens-pie', 'Νηστίσιμη πίτα, τα χόρτα κρυμμένα σε τραγανό φύλλο', 'A fasting pie, the greens hidden in crisp filo'),
    a('orzo-tomato', 'Νηστίσιμο και έτοιμο σε 30’', 'Fasting-friendly and ready in 30’'),
    a('tomato-soup-orzo', 'Ελαφριά νηστίσιμη σούπα για το βράδυ της αργίας', 'A light fasting soup for the holiday evening'),
  ],
  // ---- Thursday ----
  'thu-breakfast': [
    a('cheese-toast-juice', 'Ζεστό τοστ και χυμός για βιαστικό πρωινό', 'A warm toastie and juice for a rushed morning'),
    a('yogurt-honey-banana', 'Χωρίς μαγείρεμα, το αγαπημένο της Ελένης', 'No cooking, Eleni’s favourite'),
  ],
  'thu-snack': [
    a('carrot-muffins', 'Με κρυμμένο καρότο, φτιάχνονται από πριν', 'With hidden carrot, made ahead'),
    a('koulouri-apple', 'Το πιο απλό κολατσιό, χωρίς ψήσιμο', 'The simplest snack, no baking'),
  ],
  'thu-lunch': [
    a('burgers-potatoes', 'Ίδιος κιμάς, σε μπιφτέκια με πατάτες φούρνου', 'The same mince, as burgers with roast potatoes'),
    a('chicken-hilopites', 'Βγαίνει κι αυτό για δύο μέρες, με κοτόπουλο', 'Also stretches to two days, with chicken'),
    a('souvlaki-pita', 'Σουβλάκι στο σπίτι, η αγαπημένη «έξοδος» του Νίκου', 'Souvlaki at home, Nikos’ favourite “night out”'),
  ],
  'thu-dinner': [
    a('spinach-pies', 'Σπανακοπιτάκια: λαχανικά μέσα σε τραγανό φύλλο', 'Mini spinach pies: veg inside crisp filo'),
    a('chicken-wraps', 'Γρήγορες τορτίγιες, τις γεμίζουν μόνα τους', 'Quick wraps the kids fill themselves'),
    a('buttered-pasta', 'Σε 15’ στο τραπέζι, σίγουρη επιτυχία', 'On the table in 15’, a sure hit'),
  ],
  // ---- Friday ----
  'fri-breakfast': [
    a('boiled-eggs-toast', 'Περισσότερη πρωτεΐνη για το σχολείο', 'More protein for school'),
    a('koulouri-milk', 'Πιο γρήγορο: κουλούρι και ζεστό γάλα', 'Faster: koulouri and warm milk'),
  ],
  'fri-snack': [
    a('turkey-cheese-toast', 'Γρήγορο, αν δεν προλαβαίνεις να ψήσεις', 'Quick, if there’s no time to bake'),
    a('spinach-pies', 'Το ίδιο τραγανό φύλλο, με κρυμμένο σπανάκι', 'The same crisp pastry, with hidden spinach'),
  ],
  'fri-lunch': [
    a('chicken-hilopites', 'Ζυμαρικά με κοτόπουλο, ίδια χαρά για τον Νίκο', 'Pasta with chicken, just as happy for Nikos'),
    a('orzo-tomato', 'Πιο ελαφρύ και πιο οικονομικό, έτοιμο σε 30’', 'Lighter and cheaper, ready in 30’'),
    a('souvlaki-pita', 'Σουβλάκι στο σπίτι, για να ξεκινήσει το Σαββατοκύριακο', 'Souvlaki at home to kick off the weekend'),
  ],
  'fri-dinner': [
    a('buttered-pasta', 'Αν δεν περίσσεψαν κεφτεδάκια, έτοιμο σε 15’', 'If no meatballs are left, ready in 15’'),
    a('toast-salad', 'Γρήγορο βραδινό χωρίς μαγείρεμα', 'A quick dinner with no cooking'),
    a('tomato-soup-orzo', 'Ελαφριά σούπα σε 30’', 'A light soup in 30’'),
  ],
  // ---- Saturday ----
  'sat-breakfast': [
    a('oat-pancakes', 'Πιο χορταστικές, με μπανάνα και βρώμη', 'More filling, with banana and oats'),
    a('omelette-bread', 'Αλμυρό πρωινό με φρέσκο ψωμί', 'A savoury breakfast with fresh bread'),
  ],
  'sat-snack': [
    a('fruit-salad', 'Μόνο φρούτα, πιο δροσερό', 'Just fruit, fresher'),
    a('carrot-muffins', 'Μάφινς για το απόγευμα του Σαββάτου', 'Muffins for a Saturday afternoon'),
  ],
  'sat-lunch': [
    a('souvlaki-pita', 'Σουβλάκι στο σπίτι, φθηνότερο από το ντελίβερι', 'Souvlaki at home, cheaper than delivery'),
    a('lemon-chicken-potatoes', 'Ίδιες πατάτες φούρνου, με λεμονάτο κοτόπουλο', 'The same roast potatoes, with lemon chicken'),
    a('chicken-avgolemono', 'Κοτόσουπα για μια βροχερή μέρα', 'Chicken soup for a rainy day'),
  ],
  'sat-dinner': [
    a('chicken-wraps', 'Βραδινό που τρώγεται με τα χέρια, όπως η πίτσα', 'A hands-on dinner, just like pizza'),
    a('toast-salad', 'Πιο γρήγορο, σε 15’', 'Faster, in 15’'),
    a('buttered-pasta', 'Σίγουρη επιτυχία, χωρίς ζύμωμα', 'A sure hit, no kneading'),
  ],
  // ---- Sunday ----
  'sun-breakfast': [
    a('honey-pancakes', 'Γλυκό κυριακάτικο πρωινό με μέλι', 'A sweet Sunday breakfast with honey'),
    a('boiled-eggs-toast', 'Ίδια αυγά, πιο απλά', 'The same eggs, kept simple'),
  ],
  'sun-snack': [
    a('fruit-salad', 'Με όλα τα φρούτα της εποχής', 'With all the fruit in season'),
    a('fruit-yogurt', 'Γιαούρτι με φρούτα, πιο χορταστικό', 'Yogurt with fruit, more filling'),
  ],
  'sun-lunch': [
    a('lemon-chicken-potatoes', 'Το κλασικό κυριακάτικο ταψί, σε λιγότερη ώρα', 'The classic Sunday roast, in less time'),
    a('souvlaki-pita', 'Κυριακή με σουβλάκια στο σπίτι', 'A Sunday souvlaki feast at home'),
    a('baked-giant-beans', 'Γίγαντες φούρνου με φρέσκο ψωμί, πιο οικονομικό', 'Baked giant beans with fresh bread, easier on the budget'),
  ],
  'sun-dinner': [
    a('horiatiki-salad', 'Δροσερή χωριάτικη με ψωμί, μετά το κυριακάτικο τραπέζι', 'A fresh village salad with bread after the Sunday meal'),
    a('chicken-wraps', 'Γρήγορες τορτίγιες για το βράδυ της Κυριακής', 'Quick wraps for Sunday evening'),
    a('buttered-pasta', 'Το πιο εύκολο βραδινό πριν από τη Δευτέρα', 'The easiest dinner before Monday'),
  ],
}
