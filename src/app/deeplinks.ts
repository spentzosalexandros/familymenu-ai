import type { DayId } from '../data/types'
import type { Detent, ModalId, OnboardingStep, Params, PushScreenId, SheetId, TabId } from '../store'
import { ONBOARDING_STEPS, PALETTES, TABS, getState } from '../store'
import { notifyFeedback } from './nav'

/**
 * Deep links (query string) — any state can be opened / screenshotted directly:
 *
 *   ?tab=week                         tab
 *   ?tab=week&weekday=thu             tab root params (WeekScreen { day })
 *   ?screen=recipe&id=pastitsio       pushed screen + params (tab inferred: child → family)
 *   ?sheet=swap&mealId=tue-lunch      sheet + params   (&detent=medium|large)
 *   ?modal=cook&id=chicken-giouvetsi  full-screen modal + params
 *   ?onboarding=budget | done         onboarding step / skip onboarding
 *   ?theme=dark|light|auto  ?lang=en  ?palette=olive|tomato|aegean
 *   ?frame=0|1                        force full-screen / iPhone frame
 *   ?time=16:30&day=sun               demo clock (status bar + "today")
 *   ?notify=tue-lunch                 drop the feedback notification banner
 *   ?reset=1                          wipe the saved demo first (handled by the store)
 *
 * Any other key is passed as a param to the screen / sheet / modal.
 * A tab/screen/sheet/modal link skips onboarding unless `onboarding` is given too.
 */
const RESERVED = new Set([
  'tab',
  'screen',
  'sheet',
  'modal',
  'onboarding',
  'theme',
  'lang',
  'palette',
  'frame',
  'time',
  'day',
  'notify',
  'reset',
  'detent',
  'weekday',
  'wait',
])
const DAYS: DayId[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const SCREENS: PushScreenId[] = ['recipe', 'child']
const SHEETS: SheetId[] = ['swap', 'compare', 'share', 'feedback', 'profile', 'presenter', 'kit']
const MODALS: ModalId[] = ['cook', 'recap']

const pick = <T extends string>(v: string | null, list: readonly T[]): T | undefined =>
  v && (list as readonly string[]).includes(v) ? (v as T) : undefined

/** Apply the URL's state to the store. Call once before the first render. */
export function applyDeepLink(search = location.search) {
  const q = new URLSearchParams(search)
  const s = getState()

  const theme = pick(q.get('theme'), ['light', 'dark', 'auto'] as const)
  if (theme) s.setTheme(theme)
  const lang = pick(q.get('lang'), ['el', 'en'] as const)
  if (lang) s.setLang(lang)
  const palette = pick(q.get('palette'), PALETTES)
  if (palette) s.setPalette(palette)

  const onb = q.get('onboarding')
  if (onb === 'done') {
    if (!s.onboarding.done) s.completeOnboarding()
  } else {
    const step = pick(onb, ONBOARDING_STEPS as unknown as OnboardingStep[])
    if (step) s.restartOnboarding(step)
  }

  const day = pick(q.get('day'), DAYS)
  const time = q.get('time') ?? undefined
  if (day || time) s.setClock({ day, time })

  const params: Params = {}
  q.forEach((v, k) => {
    if (!RESERVED.has(k)) params[k] = v
  })

  const tab = pick(q.get('tab'), TABS) as TabId | undefined
  const screen = pick(q.get('screen'), SCREENS)
  const sheet = pick(q.get('sheet'), SHEETS)
  const modal = pick(q.get('modal'), MODALS)
  const detent = pick(q.get('detent'), ['medium', 'large'] as const) as Detent | undefined
  const weekday = pick(q.get('weekday'), DAYS)

  if (tab || screen || sheet || modal) {
    if (!onb && !getState().onboarding.done) getState().completeOnboarding()
    getState().navigate({
      tab: tab ?? (screen === 'child' ? 'family' : undefined),
      screen,
      params: screen ? params : weekday ? { day: weekday } : undefined,
      sheet,
      sheetParams: params,
      sheetOptions: detent ? { initial: detent } : undefined,
      modal,
      modalParams: params,
    })
  }

  const notify = q.get('notify')
  if (notify) {
    if (!onb && !getState().onboarding.done) getState().completeOnboarding()
    window.setTimeout(() => notifyFeedback(notify, { duration: 15000 }), 350)
  }
}
