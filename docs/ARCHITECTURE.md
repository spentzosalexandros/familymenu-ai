# FamilyMenu AI mockup — developer guide

This file explains the foundation every feature builds on.

```bash
npm run dev          # localhost:5173
npm run dev:phone    # same, on the LAN (open http://<pc-ip>:5173 on a phone; "Add to Home Screen" for full-screen)
npm run typecheck    # tsc -p tsconfig.app.json --noEmit
npm run build
npm run shot -- --port 5182 --url "/?tab=today" --out shots/today/today.png   # see §10
```

---

## 1. Folder map

```
src/main.tsx            fonts + CSS, applyDeepLink(), render <App/> (window.__fm dev hook)
src/app/                shell (foundation)
  App.tsx               MotionConfig(reducedMotion="user") + DeviceProvider + Stage
  Stage.tsx             desktop: iPhone frame + PresenterPanel · narrow: full-screen. PhoneScreen = containing block of all overlays
  device.tsx            useDevice(): framed, width/height, safeTop/safeBottom, scale · status-bar glyphs
  Shell.tsx             tab bar + one NavStack per tab (kept alive)
  NavStack.tsx          push/pop springs, −30 % parallax + dim, interactive edge-swipe back
  Screen.tsx            the screen scaffold (large title, nav bar, sheet header…)  ← use this
  Presentations.tsx     sheets (detents, drag, nested, presenting-screen scale) + full-screen modals
  Overlays.tsx          notification banner, alert dialog
  ContextMenu.tsx       long-press menu (+ host)
  Toasts.tsx            Sonner toaster inside the phone + iOS-style toast
  nav.ts                navigation API (push, openSheet, toast, alert, notify …)
  registry.tsx          route ids → lazy feature exports (+ preload)
  deeplinks.ts          ?tab=…&screen=…&sheet=… → store
  Presenter.tsx, journeys.ts   presenter panel / sheet and the 6 journeys
  index.ts              public API for features:  import { push, openSheet, useScreen } from '../../app'
src/ui/                 UI kit:  import { Screen, Button, ListGroup, … } from '../../ui'
src/store/              zustand store: hooks + actions:  import { usePlan, actions } from '../../store'
src/i18n/               useT / useLang / formatEUR …:  import { useT, formatEUR, S } from '../../i18n'
src/styles/             tokens.css (3 palettes × light/dark), base.css, index.css (Tailwind theme)
src/data/               CONTENT agent — the only source of demo numbers (selectors)
src/features/<name>/    one folder per feature agent; keep strings in strings.ts
scripts/shot.mjs        screenshot tool
```

---

## 2. Feature entry points (exact export names)

The registry imports these names from `src/features/<folder>/index.tsx` (placeholders exist — replace them, keep the names;
if you switch to `index.ts`, delete `index.tsx`). **Route params arrive as props.**

| Folder | Export | Kind | Props |
|---|---|---|---|
| onboarding | `OnboardingFlow` | full-screen flow | `{ step?: OnboardingStep }` |
| today | `TodayScreen` | tab root | — |
| recipe | `RecipeScreen` | pushed | `{ id: string; mealId?: string }` |
| recipe | `CookMode` | full-screen modal | `{ id: string }` |
| week | `WeekScreen` | tab root | `{ day?: DayId }` |
| week | `SwapSheet` | sheet | `{ mealId: string }` |
| shop | `ShopScreen` | tab root | — |
| shop | `CompareSheet`, `ShareSheet` | sheets | — |
| family | `FamilyScreen` | tab root | — |
| family | `ChildProfileScreen` | pushed | `{ id: string }` |
| family | `FeedbackSheet` | sheet | `{ mealId: string }` |
| family | `RecapScreen` | full-screen modal | — |
| profile | `ProfileScreen` | sheet (foundation) | — |

Every route has its own ErrorBoundary: a crash shows "Κάτι δεν πήγε καλά εδώ" with *Δοκίμασε ξανά* instead of breaking the app.

---

## 3. Building a screen — `<Screen>`

One scaffold for every container; it adapts to where it is rendered (stack, sheet, modal).

```tsx
import { Screen, Card, Button } from '../../ui'
import { useT } from '../../i18n'
import { S as T } from './strings'

export function TodayScreen() {
  const t = useT()
  return (
    <Screen title={t(T.title)} subtitle={t(T.date)} avatar>   {/* large title + family avatar → profile sheet */}
      <div className="space-y-6 px-4">…</div>
    </Screen>
  )
}
```

