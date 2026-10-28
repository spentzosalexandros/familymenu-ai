// Onboarding strings (EL first, EN second). Numbers are passed in as {vars}, never hardcoded.
export const T = {
  // ---------- welcome ----------
  welcome: {
    headline1: { el: 'Τι θα φάμε σήμερα;', en: 'What’s for dinner tonight?' },
    headline2: { el: 'Το λύσαμε.', en: 'Sorted.' },
    lede: {
      el: 'Το εβδομαδιαίο μενού της οικογένειας, φτιαγμένο από AI που μαθαίνει τι αγαπούν τα παιδιά σας.',
      en: 'Your family’s weekly menu, planned by an AI that learns what your kids love.',
    },
    benefitTime: { el: 'Όλη η εβδομάδα σε ένα λεπτό', en: 'The whole week in a minute' },
    benefitTimeSub: { el: 'Τέλος η καθημερινή απορία «τι θα μαγειρέψω;»', en: 'No more daily “what do I cook?”' },
    benefitMoney: { el: 'Ψώνια μέσα στον προϋπολογισμό', en: 'Shopping within budget' },
    benefitMoneySub: { el: 'Συγκρίνουμε τιμές στα σούπερ μάρκετ της γειτονιάς', en: 'We compare prices at your local supermarkets' },
    benefitWaste: { el: 'Λιγότερη σπατάλη', en: 'Less food waste' },
    benefitWasteSub: { el: 'Τα περισσεύματα γίνονται το επόμενο γεύμα', en: 'Leftovers become the next meal' },
    cta: { el: 'Ξεκινάμε', en: 'Get started' },
    signIn: { el: 'Έχω ήδη λογαριασμό', en: 'I already have an account' },
    welcomeBack: { el: 'Καλώς ήρθατε ξανά!', en: 'Welcome back!' },
  },

  // ---------- header ----------
  stepOf: { el: 'Βήμα {n} από {total}', en: 'Step {n} of {total}' },

  // ---------- members ----------
  members: {
    title: { el: 'Ποιοι τρώμε μαζί;', en: 'Who’s at the table?' },
    sub: { el: 'Προσαρμόζουμε μερίδες και γεύσεις σε κάθε μέλος.', en: 'We tailor portions and flavours to everyone.' },
    adults: { el: 'Ενήλικες', en: 'Adults' },
    children: { el: 'Παιδιά', en: 'Children' },
    kidsHeader: { el: 'Τα παιδιά', en: 'The kids' },
    kidsFooter: { el: 'Πάτα το avatar για να το αλλάξεις.', en: 'Tap an avatar to change it.' },
    namePh: { el: 'Όνομα', en: 'Name' },
    childN: { el: 'Παιδί {n}', en: 'Child {n}' },
    adultN: { el: 'Ενήλικας {n}', en: 'Adult {n}' },
    age: { el: 'Ηλικία', en: 'Age' },
    years: { el: { one: '{n} έτους', other: '{n} ετών' }, en: { one: '{n} year', other: '{n} years' } },
    noKids: { el: 'Χωρίς παιδιά; Κανένα πρόβλημα, σχεδιάζουμε για τους ενήλικες.', en: 'No kids? No problem, we’ll plan for the adults.' },
  },

  // ---------- kids-taste ----------
  kidsTaste: {
    title: { el: 'Τι τρώνε τα παιδιά;', en: 'What do the kids eat?' },
    sub: { el: 'Πάτα ένα φαγητό για να αλλάξεις: Λατρεύει → Τρώει → Όχι.', en: 'Tap a food to change it: Loves → Eats → No.' },
    noKids: { el: 'Δεν έχετε προσθέσει παιδιά. Μπορείτε να συνεχίσετε.', en: 'You haven’t added any kids. You can continue.' },
    hint: { el: 'Το AI θα μαθαίνει κι από τη γνώμη τους μετά από κάθε γεύμα.', en: 'The AI keeps learning from their feedback after every meal.' },
  },

  // ---------- family-taste ----------
  familyTaste: {
    title: { el: 'Τι αγαπάει η οικογένεια;', en: 'What does the family like?' },
    sub: { el: 'Διάλεξε κουζίνες που σας αρέσουν και υλικά που δεν τρώτε.', en: 'Pick the cuisines you like and the ingredients you avoid.' },
    likes: { el: 'Μας αρέσουν', en: 'We like' },
    dislikes: { el: 'Δεν τρώμε', en: 'We don’t eat' },
  },

  // ---------- allergies ----------
  allergies: {
    title: { el: 'Αλλεργίες και διατροφή', en: 'Allergies & diet' },
    sub: { el: 'Σημείωσε αλλεργίες για κάθε μέλος της οικογένειας.', en: 'Mark any allergies for each family member.' },
    promise: { el: 'Δεν θα προτείνουμε ποτέ πιάτο με αλλεργιογόνο.', en: 'We will never suggest a dish with an allergen.' },
    promiseSub: { el: 'Ελέγχουμε κάθε υλικό κάθε συνταγής.', en: 'We check every ingredient of every recipe.' },
    none: { el: 'Καμία αλλεργία', en: 'No allergies' },
    diets: { el: 'Διατροφή', en: 'Diet' },
    dietsFooter: { el: 'Τις μέρες νηστείας όλα τα γεύματα είναι νηστίσιμα.', en: 'On fasting days every meal is fasting-friendly.' },
  },

  // ---------- meals ----------
  meals: {
    title: { el: 'Ποια γεύματα σχεδιάζουμε;', en: 'Which meals should we plan?' },
    sub: { el: 'Το μεσημεριανό είναι το κυρίως, το βραδινό πιο ελαφρύ.', en: 'Lunch is the main cooked meal, dinner is lighter.' },
    slots: { el: 'Γεύματα', en: 'Meals' },
    lastSlot: { el: 'Χρειάζεται τουλάχιστον ένα γεύμα', en: 'Keep at least one meal' },
    time: { el: 'Χρόνος μαγειρέματος τις καθημερινές', en: 'Weekday cooking time' },
    noLimit: { el: 'Χωρίς όριο', en: 'No limit' },
    upTo: { el: 'έως {m}', en: 'up to {m}' },
    batch: { el: 'Μαγειρεύω για 2 μέρες', en: 'Cook once, eat twice' },
    batchSub: { el: 'Μία φορά μαγείρεμα, δύο γεύματα', en: 'One cooking session, two meals' },
    timeFooter: { el: 'Τα Σαββατοκύριακα αφήνουμε χρόνο για πιο αργές συνταγές.', en: 'Weekends leave room for slower recipes.' },
  },

  // ---------- budget ----------
  budget: {
    title: { el: 'Πόσα θέλετε να ξοδεύετε;', en: 'What’s your weekly budget?' },
    sub: { el: 'Για όλα τα γεύματα της εβδομάδας, για όλη την οικογένεια.', en: 'For every meal of the week, for the whole family.' },
    perWeek: { el: 'την εβδομάδα', en: 'per week' },
    aria: { el: 'Εβδομαδιαίος προϋπολογισμός', en: 'Weekly budget' },
    benchmark: {
      el: 'Οικογένειες 4 ατόμων στην περιοχή σου ξοδεύουν ~{v}/εβδομάδα',
      en: 'Families of 4 in your area spend ~{v} a week',
    },
    benchmarkSub: { el: 'Ενδεικτικός μέσος όρος για το Χαλάνδρι', en: 'Indicative average for Chalandri' },
    changeLater: { el: 'Μπορείς να το αλλάξεις όποτε θέλεις από το προφίλ.', en: 'You can change it any time in your profile.' },
  },

  // ---------- location ----------
  location: {
    title: { el: 'Πού ψωνίζετε;', en: 'Where do you shop?' },
    sub: { el: 'Βρίσκουμε τα κοντινά σούπερ μάρκετ για να συγκρίνουμε τιμές.', en: 'We find the supermarkets near you to compare prices.' },
    useLocation: { el: 'Χρήση τοποθεσίας', en: 'Use my location' },
    postcode: { el: 'Θα βάλω ταχυδρομικό κώδικα', en: 'I’ll enter a postcode' },
    alertTitle: {
      el: 'Να επιτρέπεται στο «FamilyMenu AI» να χρησιμοποιεί την τοποθεσία σας;',
      en: 'Allow “FamilyMenu AI” to use your location?',
    },
    alertBody: {
      el: 'Τη χρησιμοποιούμε μόνο για να βρούμε σούπερ μάρκετ κοντά σας και να συγκρίνουμε τιμές.',
      en: 'We only use it to find supermarkets near you and compare prices.',
    },
    allowOnce: { el: 'Να επιτρέπεται μία φορά', en: 'Allow Once' },
    allowWhile: { el: 'Κατά τη χρήση της εφαρμογής', en: 'Allow While Using App' },
    deny: { el: 'Να μην επιτρέπεται', en: 'Don’t Allow' },
    near: { el: 'Κοντά σας', en: 'Near you' },
    byPostcode: { el: 'ΤΚ {pc}', en: 'Postcode {pc}' },
    storesHeader: { el: 'Σούπερ μάρκετ κοντά σας', en: 'Supermarkets near you' },
    storesFooter: {
      el: 'Διάλεξε όσα σας βολεύουν. Θα συγκρίνουμε τις τιμές τους κάθε εβδομάδα.',
      en: 'Pick the ones that suit you. We’ll compare their prices every week.',
    },
    privacy: { el: 'Η τοποθεσία μένει στη συσκευή σας.', en: 'Your location stays on your device.' },
    cta: { el: 'Φτιάξε το πλάνο μας', en: 'Build our plan' },
    selected: { el: { one: '{n} επιλεγμένο', other: '{n} επιλεγμένα' }, en: { one: '{n} selected', other: '{n} selected' } },
  },

  // ---------- generating ----------
  generating: {
    title: { el: 'Φτιάχνουμε το πλάνο σας…', en: 'Building your plan…' },
    done: { el: 'Έτοιμο!', en: 'Done!' },
    tasteKids: { el: 'Αναλύουμε τα γούστα του Νίκου και της Ελένης', en: 'Analysing what Nikos and Eleni like' },
    tasteGeneric: { el: 'Αναλύουμε τα γούστα της οικογένειας', en: 'Analysing your family’s tastes' },
    nuts: { el: 'Αποκλείουμε τους ξηρούς καρπούς', en: 'Excluding tree nuts' },
    allergens: { el: 'Αποκλείουμε κάθε αλλεργιογόνο', en: 'Excluding every allergen' },
    prices: {
      el: { one: 'Συγκρίνουμε τιμές σε {n} σούπερ μάρκετ', other: 'Συγκρίνουμε τιμές σε {n} σούπερ μάρκετ' },
      en: { one: 'Comparing prices at {n} supermarket', other: 'Comparing prices at {n} supermarkets' },
    },
    budget: { el: 'Ταιριάζουμε στα {v}/εβδομάδα', en: 'Fitting it into {v} a week' },
    tap: { el: 'Πάτα για συνέχεια', en: 'Tap to continue' },
  },

  // ---------- ready ----------
  ready: {
    title: { el: 'Το πλάνο σας είναι έτοιμο', en: 'Your plan is ready' },
    sub: { el: 'Μια ολόκληρη εβδομάδα, στα μέτρα της οικογένειάς σας.', en: 'A whole week, made to fit your family.' },
    meals: { el: { one: '{n} γεύμα', other: '{n} γεύματα' }, en: { one: '{n} meal', other: '{n} meals' } },
    mealsSub: { el: 'για 7 μέρες', en: 'over 7 days' },
    allergens: { el: '{n} αλλεργιογόνα', en: '{n} allergens' },
    allergensSub: { el: 'σε κανένα πιάτο', en: 'in any dish' },
    leftovers: {
      el: { one: '{n} γεύμα από περισσεύματα', other: '{n} γεύματα από περισσεύματα' },
      en: { one: '{n} meal from leftovers', other: '{n} meals from leftovers' },
    },
    reused: {
      el: { one: '{n} υλικό σε 2+ πιάτα', other: '{n} υλικά σε 2+ πιάτα' },
      en: { one: '{n} ingredient used twice+', other: '{n} ingredients used twice+' },
    },
    costTitle: { el: 'Κόστος εβδομάδας', en: 'Week cost' },
    atStore: { el: 'στο {store}', en: 'at {store}' },
    weekPreview: { el: 'Μια ματιά στα μεσημεριανά', en: 'A peek at the lunches' },
    allSafe: { el: 'Κάθε πιάτο είναι ασφαλές για όλη την οικογένεια', en: 'Every dish is safe for the whole family' },
    cta: { el: 'Συνέχεια', en: 'Continue' },
  },

  // ---------- paywall ----------
  paywall: {
    badge: { el: 'Premium', en: 'Premium' },
    title: { el: 'Δοκίμασε δωρεάν για 7 μέρες', en: 'Try it free for 7 days' },
    sub: { el: 'Όλα όσα χρειάζεστε για να τρώτε καλά, χωρίς άγχος.', en: 'Everything you need to eat well, stress-free.' },
    b1: { el: 'Νέο πλάνο κάθε εβδομάδα', en: 'A fresh plan every week' },
    b1s: { el: 'Μαθαίνει από τη γνώμη των παιδιών', en: 'Learns from your kids’ feedback' },
    b2: { el: 'Λίστα ψωνιών με σύγκριση τιμών', en: 'Shopping list with price comparison' },
    b2s: { el: 'Στα 4 σούπερ μάρκετ της γειτονιάς', en: 'Across your neighbourhood supermarkets' },
    b3: { el: 'Ασφαλές για αλλεργίες', en: 'Allergy-safe' },
    b3s: { el: 'Κάθε υλικό ελεγμένο', en: 'Every ingredient checked' },
    b4: { el: 'Λιγότερη σπατάλη', en: 'Less waste' },
    b4s: { el: 'Έξυπνα περισσεύματα και μαγείρεμα για 2 μέρες', en: 'Smart leftovers and batch cooking' },
    tlToday: { el: 'Σήμερα', en: 'Today' },
    tlTodaySub: { el: 'Πλήρης πρόσβαση σε όλα', en: 'Full access to everything' },
    tlDay5: { el: 'Σε 5 μέρες', en: 'In 5 days' },
    tlDay5Sub: { el: 'Σου θυμίζουμε ότι λήγει η δοκιμή', en: 'We remind you the trial is ending' },
    tlDay7: { el: 'Σε 7 μέρες', en: 'In 7 days' },
    tlDay7Sub: { el: 'Ξεκινά η συνδρομή {price}/μήνα', en: 'Subscription starts at {price}/month' },
    price: { el: '7 μέρες δωρεάν, μετά {price}/μήνα', en: '7 days free, then {price}/month' },
    cancel: { el: 'Ακύρωση οποτεδήποτε', en: 'Cancel anytime' },
    cta: { el: 'Ξεκίνα 7 μέρες δωρεάν', en: 'Start 7 days free' },
    restore: { el: 'Επαναφορά αγορών', en: 'Restore purchases' },
    terms: { el: 'Όροι χρήσης', en: 'Terms' },
    privacy: { el: 'Απόρρητο', en: 'Privacy' },
    demoNote: { el: 'Demo: καμία πραγματική χρέωση', en: 'Demo: no real charge' },
  },

  // ---------- subscription confirmation (mock) ----------
  subscribe: {
    title: { el: 'Συνδρομή', en: 'Subscription' },
    product: { el: 'FamilyMenu AI Premium', en: 'FamilyMenu AI Premium' },
    plan: { el: 'Μηνιαία συνδρομή', en: 'Monthly plan' },
    trial: { el: 'Δωρεάν δοκιμή', en: 'Free trial' },
    trialValue: { el: '7 μέρες', en: '7 days' },
    starting: { el: 'Από {date}', en: 'Starting {date}' },
    perMonth: { el: '{price}/μήνα', en: '{price}/month' },
    account: { el: 'Λογαριασμός', en: 'Account' },
    accountValue: { el: 'Λογαριασμός demo', en: 'Demo account' },
    fine: {
      el: 'Η συνδρομή ανανεώνεται αυτόματα εκτός αν ακυρωθεί τουλάχιστον 24 ώρες πριν λήξει η δοκιμή. Demo: δεν γίνεται καμία χρέωση.',
      en: 'Renews automatically unless cancelled at least 24 hours before the trial ends. Demo: nothing is charged.',
    },
    confirm: { el: 'Επιβεβαίωση', en: 'Confirm' },
    processing: { el: 'Επεξεργασία…', en: 'Processing…' },
    done: { el: 'Ολοκληρώθηκε', en: 'Done' },
  },

  // ---------- success ----------
  success: {
    title: { el: 'Καλώς ήρθατε!', en: 'Welcome aboard!' },
    sub: {
      el: 'Η δωρεάν δοκιμή ξεκίνησε. Θα σας θυμίσουμε πριν λήξει.',
      en: 'Your free trial has started. We’ll remind you before it ends.',
    },
    cta: { el: 'Δες το σημερινό μενού', en: 'See today’s menu' },
  },
}
