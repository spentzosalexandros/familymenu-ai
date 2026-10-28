import type {
  DayId,
  FeedbackEntry,
  FoodTag,
  IngredientId,
  Insight,
  L10n,
  Lang,
  LearningResult,
  MemberId,
  PlannedMeal,
  Preference,
  StoreId,
} from '../data/types'

export type ThemeSetting = 'light' | 'dark' | 'auto'
export type Palette = 'olive' | 'tomato' | 'aegean'
export const PALETTES: Palette[] = ['olive', 'tomato', 'aegean']

export type TabId = 'today' | 'week' | 'shop' | 'family'
export const TABS: TabId[] = ['today', 'week', 'shop', 'family']

/** Screens pushed on a tab's navigation stack. */
export type PushScreenId = 'recipe' | 'child'
/** Sheets (BUILD-SPEC §3) + the presenter controls sheet used on phones + the UI-kit gallery (dev aid). */
export type SheetId = 'swap' | 'compare' | 'share' | 'feedback' | 'profile' | 'presenter' | 'kit'
/** Full-screen modals. */
export type ModalId = 'cook' | 'recap'

export type Params = Record<string, string | undefined>
export type Detent = 'medium' | 'large'

export type RouteEntry = { key: string; screen: PushScreenId; params: Params }

export type SheetOptions = {
  /** Allowed detents, smallest first. Default comes from the registry. */
  detents?: Detent[]
  /** Starting detent. */
  initial?: Detent
  /** false → no swipe/scrim dismiss (still closable by code). */
  dismissible?: boolean
}

export type Presented =
  | ({ key: string; kind: 'sheet'; id: SheetId; params: Params } & Required<SheetOptions>)
  | { key: string; kind: 'modal'; id: ModalId; params: Params }

/** Anything you can navigate to in one go (deep links, banners, journeys). */
export type NavTarget = {
  tab?: TabId
  /** Push this screen on the tab (after resetting the tab to its root when `reset` is true). */
  screen?: PushScreenId
  /** Params of the pushed screen — or, without `screen`, props for the tab's root (e.g. { day: 'thu' }). */
  params?: Params
  sheet?: SheetId
  sheetParams?: Params
  sheetOptions?: SheetOptions
  modal?: ModalId
  modalParams?: Params
  /** Pop the tab to its root and close all presentations first. Default true. */
  reset?: boolean
}

export type Banner = {
  key: string
  title: L10n | string
  body: L10n | string
  /** Small time label on the right, default "τώρα". */
  time?: L10n | string
  /** Emoji shown instead of the app icon (optional). */
  icon?: string
  target?: NavTarget
  /** ms before auto-hide (default 6000, 0 = stay). */
  duration?: number
}

export type AlertAction = {
  label: L10n | string
  style?: 'default' | 'cancel' | 'destructive'
  /** Bold "preferred" action. */
  preferred?: boolean
  onPress?: () => void
}
export type AlertState = {
  key: string
  title: L10n | string
  message?: L10n | string
  actions: AlertAction[]
}

export type StatusBarStyle = 'light' | 'dark'

export const ONBOARDING_STEPS = [
  'welcome',
  'members',
  'kids-taste',
  'family-taste',
  'allergies',
  'meals',
  'budget',
  'location',
  'generating',
  'ready',
  'paywall',
] as const
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

export type TasteChange = { memberId: MemberId; tag: FoodTag; from: Preference; to: Preference }

export type Settings = {
  lang: Lang
  theme: ThemeSetting
  palette: Palette
}

export type Prefs = {
  /** Weekly budget in € (starts at family.budget). */
  budget: number
  /** Stores the family shops at (onboarding / profile). */
  stores: StoreId[]
  /** Feedback reminder notification. */
  feedbackReminder: boolean
  /** "21:00" */
  reminderTime: string
}

export type DemoState = {
  onboarding: { done: boolean; step: OnboardingStep }
  prefs: Prefs
  /** 0 = demo week (26 Oct – 1 Nov), 1 = next week after the Sunday recap. */
  weekIndex: 0 | 1
  plan: PlannedMeal[]
  /** Planned-meal ids to highlight (after a swap, feedback or a regenerated / adapted plan). */
  highlight: string[]
  /** Meals that show a "προσαρμόστηκε" badge (next week). */
  adapted: string[]
  regenCount: number
  shopping: { selectedStore: StoreId | null; checked: IngredientId[]; pantry: IngredientId[] }
  feedback: {
    /** Feedback the user submitted in this demo session. */
    entries: FeedbackEntry[]
    insights: Insight[]
    tasteChanges: TasteChange[]
    /** Planned-meal ids still waiting for feedback. */
    pending: string[]
    last: LearningResult | null
  }
  clock: { day: DayId; minutes: number }
  subscription: { status: 'none' | 'trial'; trialStart: string | null }
}

export type NavState = {
  tab: TabId
  /** Visited tabs (their stacks are mounted lazily). */
  visited: TabId[]
  stacks: Record<TabId, RouteEntry[]>
  /** Props for a tab's root screen (e.g. WeekScreen { day }). Set via navigate({ tab, params }). */
  rootParams: Partial<Record<TabId, Params>>
  presented: Presented[]
  banner: Banner | null
  alert: AlertState | null
  statusBar: { id: string; style: StatusBarStyle }[]
  tabBadges: Partial<Record<TabId, boolean>>
}