| Prop | Use |
|---|---|
| `title` | required. Large title on tab roots (collapses into the translucent inline bar on scroll), inline on pushed screens, sheet header title in sheets. The next screen's back button shows it. |
| `subtitle` | small line above the large title (e.g. "Τρίτη 27 Οκτωβρίου") |
| `titleMode` | `'large' \| 'inline' \| 'hidden'` (defaults: root → large, pushed/modal → inline) |
| `avatar` | family avatar on the right → opens the profile sheet |
| `trailing` / `leading` | nav-bar items (use `IconButton variant="plain"` / `Button variant="plain" size="sm"`) |
| `stickyHeader` | sticks under the nav bar (week day strip); gets a material once stuck |
| `bottomBar` | pinned CTA above the tab bar / home indicator, on a material |
| `transparentNav={px}` | hero mode (recipe): content starts at y=0 under a transparent nav bar with round material back button; bar materialises after `px` of scroll |
| `scrollRef` | ref to the scroll container (scroll-to-day, etc.) |
| `background` | `'grouped'` (default, cream/gray with white cards) or `'plain'` |
| `hideDone` | sheets: hide the default **Τέλος** button |
| `contentClassName` | classes on the content wrapper |

Bottom padding (tab bar + home indicator) and the top inset are handled — just render content. In a **sheet** the host
owns the scroll view; your content scrolls inside it and dragging the header / pulling down at the top drags the sheet.
Put `data-no-sheet-drag` on any element inside a sheet that must not start a sheet drag (custom sliders, canvases).

`useScreen()` → `{ container: 'stack'|'sheet'|'modal'|'onboarding', tab, depth, isTop, close(), bottomInset, sheet?: { detent, expand() } }`.
Use `isTop` to pause work on screens that are covered, `close()` for custom close buttons.

Status bar over dark photos: `useStatusBarStyle('light', isTop && heroVisible)` (from `src/app`).

---

## 4. Navigation API (`src/app`)

```ts
import { push, pop, popToRoot, setTab, openSheet, closeSheet, openModal, closeModal, dismissAll,
         navigate, openRecipe, toast, alert, notify, notifyFeedback } from '../../app'

push('recipe', { id: 'chicken-giouvetsi', mealId: 'tue-lunch' })   // on the active tab
push('child', { id: 'eleni' }, 'family')                           // on a specific tab
pop()                                                              // or the user swipes from the left edge
openSheet('swap', { mealId: 'tue-lunch' })                         // detents from the registry
openSheet('share', {}, { detents: ['medium', 'large'], initial: 'medium' })
closeSheet()                                                       // top-most sheet (or closeSheet(key))
openModal('cook', { id: 'chicken-giouvetsi' }); closeModal()
openRecipe(recipeId, mealId)                                       // closes sheets, then pushes
navigate({ tab: 'week', params: { day: 'thu' } })                  // tab root props
navigate({ tab: 'family', screen: 'child', params: { id: 'eleni' }, sheet: 'feedback', sheetParams: { mealId: 'tue-lunch' } })

toast({ el: 'Το γεύμα άλλαξε', en: 'Meal swapped' }, {
  icon: '🔄', description: T.sameCost, action: { label: S.undo, onClick: undo },   // 6 s with an action
})
alert({ title: T.resetTitle, message: T.resetBody,
        actions: [{ label: S.cancel, style: 'cancel' }, { label: T.reset, style: 'destructive', onPress: reset }] })
notify({ title, body, target: { sheet: 'feedback', sheetParams: { mealId } } })      // iOS banner
```

Sheet defaults (`SHEET_DEFAULTS` in `src/store/store.ts`): swap `medium+large` (opens large) · compare `medium+large` (large) ·
share `medium+large` (medium) · feedback `large` · profile `large`. Medium ≈ 55 %, large ≈ 92 % of the screen; the
presenting screen scales to 0.94 with rounded corners at large; nested sheets push the one below back. Esc closes.
Tapping the active tab pops to root, then scrolls to top.

**Context menu** (long-press / right-click, blurred backdrop, lifted preview):

```tsx
import { ContextMenu } from '../../ui'
<ContextMenu items={[
  { key: 'swap', label: T.swap, icon: <ArrowsClockwiseIcon />, onSelect: () => openSheet('swap', { mealId }) },
  { key: 'out', label: T.eatOut, icon: <ForkKnifeIcon />, destructive: false, onSelect: … },
]}>
  <MealRow … />
</ContextMenu>
```

---

## 5. Store (`src/store`)

Read with hooks, write with `actions.*` (stable functions, usable anywhere). Demo state is persisted in localStorage
(`familymenu-demo-v1`; discarded automatically when the dataset changes; `?reset=1` wipes it).

