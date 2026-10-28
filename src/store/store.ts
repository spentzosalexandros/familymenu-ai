import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  TODAY,
  applyFeedback,
  family,
  feedbackHistory,
  initialInsights,
  initialPlan,
  nextWeekPlan,
  pendingFeedback,
  recipes,
  regeneratePlan as regeneratePlanData,
  setStoreNameLang,
  stores,
  swapMeal as swapMealData,
} from '../data'
import type { DayId, FeedbackEntry, IngredientId, LearningResult, PlannedMeal, StoreId } from '../data/types'
import type {
  AlertState,
  Banner,
  DemoState,
  Detent,
  ModalId,
  NavState,
  NavTarget,
  OnboardingStep,
  Params,
  Presented,
  PushScreenId,
  Settings,
  SheetId,
  SheetOptions,
  StatusBarStyle,
  TabId,
} from './types'
import { TABS } from './types'

export const STORAGE_KEY = 'familymenu-demo-v1'
const STORAGE_VERSION = 1

/** Changes whenever the content agent's dataset changes, so stale demo state is discarded. */
const DATA_SIG = `${initialPlan.map((m) => `${m.id}:${m.recipeId}`).join('|')}#${Object.keys(recipes).length}#${stores.length}`

export const DEFAULT_CLOCK_MINUTES = 9 * 60 + 41
/** Trial started the day before the demo "today" → "6 days left". */
export const TRIAL_START = '2026-10-26'
const ALL_STORES: StoreId[] = ['sklavenitis', 'lidl', 'ab', 'mymarket']

let seq = 0
export const uid = (prefix: string) => `${prefix}-${(++seq).toString(36)}${Math.random().toString(36).slice(2, 6)}`

// ?reset=1 wipes the saved demo before the store hydrates.
try {
  if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('reset') === '1') {
    localStorage.removeItem(STORAGE_KEY)
  }
} catch {
  /* storage unavailable */
}

function freshDemo(): DemoState {
  return {
    onboarding: { done: false, step: 'welcome' },
    prefs: {
      budget: family.budget,
      stores: stores.length ? stores.map((s) => s.id) : [...ALL_STORES],
      feedbackReminder: true,
      reminderTime: '21:00',
    },
    weekIndex: 0,
    plan: initialPlan.map((m) => ({ ...m })),
    highlight: [],
    adapted: [],
    regenCount: 0,
    shopping: { selectedStore: null, checked: [], pantry: [] },
    feedback: {
      entries: [],
      insights: [...initialInsights],
      tasteChanges: [],
      pending: [...pendingFeedback],
      last: null,
    },
    clock: { day: TODAY, minutes: DEFAULT_CLOCK_MINUTES },
    subscription: { status: 'none', trialStart: null },
  }
}

function freshNav(): NavState {
  return {
    tab: 'today',
    visited: ['today'],
    stacks: { today: [], week: [], shop: [], family: [] },
    rootParams: {},
    presented: [],
    banner: null,
    alert: null,
    statusBar: [],
    tabBadges: {},
  }
}

const DEFAULT_SETTINGS: Settings = { lang: 'el', theme: 'auto', palette: 'olive' }

export type UndoFn = () => void

export type Actions = {
  // settings
  setLang: (lang: Settings['lang']) => void
  setTheme: (theme: Settings['theme']) => void
  setPalette: (palette: Settings['palette']) => void
  // onboarding
  setOnboardingStep: (step: OnboardingStep) => void
  /** Finish onboarding: starts the trial and lands on Today. */
  completeOnboarding: () => void
  restartOnboarding: (step?: OnboardingStep) => void
  // prefs
  setBudget: (budget: number) => void
  togglePreferredStore: (id: StoreId) => void
  setFeedbackReminder: (on: boolean) => void
  // plan
  /** Replace a planned meal's recipe. Meals that are leftovers of it follow. Returns undo. */
  swapMeal: (mealId: string, recipeId: string) => UndoFn
  lockMeal: (mealId: string, locked?: boolean) => void
  setEatingOut: (mealId: string, eatingOut: boolean) => UndoFn
  /** "Νέο πλάνο εβδομάδας": data-layer regeneratePlan from the demo day on (locked / leftovers / eaten-out kept). */
  regeneratePlan: () => { undo: UndoFn; changedMealIds: string[] }
  setHighlight: (mealIds: string[]) => void
  clearHighlight: () => void
  // shopping
  selectStore: (id: StoreId | null) => void
  toggleChecked: (id: IngredientId) => void
  togglePantry: (id: IngredientId) => UndoFn
  resetShopping: () => void
  // feedback
  /** Runs the scripted "AI" (applyFeedback), updates plan/insights/tastes, highlights changed meals. */
  submitFeedback: (entry: FeedbackEntry) => LearningResult
  // clock
  setClock: (c: { day?: DayId; time?: string; minutes?: number }) => void
  /** After the Sunday recap: next week's adapted plan. Returns the adapted meal ids. */
  startNextWeek: () => string[]
  // subscription
  startTrial: () => void
  // demo
  resetDemo: () => void
  // navigation (prefer the helpers in src/app/nav.ts)
  setTab: (tab: TabId) => void
  push: (screen: PushScreenId, params?: Params, tab?: TabId) => string
  pop: (tab?: TabId) => void
  popToRoot: (tab?: TabId) => void
  present: (p: Presented) => string
  /** Dismiss the presentation with this key (and everything above it), or the top one. */
  dismiss: (key?: string) => void
  dismissKind: (kind: 'sheet' | 'modal') => void
  dismissAll: () => void
  navigate: (target: NavTarget) => void
  showBanner: (b: Banner) => void
  hideBanner: (key?: string) => void
  showAlert: (a: AlertState) => void
  hideAlert: () => void
  pushStatusBar: (id: string, style: StatusBarStyle) => void
  removeStatusBar: (id: string) => void
  setTabBadge: (tab: TabId, on: boolean) => void
}

