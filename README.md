# FamilyMenu AI: διαδραστικό mockup

> 🇬🇷 Ελληνικά παρακάτω · 🇬🇧 [English below](#english)

## Τι είναι

Ένα **διαδραστικό, clickable mockup εφαρμογής iOS** για το FamilyMenu AI: τον έξυπνο εβδομαδιαίο προγραμματιστή οικογενειακών γευμάτων για γονείς στην Ελλάδα (3,99 €/μήνα μετά από 7 μέρες δωρεάν δοκιμή).

Όλα λειτουργούν με **ρεαλιστικά δεδομένα demo**: δεν υπάρχει πραγματικό AI, backend, ζωντανές τιμές ή πληρωμές. Η demo οικογένεια είναι η οικογένεια Παπαδόπουλου από το Χαλάνδρι (Μαρία, Γιώργος, Νίκος 8 ετών, Ελένη 4 ετών με αλλεργία στους ξηρούς καρπούς). Η «σημερινή» μέρα είναι η Τρίτη 27 Οκτωβρίου 2026.

- Ελληνικά πρώτα, με διακόπτη για Αγγλικά
- 3 χρωματικές παλέτες (Ελιά, Ντομάτα, Αιγαίο), φωτεινό και σκοτεινό θέμα
- Σε υπολογιστή: πλαίσιο iPhone και πάνελ παρουσίασης. Σε κινητό: η εφαρμογή σε πλήρη οθόνη
- Σούπερ μάρκετ μόνο με το όνομά τους (χωρίς λογότυπα), με την ένδειξη «Ενδεικτικές τιμές»

## Πώς τρέχει

Χρειάζεστε [Node.js](https://nodejs.org) 20 ή νεότερο.

```bash
npm install
npm run dev
```

Ανοίξτε **http://localhost:5173** στον browser (Chrome, Edge ή Safari).

### Στο κινητό (ίδιο Wi-Fi)

```bash
npm run dev:phone
```

1. Το τερματικό δείχνει μια γραμμή `Network: http://192.168.x.x:5173`. Ανοίξτε αυτή τη διεύθυνση στο κινητό, συνδεδεμένο στο **ίδιο Wi-Fi** με τον υπολογιστή.
2. **Windows:** την πρώτη φορά εμφανίζεται μήνυμα του Τείχους προστασίας (Windows Defender Firewall) για το Node.js. Επιλέξτε **Ιδιωτικά δίκτυα** και πατήστε **Να επιτρέπεται η πρόσβαση**, αλλιώς το κινητό δεν θα συνδέεται.
3. **Προσθήκη στην αρχική οθόνη** για εμπειρία πλήρους οθόνης σαν κανονική εφαρμογή:
   - iPhone (Safari): κουμπί Κοινοποίηση → «Προσθήκη στην οθόνη Αφετηρίας».
   - Android (Chrome): μενού ⋮ → «Προσθήκη στην αρχική οθόνη».

   Σε απλή καρτέλα του Safari, η ζωγραφισμένη μπάρα κατάστασης εμφανίζεται κάτω από την πραγματική. Από την αρχική οθόνη η εικόνα είναι καθαρή.

## Πάνελ παρουσίασης

Σε υπολογιστή, δεξιά από το iPhone υπάρχει το πάνελ παρουσίασης. Στο κινητό, **κρατήστε πατημένη την ώρα στη μπάρα κατάστασης** για να ανοίξουν τα ίδια χειριστήρια σε φύλλο.

**Οι 6 διαδρομές:**

1. **Πρώτη γνωριμία:** καλωσόρισμα → 7 ερωτήσεις → τοποθεσία → «το AI φτιάχνει το πλάνο» → έτοιμο πλάνο → δωρεάν δοκιμή → επιβεβαίωση → Σήμερα.
2. **Τι τρώμε σήμερα:** η σημερινή μέρα, η συνταγή του γιουβετσιού και το μαγείρεμα βήμα βήμα (σύρετε ανάμεσα στα βήματα, χρονόμετρα).
3. **Αλλαγή γεύματος:** τρεις ασφαλείς εναλλακτικές με το κόστος τους, άμεση αλλαγή και «Αναίρεση». Στην Εβδομάδα: σύρσιμο σε μια γραμμή ή παρατεταμένο πάτημα για μενού.
4. **Έξυπνα ψώνια:** λίστα ανά διάδρομο, σύγκριση 4 σούπερ μάρκετ, τσεκάρισμα, «Το έχω ήδη» (σύρσιμο αριστερά) και κοινοποίηση.
5. **Το AI μαθαίνει:** η Ελένη δεν έφαγε το σπανακόρυζο → το πλάνο αλλάζει μόνο του (σπανακοπιτάκια την Κυριακή), η αλλαγή φωτίζεται στην Εβδομάδα και το προφίλ της Ελένης ενημερώνεται.
6. **Κυριακάτικη ανασκόπηση:** χρόνος, χρήματα και σπατάλη που γλιτώσατε → «Φτιάξε την επόμενη εβδομάδα».

**Σενάρια:** «Ειδοποίηση 16:30» (Πώς πήγε το γιουβέτσι;), «Πάμε Κυριακή», «Ξανά η εισαγωγή», «Επαναφορά demo», καθώς και γλώσσα, θέμα και παλέτα.

Η κατάσταση του demo αποθηκεύεται στον browser. Η «Επαναφορά demo» (ή το `?reset=1`) τα επαναφέρει όλα στην αρχή.

## Άμεσοι σύνδεσμοι (deep links)

Κάθε οθόνη ανοίγει απευθείας με παραμέτρους στο URL, π.χ. `http://localhost:5173/?tab=week&weekday=thu`.

| Τι | Σύνδεσμος |
|---|---|
| Καρτέλες | `?tab=today` · `?tab=week` · `?tab=shop` · `?tab=family` |
| Μέρα στην Εβδομάδα | `?tab=week&weekday=thu` |
| Συνταγή | `?screen=recipe&id=pastitsio&mealId=sun-lunch` |
| Προφίλ παιδιού | `?screen=child&id=eleni` |
| Αλλαγή γεύματος | `?sheet=swap&mealId=tue-lunch` |
| Αξιολόγηση | `?sheet=feedback&mealId=mon-dinner` |
| Κοινοποίηση / Σύγκριση | `?tab=shop&sheet=share` · `?tab=shop&sheet=compare` |
| Προφίλ & ρυθμίσεις | `?sheet=profile` |
| Μαγείρεμα | `?modal=cook&id=chicken-giouvetsi` |
| Ανασκόπηση Κυριακής | `?modal=recap&day=sun` |
| Εισαγωγή (βήμα) | `?onboarding=welcome` · `members` · `kids-taste` · `family-taste` · `allergies` · `meals` · `budget` · `location` · `generating` · `ready` · `paywall` |
| Ώρα / μέρα / ειδοποίηση | `?time=16:30` · `?day=sun` · `?notify=tue-lunch` |
| Εμφάνιση | `?lang=en` · `?theme=dark` · `?palette=tomato` (ή `olive`, `aegean`) · `?frame=0` (χωρίς πλαίσιο) |
| Επαναφορά | `?reset=1` |

Οι παράμετροι συνδυάζονται: `?tab=shop&lang=en&theme=dark&palette=aegean`. Το `?sheet=kit` δείχνει όλα τα στοιχεία του UI kit.

## Δομή του project

```
src/
  app/          κέλυφος: πλαίσιο iPhone, καρτέλες, πλοήγηση, φύλλα, ειδοποιήσεις, πάνελ παρουσίασης, deep links
  ui/           UI kit (κουμπιά, λίστες, chips, δαχτυλίδια, φωτογραφίες φαγητού, swipe actions…)
  store/        κατάσταση της εφαρμογής (zustand): πλάνο, λίστα, αξιολογήσεις, ρολόι demo
  data/         όλα τα δεδομένα demo και οι υπολογισμοί (κόστη, εναλλακτικές, «AI», ανασκόπηση)
  i18n/         ελληνικά / αγγλικά, μορφοποίηση € και χρόνου
  styles/       χρώματα (3 παλέτες × φωτεινό/σκοτεινό), τυπογραφία, υλικά
  features/     onboarding · today · recipe · week · shop · family · profile
public/images/  φωτογραφίες φαγητών (food/<id>.jpg) και hero.jpg
scripts/        shot.mjs (στιγμιότυπα με headless Edge), check-data.ts (έλεγχος δεδομένων)
docs/           ARCHITECTURE.md (οδηγός για developers)
shots/final/    τελική συλλογή στιγμιότυπων
```

Χρήσιμες εντολές: `npm run typecheck` · `npm run build` · `npm run lint` · `node scripts/check-data.ts` · `npm run shot -- --port 5190 --url "/?tab=week" --out shots/x.png`.

## Συνεργασία

```bash
git clone https://github.com/spentzosalexandros/familymenu-ai.git
cd familymenu-ai
npm install
git switch -c onoma-allagis      # νέο branch για κάθε εργασία
# ... αλλαγές ...
npm run typecheck
git add -A
git commit -m "Τι άλλαξε"
git push -u origin onoma-allagis
```

Μετά ανοίξτε ένα **Pull Request** στο GitHub. Τα προβλήματα που βρίσκετε γράφονται ως **Issues**.

## Πηγές

- **Φωτογραφίες:** Wikimedia Commons, με ελεύθερες άδειες (public domain, CC0, CC BY, CC BY-SA). Συντελεστές και άδειες για κάθε εικόνα: [`public/images/CREDITS.md`](public/images/CREDITS.md) (και από την εφαρμογή: Προφίλ → Σχετικά → Πηγές φωτογραφιών).
- **Σχεδιασμός:** ακολουθεί τις οδηγίες σχεδιασμού (design skills) του **Emil Kowalski** (apple-design, emil-design-eng, mobile-native κ.ά., άδεια MIT).
- Γραμματοσειρά Inter (SIL OFL), εικονίδια Phosphor (MIT).

---

<a id="english"></a>

# FamilyMenu AI: interactive mockup (English)

## What it is

An **interactive, clickable iOS-style app mockup** of FamilyMenu AI, the AI weekly family meal planner for parents in Greece (€3.99/month after a 7-day free trial).

Everything runs on **realistic demo data**. There is no real AI, backend, live prices or payments. The demo family is the Papadopoulos family from Chalandri, Athens (Maria, Giorgos, Nikos aged 8, and Eleni aged 4, who is allergic to nuts). The demo "today" is Tuesday 27 October 2026.

- Greek first, with an English toggle
- 3 colour palettes (Olive, Tomato, Aegean), light and dark themes
- On a desktop: an iPhone frame plus a presenter panel. On a phone: the app runs full-screen
- Supermarkets appear by name only (no logos), always labelled "Indicative prices"

## How to run

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in Chrome, Edge or Safari.

### On a phone (same Wi-Fi)

```bash
npm run dev:phone
```

1. The terminal prints a line like `Network: http://192.168.x.x:5173`. Open that address on a phone connected to the **same Wi-Fi** as the computer.
2. **Windows:** the first time, Windows Defender Firewall asks about Node.js. Tick **Private networks** and click **Allow access**, or the phone won't be able to connect.
3. **Add to Home Screen** for a full-screen, app-like experience:
   - iPhone (Safari): Share button → "Add to Home Screen".
   - Android (Chrome): ⋮ menu → "Add to Home screen".

   In a normal Safari tab, the drawn status bar sits under the phone's real one. Opening it from the home screen gives the clean full-screen version.

## Presenter panel

On a desktop, the presenter panel sits to the right of the iPhone. On a phone, **long-press the clock in the status bar** to open the same controls in a sheet.

**The 6 journeys:**

1. **First run:** welcome → 7 questions → location → "the AI builds your plan" → plan ready → free trial → confirmation → Today.
2. **What's for today:** today's meals, the giouvetsi recipe and step-by-step cooking (swipe between steps, timers).
3. **Swap a meal:** three safe alternatives with their cost, instant swap and "Undo". In Week, swipe a row or long-press it for a menu.
4. **Smart shopping:** a list by aisle, 4 supermarkets compared, check-off, "Already have it" (swipe left) and sharing.
5. **The AI learns:** Eleni didn't eat the spinach rice → the plan adapts by itself (mini spinach pies on Sunday), the change is highlighted in Week and Eleni's profile updates.
6. **Sunday recap:** time, money and waste saved → "Plan next week".

**Scenarios:** "Notification 16:30" (How was the giouvetsi?), "Skip to Sunday", "Restart onboarding", "Reset demo", plus language, theme and palette.

The demo state is saved in the browser. "Reset demo" (or `?reset=1`) puts everything back to the start.

## Deep links

Every screen opens directly from URL parameters, e.g. `http://localhost:5173/?tab=week&weekday=thu`. See the table in the Greek section above: the parameters are the same (`tab`, `weekday`, `screen`, `sheet`, `modal`, `onboarding`, `time`, `day`, `notify`, `lang`, `theme`, `palette`, `frame`, `reset`). They can be combined: `?tab=shop&lang=en&theme=dark&palette=aegean`. `?sheet=kit` shows the whole UI kit.

## Project structure

```
src/
  app/          shell: iPhone frame, tabs, navigation, sheets, notifications, presenter panel, deep links
  ui/           UI kit (buttons, lists, chips, rings, food photos, swipe actions…)
  store/        app state (zustand): plan, shopping list, feedback, demo clock
  data/         all demo data and the calculations (costs, alternatives, the scripted "AI", recap)
  i18n/         Greek / English strings, € and time formatting
  styles/       colour tokens (3 palettes × light/dark), typography, materials
  features/     onboarding · today · recipe · week · shop · family · profile
public/images/  food photos (food/<id>.jpg) and hero.jpg
scripts/        shot.mjs (headless Edge screenshots), check-data.ts (data consistency checks)
docs/           ARCHITECTURE.md (developer guide)
shots/final/    final screenshot gallery
```

Useful commands: `npm run typecheck` · `npm run build` · `npm run lint` · `node scripts/check-data.ts` · `npm run shot -- --port 5190 --url "/?tab=week" --out shots/x.png`.

## Collaborating

Clone the repo, run `npm install`, and create a new branch for each task (`git switch -c change-name`). Run `npm run typecheck` before you commit, push the branch and open a **Pull Request** on GitHub. Report problems as **Issues**.

## Credits

- **Photos:** Wikimedia Commons, under free licences (public domain, CC0, CC BY, CC BY-SA). Author and licence for every image: [`public/images/CREDITS.md`](public/images/CREDITS.md) (also linked in the app: Profile → About → Image credits).
- **Design:** follows the design guidance (design skills) by **Emil Kowalski** (apple-design, emil-design-eng, mobile-native and others, MIT licence).
- Inter typeface (SIL OFL), Phosphor icons (MIT).