| Hook | Returns |
|---|---|
| `usePlan()`, `useMeal(id)`, `useMealsForDay(day)` | `PlannedMeal[]` / one meal / a day sorted by slot |
| `useIsHighlighted(mealId)`, `useHighlight()` | meals to glow after swap / feedback / regenerate |
| `useIsAdapted(mealId)` | next week: "προσαρμόστηκε" badge |
| `useToday()`, `useClock()`, `useWeek()`, `useWeekIndex()`, `useDemoDay(day?)` | demo day (follows setClock / next week), `{day, minutes}`, current `DemoWeek` |
| `useBudget()`, `usePrefs()` | weekly budget (editable in Profile) and prefs |
| `useGroceryList()`, `useStoreTotals()`, `useCheapestStore()`, `useSelectedStore()`, `usePlanCost(store?)` | data selectors bound to the live plan + pantry |
| `useShopping()`, `useChecked()`, `usePantry()` | shopping state |
| `useInsights()`, `usePendingFeedback()`, `useFeedbackEntries()`, `useLastLearning()`, `useTasteChanges()`, `useChildTaste(memberId)` | learning state |
| `useTrial()` | `{ active, daysLeft, price }` |
| `useSettings()`, `useOnboarding()`, `useTab()` | settings / onboarding / active tab |

| Action | Notes |
|---|---|
| `swapMeal(mealId, recipeId)` → `undo()` | leftovers of that meal follow; highlights it |
| `lockMeal(mealId, locked?)`, `setEatingOut(mealId, on)` → `undo()` | |
| `regeneratePlan()` → `{ undo, changedMealIds }` | rotates unlocked meals through their alternatives |
| `setHighlight(ids)`, `clearHighlight()` | |
| `selectStore(id \| null)`, `toggleChecked(id)`, `togglePantry(id)` → `undo()`, `resetShopping()` | |
| `submitFeedback(entry)` → `LearningResult` | runs `applyFeedback`, updates plan/insights/tastes, highlights changed meals |
| `setClock({ day?, time?: 'HH:MM' })`, `startNextWeek()` → adapted ids | |
| `setOnboardingStep(step)`, `completeOnboarding()`, `restartOnboarding(step?)` | onboarding agent: call `completeOnboarding()` at the end (starts the trial, lands on Today) |
| `startTrial()`, `setBudget(n)`, `togglePreferredStore(id)`, `setFeedbackReminder(on)` | |
| `setLang`, `setTheme('light'\|'dark'\|'auto')`, `setPalette('olive'\|'tomato'\|'aegean')`, `resetDemo()` | |

Never hardcode demo numbers: compute through the hooks above / `src/data` selectors.

---

## 6. UI kit (`src/ui`)

| Component | Key props |
|---|---|
| `Button` | `variant` filled·tinted·gray·plain·destructive, `tone` primary·accent·danger·success·label, `size` sm(34)·md(44)·lg(52), `icon`, `iconRight`, `full`, `loading`. Press = scale 0.97 on pointer-down |
| `IconButton` | `label` (required), `icon`, `variant` gray·plain·material·tinted·filled, `size` (visual px; hit area ≥ 44) |
| `ListGroup` / `ListRow` | inset grouped list. Row: `title`, `subtitle`, `icon` (+ `iconBg` for Settings-style squares), `value`, `accessory`, `chevron`, `onPress`, `destructive`, `tinted` |
| `Card` | `padding` none·sm·md·lg, `onPress` (pressable), `highlight` (glow ring) |
| `SectionHeader` | `title`, `subtitle`, `action` + `onAction`, `variant` prominent·small |
| `EmptyState` | `emoji`/`icon`, `title`, `message`, `action` |
| `Chip` | `selected`, `onToggle`, `emoji`, `icon`, `size`, `tone` filled·tinted |
| `TriStateChip` | `label`, `emoji`, `value: 'love'\|'eats'\|'refuses'`, `onChange` (tap cycles). Labels: `TRI_STATE_LABELS` |
| `SegmentedControl` | `options [{value,label}]`, `value`, `onChange`, `size` |
| `Switch` | `checked`, `onChange`, `aria-label` |
| `Stepper` | `value`, `onChange`, `min`, `max`, `step`, `variant` ios·inline, `format`, `label` |
| `Slider` | `value`, `onChange`, `onChangeEnd`, `min`, `max`, `step`, `valueText` |
| `Badge`, `Dot` | `tone` neutral·primary·accent·success·warning·danger·solid, `icon`, `emoji`, `size` |
| `Avatar`, `AvatarStack` | `member` (from data) or `emoji`+`color`, `size`, `ring` |
| `ProgressBar`, `BudgetBar` | `value` 0–1 / `value`+`budget` (labels "από 140 €", "περισσεύουν …", colour by ratio) |
| `Ring` | `value` 0–1, `size`, `stroke`, `color`, children in the centre |
| `AnimatedNumber` | NumberFlow; `value`, `format` eur·eur0·percent(0–100)·number·kg |
| `FoodImage` | `recipeId` or `src`, `aspect`, `rounded`, `priority`; skeleton → fade-in; gradient + emoji fallback if the file is missing |
| `SwipeableRow` | `leading`/`trailing: SwipeAction[]` (`{key,label,icon,color,onPress}`; `[0]` is the full-swipe action), `fullSwipe` |
| `SafeBadge` | `recipeId?` (renders only if safe), `memberIds?` → "Ασφαλές για την Ελένη" |
| `ContextMenu`, `Screen`, `ProfileButton` | re-exported from `src/app` |