export type AppState = {
  settings: Settings
  dataSig: string
} & DemoState &
  NavState &
  Actions

type Persisted = Pick<AppState, 'settings' | 'dataSig'> & DemoState

const DEMO_KEYS: (keyof DemoState)[] = [
  'onboarding',
  'prefs',
  'weekIndex',
  'plan',
  'highlight',
  'adapted',
  'regenCount',
  'shopping',
  'feedback',
  'clock',
  'subscription',
]

function withLeftoversFollowing(plan: PlannedMeal[], mealId: string, recipeId: string): PlannedMeal[] {
  return plan.map((m) => {
    if (m.id === mealId) return { ...m, recipeId, leftoverOf: undefined, adaptedFor: undefined }
    if (m.leftoverOf === mealId) return { ...m, recipeId }
    return m
  })
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const snapshotPlan = () => {
        const { plan, highlight } = get()
        return () => set({ plan, highlight })
      }
      const tabOr = (tab?: TabId) => tab ?? get().tab

      return {
        settings: DEFAULT_SETTINGS,
        dataSig: DATA_SIG,
        ...freshDemo(),
        ...freshNav(),

        setLang: (lang) => set((s) => ({ settings: { ...s.settings, lang } })),
        setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
        setPalette: (palette) => set((s) => ({ settings: { ...s.settings, palette } })),

        setOnboardingStep: (step) => set((s) => ({ onboarding: { ...s.onboarding, step } })),
        completeOnboarding: () =>
          set((s) => ({
            onboarding: { done: true, step: s.onboarding.step },
            subscription: { status: 'trial', trialStart: s.subscription.trialStart ?? TRIAL_START },
            ...freshNav(),
          })),
        restartOnboarding: (step = 'welcome') =>
          set({ onboarding: { done: false, step }, ...freshNav() }),

        setBudget: (budget) => set((s) => ({ prefs: { ...s.prefs, budget } })),
        togglePreferredStore: (id) =>
          set((s) => {
            const has = s.prefs.stores.includes(id)
            const next = has ? s.prefs.stores.filter((x) => x !== id) : [...s.prefs.stores, id]
            return { prefs: { ...s.prefs, stores: next.length ? next : s.prefs.stores } }
          }),
        setFeedbackReminder: (on) => set((s) => ({ prefs: { ...s.prefs, feedbackReminder: on } })),

        swapMeal: (mealId, recipeId) => {
          // Data-layer swap: new AI reason, batch/leftover links kept consistent, unsafe recipes refused.
          const undo = snapshotPlan()
          set((s) => {
            const next = swapMealData(s.plan, mealId, recipeId)
            const plan = next === s.plan ? withLeftoversFollowing(s.plan, mealId, recipeId) : next
            const changed = plan.filter((m) => s.plan.find((b) => b.id === m.id)?.recipeId !== m.recipeId).map((m) => m.id)
            return { plan, highlight: changed.includes(mealId) ? changed : [mealId, ...changed] }
          })
          return undo
        },
        lockMeal: (mealId, locked) =>
          set((s) => ({
            plan: s.plan.map((m) => (m.id === mealId ? { ...m, locked: locked ?? !m.locked } : m)),
          })),
        setEatingOut: (mealId, eatingOut) => {
          const undo = snapshotPlan()
          set((s) => ({ plan: s.plan.map((m) => (m.id === mealId ? { ...m, eatingOut } : m)) }))
          return undo
        },
        regeneratePlan: () => {
          // Data-layer regenerate: from the demo day on, within budget, locked / leftover / eaten-out kept.
          const undo = snapshotPlan()
          const { plan, regenCount, clock } = get()
          const diff = (next: PlannedMeal[]) =>
            next.filter((m) => plan.find((b) => b.id === m.id)?.recipeId !== m.recipeId).map((m) => m.id)
          const seed = (regenCount ?? 0) + 1
          let next = regeneratePlanData(plan, seed, clock.day)
          if (!diff(next).length) next = regeneratePlanData(plan, seed + 1, clock.day)
          const changed = diff(next)
          set({ plan: next, highlight: changed, regenCount: seed })
          return { undo, changedMealIds: changed }
        },
        setHighlight: (mealIds) => set({ highlight: mealIds }),
        clearHighlight: () => set({ highlight: [] }),

        selectStore: (id) => set((s) => ({ shopping: { ...s.shopping, selectedStore: id } })),
        toggleChecked: (id) =>
          set((s) => {
            const has = s.shopping.checked.includes(id)
            return {
              shopping: {
                ...s.shopping,
                checked: has ? s.shopping.checked.filter((x) => x !== id) : [...s.shopping.checked, id],
              },
            }
          }),
        togglePantry: (id) => {
          const prev = get().shopping
          set((s) => {
            const has = s.shopping.pantry.includes(id)
            return {
              shopping: {
                ...s.shopping,
                pantry: has ? s.shopping.pantry.filter((x) => x !== id) : [...s.shopping.pantry, id],
                checked: s.shopping.checked.filter((x) => x !== id),
              },
            }
          })
          return () => set({ shopping: prev })
        },
        resetShopping: () => set({ shopping: { selectedStore: null, checked: [], pantry: [] } }),

        submitFeedback: (entry) => {
          const s = get()
          const result = applyFeedback(s.plan, entry)
          set({
            plan: result.plan,
            highlight: result.changedMealIds,
            feedback: {
              entries: [...s.feedback.entries.filter((e) => e.plannedMealId !== entry.plannedMealId), entry],
              insights: [...result.insights, ...s.feedback.insights.filter((i) => !result.insights.some((r) => r.id === i.id))],
              tasteChanges: [...s.feedback.tasteChanges, ...result.tasteChanges],
              pending: s.feedback.pending.filter((id) => id !== entry.plannedMealId),
              last: result,
            },
          })
          return result
        },

        setClock: ({ day, time, minutes }) =>
          set((s) => {
            let mins = minutes ?? s.clock.minutes
            if (time) {
              const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim())
              if (m) mins = Number(m[1]) * 60 + Number(m[2])
            }
            return { clock: { day: day ?? s.clock.day, minutes: mins } }
          }),

        startNextWeek: () => {
          const s = get()
          const res = nextWeekPlan(s.plan, [...feedbackHistory, ...s.feedback.entries])
          set({
            weekIndex: 1,
            plan: res.plan,
            adapted: res.changedMealIds,
            highlight: res.changedMealIds,
            shopping: { selectedStore: null, checked: [], pantry: [] },
            feedback: { ...s.feedback, pending: [], last: null },
            clock: { day: 'mon', minutes: DEFAULT_CLOCK_MINUTES },
          })
          return res.changedMealIds
        },

        startTrial: () => set({ subscription: { status: 'trial', trialStart: TRIAL_START } }),

        resetDemo: () =>
          set((s) => {
            const fresh = freshDemo()
            return {
              ...fresh,
              onboarding: { done: s.onboarding.done, step: 'welcome' },
              subscription: s.onboarding.done ? { status: 'trial', trialStart: TRIAL_START } : fresh.subscription,
              ...freshNav(),
            }
          }),

        // ---------- navigation ----------
        setTab: (tab) =>
          set((s) => ({ tab, visited: s.visited.includes(tab) ? s.visited : [...s.visited, tab] })),
        push: (screen, params = {}, tab) => {
          const t = tabOr(tab)
          const key = uid(screen)
          set((s) => ({
            stacks: { ...s.stacks, [t]: [...s.stacks[t], { key, screen, params }] },
            visited: s.visited.includes(t) ? s.visited : [...s.visited, t],
          }))
          return key
        },
        pop: (tab) => {
          const t = tabOr(tab)
          set((s) => ({ stacks: { ...s.stacks, [t]: s.stacks[t].slice(0, -1) } }))
        },
        popToRoot: (tab) => {
          const t = tabOr(tab)
          set((s) => ({ stacks: { ...s.stacks, [t]: [] } }))
        },
        present: (p) => {
          set((s) => ({ presented: [...s.presented, p] }))
          return p.key
        },
        dismiss: (key) =>
          set((s) => {
            if (!s.presented.length) return {}
            const i = key ? s.presented.findIndex((p) => p.key === key) : s.presented.length - 1
            if (i < 0) return {}
            return { presented: s.presented.slice(0, i) }
          }),
        dismissKind: (kind) =>
          set((s) => {
            for (let i = s.presented.length - 1; i >= 0; i--) {
              if (s.presented[i].kind === kind) return { presented: s.presented.slice(0, i) }
            }
            return {}
          }),
        dismissAll: () => set({ presented: [] }),
        navigate: (target) => {
          const s = get()
          const tab = target.tab ?? (target.screen === 'child' ? 'family' : s.tab)
          const reset = target.reset !== false
          const stacks = { ...s.stacks }
          if (reset) stacks[tab] = []
          if (target.screen) stacks[tab] = [...stacks[tab], { key: uid(target.screen), screen: target.screen, params: target.params ?? {} }]
          let presented: Presented[] = reset ? [] : [...s.presented]
          if (target.sheet) presented = [...presented, makeSheet(target.sheet, target.sheetParams, target.sheetOptions)]
          if (target.modal) presented = [...presented, makeModal(target.modal, target.modalParams)]
          const rootParams = !target.screen && target.params ? { ...s.rootParams, [tab]: target.params } : s.rootParams
          set({ tab, stacks, rootParams, presented, visited: s.visited.includes(tab) ? s.visited : [...s.visited, tab] })
        },
        showBanner: (b) => set({ banner: b }),
        hideBanner: (key) => set((s) => (!key || s.banner?.key === key ? { banner: null } : {})),
        showAlert: (a) => set({ alert: a }),
        hideAlert: () => set({ alert: null }),
        pushStatusBar: (id, style) =>
          set((s) => ({ statusBar: [...s.statusBar.filter((x) => x.id !== id), { id, style }] })),
        removeStatusBar: (id) => set((s) => ({ statusBar: s.statusBar.filter((x) => x.id !== id) })),
        setTabBadge: (tab, on) => set((s) => ({ tabBadges: { ...s.tabBadges, [tab]: on } })),
      }
    },
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): Persisted => {
        const out = { settings: s.settings, dataSig: s.dataSig } as Persisted
        for (const k of DEMO_KEYS) (out as Record<string, unknown>)[k] = s[k]
        return out
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Persisted>
        const settings = { ...current.settings, ...(p.settings ?? {}) }
        // Dataset changed (e.g. the stub was replaced by real data): keep settings + onboarding only.
        if (p.dataSig !== DATA_SIG) {
          return {
            ...current,
            settings,
            onboarding: p.onboarding ?? current.onboarding,
            subscription: p.subscription ?? current.subscription,
          }
        }
        const demo: Partial<DemoState> = {}
        for (const k of DEMO_KEYS) if (p[k] !== undefined) (demo as Record<string, unknown>)[k] = p[k]
        return { ...current, ...demo, settings }
      },
    },
  ),
)

