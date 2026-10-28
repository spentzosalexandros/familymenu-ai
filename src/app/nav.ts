import { recipes } from '../data'
import { S } from '../i18n/strings'
import type {
  AlertAction,
  Banner,
  ModalId,
  NavTarget,
  Params,
  PushScreenId,
  SheetId,
  SheetOptions,
  TabId,
} from '../store'
import { getState, makeModal, makeSheet, uid } from '../store'
import { showToast } from './Toasts'
import type { ToastOptions } from './Toasts'

/**
 * Navigation API — plain functions, callable from anywhere (event handlers, effects, other modules).
 *
 *   push('recipe', { id: 'chicken-giouvetsi', mealId: 'tue-lunch' })
 *   pop()
 *   openSheet('swap', { mealId: 'tue-lunch' })            // detents from the registry defaults
 *   openSheet('share', {}, { detents: ['medium'], initial: 'medium' })
 *   closeSheet()                                           // closes the top-most sheet
 *   openModal('cook', { id: 'chicken-giouvetsi' })
 *   toast('Η αλλαγή έγινε', { action: { label: S.undo, onClick: undo } })
 *   alert({ title, message, actions: [{ label: S.cancel, style: 'cancel' }, { label: 'OK', onPress }] })
 *   notify({ title, body, target: { sheet: 'feedback', sheetParams: { mealId: 'tue-lunch' } } })
 */

export function setTab(tab: TabId) {
  const s = getState()
  if (s.tab === tab) {
    // iOS: tapping the active tab pops to root, then scrolls to top.
    if (s.stacks[tab].length) s.popToRoot(tab)
    else emitScrollTop(tab)
    return
  }
  s.setTab(tab)
}

/** Push a screen on the active tab (or `tab`). Returns the route key. */
export function push(screen: PushScreenId, params: Params = {}, tab?: TabId) {
  return getState().push(screen, params, tab)
}
export function pop(tab?: TabId) {
  getState().pop(tab)
}
export function popToRoot(tab?: TabId) {
  getState().popToRoot(tab)
}

/** Present a sheet. Returns its key (pass to closeSheet to close exactly this one). */
export function openSheet(id: SheetId, params: Params = {}, opts: SheetOptions = {}) {
  return getState().present(makeSheet(id, params, opts))
}
/** Close a sheet by key, or the top-most sheet. */
export function closeSheet(key?: string) {
  const s = getState()
  if (key) s.dismiss(key)
  else s.dismissKind('sheet')
}
export function openModal(id: ModalId, params: Params = {}) {
  return getState().present(makeModal(id, params))
}
export function closeModal(key?: string) {
  const s = getState()
  if (key) s.dismiss(key)
  else s.dismissKind('modal')
}
/** Close every sheet and modal. */
export function dismissAll() {
  getState().dismissAll()
}

/** Go anywhere in one step (tab + pushed screen + sheet/modal). Resets the tab first by default. */
export function navigate(target: NavTarget) {
  getState().navigate(target)
}

/** Open a recipe from anywhere: closes presentations and pushes it on the current tab. */
export function openRecipe(recipeId: string, mealId?: string) {
  const s = getState()
  if (s.presented.length) s.dismissAll()
  s.push('recipe', { id: recipeId, mealId })
}

// ---------- system overlays ----------

/** iOS notification banner (drops from the top of the phone). */
export function notify(b: Omit<Banner, 'key'> & { key?: string }) {
  const banner: Banner = { key: b.key ?? uid('banner'), ...b }
  getState().showBanner(banner)
  return banner.key
}

/** The scripted 16:30 push: "Πώς πήγε το γιουβέτσι;" → feedback sheet for the meal. */
export function notifyFeedback(mealId = 'tue-lunch', opts: { duration?: number } = {}) {
  const s = getState()
  const meal = s.plan.find((m) => m.id === mealId)
  const recipe = meal ? recipes[meal.recipeId] : undefined
  const scripted = mealId === 'tue-lunch'
  return notify({
    title: scripted ? S.feedbackNotif.title : S.feedbackNotif.genericTitle,
    body: scripted
      ? S.feedbackNotif.body
      : recipe
        ? { el: `${recipe.name.el} · ${S.feedbackNotif.body.el}`, en: `${recipe.name.en} · ${S.feedbackNotif.body.en}` }
        : S.feedbackNotif.body,
    target: { tab: 'today', sheet: 'feedback', sheetParams: { mealId } },
    duration: opts.duration,
  })
}

export function hideBanner() {
  getState().hideBanner()
}

export type AlertInput = {
  title: string | { el: string; en: string }
  message?: string | { el: string; en: string }
  /** Default: a single OK. Cancel-style actions go first (left) like iOS. */
  actions?: AlertAction[]
}
/** iOS alert dialog. Use sparingly — prefer a toast with undo for reversible actions. */
export function alert(a: AlertInput) {
  getState().showAlert({ key: uid('alert'), title: a.title, message: a.message, actions: a.actions?.length ? a.actions : [{ label: S.ok, preferred: true }] })
}

/** iOS-style toast inside the phone. Returns the toast id. */
export function toast(message: ToastOptions['message'], opts: Omit<ToastOptions, 'message'> = {}) {
  return showToast({ message, ...opts })
}

// ---------- tab re-select → scroll to top ----------
const scrollTopListeners = new Map<TabId, Set<() => void>>()
export function onScrollTop(tab: TabId, fn: () => void) {
  let set = scrollTopListeners.get(tab)
  if (!set) scrollTopListeners.set(tab, (set = new Set()))
  set.add(fn)
  return () => {
    set!.delete(fn)
  }
}
function emitScrollTop(tab: TabId) {
  scrollTopListeners.get(tab)?.forEach((fn) => fn())
}

/** Hook-free bundle, handy for passing around: `nav.push(...)`. */
export const nav = {
  setTab,
  push,
  pop,
  popToRoot,
  openSheet,
  closeSheet,
  openModal,
  closeModal,
  dismissAll,
  navigate,
  openRecipe,
  notify,
  notifyFeedback,
  hideBanner,
  alert,
  toast,
}