Horizontal carousels / chip rows: `className="ios-hscroll flex gap-2 px-4"` (native snap scroll, right touch-action).
Vertical scrolling is already handled by `Screen`.

**Live gallery of every component:** open `/?sheet=kit` (or screenshot it) — handy to check light/dark/palettes.

---

## 7. i18n (`src/i18n`)

```ts
const t = useT()                 // t({ el, en }) · t(recipe.name) · t({ el: '{n} γεύματα', en: '{n} meals' }, { n: 28 })
const lang = useLang()           // 'el' | 'en'
const tp = useTp()               // tp(n, { el: { one: '{n} μέρα', other: '{n} μέρες' }, en: { … } })
formatEUR(12.4, lang)            // "12,40 €" / "€12.40"   · { decimals: 0 } · { sign: true } for deltas "+1,20 €"
formatMinutes(75, lang)          // "1 ώ 15′" / "1 h 15 min" · 'long' → "1 ώρα και 15 λεπτά"
formatPercent(82, lang), formatKg(1.2, lang), formatNumber(n, lang), joinNames(['Νίκος','Ελένη'], lang)
S.tabs.today, S.undo, S.done, S.cancel, S.indicativePrices …   // core shell strings
tNow(text)                       // non-hook translate (event handlers)
```

Every visible string exists in both languages; keep feature strings in `src/features/<name>/strings.ts`.

---

## 8. Tokens & Tailwind

Theme lives on `<html data-theme="light|dark" data-palette="olive|tomato|aegean">` (set by the store). Use semantic classes —
they adapt to palette and dark mode automatically:

| Purpose | Classes |
|---|---|
| backgrounds | `bg-bg` (plain), `bg-bg-grouped` (screen), `bg-bg-grouped-2` (cards/cells), `bg-bg-grouped-3`, `bg-bg-elevated` |
| text | `text-label`, `text-label-2` (secondary), `text-label-3`, `text-label-4` |
| fills | `bg-fill`, `bg-fill-2`, `bg-fill-3` (controls), `bg-fill-4` |
| brand | `bg-primary text-on-primary`, `text-primary`, `bg-primary-tint`, `bg-accent text-on-accent`, `text-accent-ink`, `bg-accent-tint` |
| status | `text-success / bg-success-tint`, `warning`, `danger` (+ `-tint`) |
| lines | `border-separator`, `hairline-t`, `hairline-b` (0.5 px, no layout shift) |
| materials | `material-bar`, `material-thick`, `material-regular`, `material-thin` (translucent + blur; solid with reduced transparency) |
| shadows | `shadow-card`, `shadow-raised`, `shadow-float` |
| type (iOS) | `text-large-title`, `text-title-1`, `text-title-2`, `text-title-3`, `text-headline`, `text-body`, `text-callout`, `text-subhead`, `text-footnote`, `text-caption`, `text-caption-2` (size + leading + size-specific tracking + weight) |
| numbers | `tnum` (tabular figures for prices) |
| misc | `pressable` (scale 0.97 on :active), `no-scrollbar`, `ios-hscroll`, `dark:` variant |

Rounding: cells 12 px (`rounded-[12px]`), cards 18 px, sheets 14 px. Avoid all-caps Greek. Raw variables (`var(--primary)`) work in inline styles.

---

## 9. Motion & gestures (`src/ui/motion.ts`, `src/ui/gestures.ts`)

```ts
import { spring, ease, fade, tap, tapTransition, popIn } from '../../ui'
<motion.div animate={{ y: 0 }} transition={spring.default} />      // bounce 0, 0.4 s — default for UI
spring.snappy (0.3) · spring.push · spring.sheet · spring.gentle (0.55) · spring.layout (lists)
spring.sheetFlick / spring.bouncy   // bounce ~0.16–0.2 — ONLY after a gesture with momentum
<motion.button whileTap={tap} transition={tapTransition} />        // or the `pressable` class
initial={popIn.initial} animate={popIn.animate} exit={popIn.exit}  // never from scale(0)
```