// Store chain names follow the UI language (see setStoreNameLang in src/data/stores.ts).
setStoreNameLang(useAppStore.getState().settings.lang)
useAppStore.subscribe((s) => setStoreNameLang(s.settings.lang))

// ---------- presentation factories (registry defaults applied in src/app/nav.ts) ----------
export const SHEET_DEFAULTS: Record<SheetId, { detents: Detent[]; initial: Detent }> = {
  swap: { detents: ['medium', 'large'], initial: 'large' },
  compare: { detents: ['medium', 'large'], initial: 'large' },
  share: { detents: ['medium', 'large'], initial: 'medium' },
  feedback: { detents: ['large'], initial: 'large' },
  profile: { detents: ['large'], initial: 'large' },
  presenter: { detents: ['medium', 'large'], initial: 'large' },
  kit: { detents: ['medium', 'large'], initial: 'large' },
}

export function makeSheet(id: SheetId, params: Params = {}, opts: SheetOptions = {}): Presented {
  const d = SHEET_DEFAULTS[id]
  const detents = opts.detents ?? d.detents
  const initial = opts.initial && detents.includes(opts.initial) ? opts.initial : detents.includes(d.initial) ? d.initial : detents[detents.length - 1]
  return { key: uid(id), kind: 'sheet', id, params, detents, initial, dismissible: opts.dismissible ?? true }
}

export function makeModal(id: ModalId, params: Params = {}): Presented {
  return { key: uid(id), kind: 'modal', id, params }
}

export const getState = useAppStore.getState

/** Stable action functions (they never change identity). `actions.swapMeal(id, recipeId)` */
export const actions: Actions = (() => {
  const s = useAppStore.getState()
  const keys = Object.keys(s).filter((k) => typeof (s as Record<string, unknown>)[k] === 'function') as (keyof Actions)[]
  return Object.fromEntries(keys.map((k) => [k, s[k]])) as Actions
})()

export { TABS }