Gesture helpers: `VelocityTracker`, `project(v)` (Apple momentum projection), `rubberband(overshoot, dim)`,
`getDeviceScale()` (**divide pointer deltas by it** — the desktop frame may be scaled), `suppressNextClick()`, `haptic()`.
Reduced motion is global (`MotionConfig reducedMotion="user"`); for hand-rolled `animate()` calls check `prefersReducedMotion()`.

---

## 10. Deep links & screenshots

Any state is a URL (see `src/app/deeplinks.ts`):

```
?tab=week                          ?tab=week&weekday=thu            (WeekScreen { day })
?screen=recipe&id=pastitsio&mealId=sun-lunch                         (tab inferred: child → family)
?sheet=swap&mealId=tue-lunch&detent=medium   ?modal=cook&id=chicken-giouvetsi   ?modal=recap&day=sun
?onboarding=budget | done          ?theme=dark  ?lang=en  ?palette=tomato   ?frame=0|1
?time=16:30&day=sun                ?notify=tue-lunch                 ?reset=1
```

A tab/screen/sheet/modal link skips onboarding (unless `onboarding=` is given). Other keys become params.

**Screenshots** — each agent uses its own port (foundation 5180 · onboarding 5181 · today 5182 · week 5183 · shop 5184 ·
family 5185 · content 5186 · integration 5190). The script starts its own Vite server (cache `node_modules/.vite-<port>`),
drives headless Edge, waits for fonts/images/network idle (+700 ms settle), and prints page console errors.
Defaults add `frame=0&reset=1` (393×852 @2x phone); `--desktop` = 1440×900 framed view with the presenter panel.

```bash
node scripts/shot.mjs --port 5183 --url "/?tab=week" --out shots/week/week.png
node scripts/shot.mjs --port 5183 --url "/?tab=week&theme=dark&lang=en" --out shots/week/week-dark-en.png
node scripts/shot.mjs --port 5183 --url "/?sheet=swap&mealId=tue-lunch" --click-text "Μακαρόνια" --wait 600 --out shots/week/swapped.png
node scripts/shot.mjs --port 5183 --desktop --url "/?tab=week" --out shots/week/desktop.png
node scripts/shot.mjs --port 5183 --shots shots/week/shots.json
```

`shots.json`:

```json
[
  { "url": "/?tab=week", "out": "shots/week/a.png" },
  { "url": "/?tab=week", "out": "shots/week/b.png", "wait": 300, "actions": [
      { "clickText": "Πέμπτη" }, { "wait": 400 },
      { "longpress": "[data-meal='thu-lunch']", "ms": 700 },
      { "scroll": { "selector": ".ios-scroll", "y": 600 } },
      { "drag": { "from": [380, 400], "to": [120, 400], "steps": 12 } },
      { "press": "Escape" },
      { "eval": "__fm.nav.toast('Γεια')" }
  ] }
]
```

Flags: `--wait ms`, `--click css`, `--click-text text`, `--no-defaults`, `--dark-os`, `--reduced-motion`.
In dev, `window.__fm = { nav, actions, getState }` is available for `eval` actions.
Then look at the PNGs with the Read tool, in light + dark and EL + EN.

---

## 11. Gotchas

- Windows paths are case-insensitive: never create two files whose names differ only in case.
- Import the shell API from `'../../app'` (→ `src/app/index.ts`) and the kit from `'../../ui'`.
- `src/data` imports use explicit `.ts` extensions internally — that is fine; from features import `'../../data'`.
- Overlays (sheets, toasts, banners, menus) render inside the phone; don't portal to `document.body`.
- Don't add hover-only affordances; `hover:` in Tailwind v4 is already gated to real hover devices.
- Inputs: 16 px font minimum (iOS zoom). Hit targets ≥ 44 px (`before:` extension trick is used in the kit).
- Data safety: never show a dish with an allergen to an allergic member; use `SafeBadge` / `isSafeFor`.
- GitHub Pages serves the app under `/familymenu-ai/` (`.github/workflows/deploy.yml` builds with `--base`). Files from `public/` go through `asset('/images/…')` from the kit; never write a bare `'/…'` path in `src`. Data keeps the root paths (`/images/food/<id>.jpg`): `FoodImage` resolves them. Test with `node scripts/shot.mjs --base /familymenu-ai/ …`.
