import { use } from 'react'
import type { ComponentType } from 'react'
import type { L10n } from '../data/types'
import { S } from '../i18n/strings'
import type { ModalId, PushScreenId, SheetId, TabId } from '../store'
import { KitGallery } from '../ui/KitGallery'
import { PresenterSheet } from './Presenter'

/**
 * Route registry: ids from BUILD-SPEC §3 → feature exports.
 * Lazy per feature (one chunk per feature folder) + an ErrorBoundary per route (RouteBoundary),
 * so a broken feature never takes the others down.
 * Route params are passed as props: <RecipeScreen id="…" mealId="…" />.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any
type Loader = () => Promise<Record<string, unknown>>
type RouteComponent = ComponentType<AnyProps> & { preload: () => Promise<void> }

/**
 * Like React.lazy, but once the chunk has loaded it renders synchronously (no Suspense flash),
 * so a pushed screen slides in with its content already there. A failed load can be retried.
 */
function lazyNamed(loader: Loader, name: string): RouteComponent {
  let Comp: ComponentType<AnyProps> | null = null
  type Tracked = Promise<void> & { status?: string; value?: unknown; reason?: unknown }
  let promise: Tracked | null = null
  const preload = () => {
    if (!promise) {
      const p: Tracked = loader().then((mod) => {
        const C = mod[name] as ComponentType<AnyProps> | undefined
        if (!C) throw new Error(`Feature export "${name}" is missing`)
        Comp = C
      })
      // Mark the promise like React does, so use() returns synchronously once it has resolved.
      p.then(
        () => {
          p.status = 'fulfilled'
          p.value = undefined
        },
        (err) => {
          p.status = 'rejected'
          p.reason = err
          promise = null // allow a retry
        },
      )
      promise = p
    }
    return promise
  }
  function Lazy(props: AnyProps) {
    use(preload() as Promise<void>)
    const C = Comp!
    return <C {...props} />
  }
  Lazy.displayName = `Route(${name})`
  Lazy.preload = preload
  return Lazy as RouteComponent
}

const onboarding = () => import('../features/onboarding') as Promise<Record<string, unknown>>
const today = () => import('../features/today') as Promise<Record<string, unknown>>
const recipe = () => import('../features/recipe') as Promise<Record<string, unknown>>
const week = () => import('../features/week') as Promise<Record<string, unknown>>
const shop = () => import('../features/shop') as Promise<Record<string, unknown>>
const familyF = () => import('../features/family') as Promise<Record<string, unknown>>
const profile = () => import('../features/profile') as Promise<Record<string, unknown>>

export const OnboardingFlow = lazyNamed(onboarding, 'OnboardingFlow')

export const TAB_ROOTS: Record<TabId, { component: RouteComponent; title: L10n }> = {
  today: { component: lazyNamed(today, 'TodayScreen'), title: S.tabs.today },
  week: { component: lazyNamed(week, 'WeekScreen'), title: S.tabs.week },
  shop: { component: lazyNamed(shop, 'ShopScreen'), title: S.tabs.shop },
  family: { component: lazyNamed(familyF, 'FamilyScreen'), title: S.tabs.family },
}

export const PUSH_SCREENS: Record<PushScreenId, RouteComponent> = {
  recipe: lazyNamed(recipe, 'RecipeScreen'),
  child: lazyNamed(familyF, 'ChildProfileScreen'),
}

export const SHEETS: Record<SheetId, RouteComponent> = {
  swap: lazyNamed(week, 'SwapSheet'),
  compare: lazyNamed(shop, 'CompareSheet'),
  share: lazyNamed(shop, 'ShareSheet'),
  feedback: lazyNamed(familyF, 'FeedbackSheet'),
  profile: lazyNamed(profile, 'ProfileScreen'),
  presenter: Object.assign((props: AnyProps) => <PresenterSheet {...props} />, { preload: () => Promise.resolve() }),
  kit: Object.assign(() => <KitGallery />, { preload: () => Promise.resolve() }),
}

export const MODALS: Record<ModalId, RouteComponent> = {
  cook: lazyNamed(recipe, 'CookMode'),
  recap: lazyNamed(familyF, 'RecapScreen'),
}

/** Warm up every route after first paint so pushes / sheets never wait on a chunk. */
export function preloadFeatures() {
  const all: RouteComponent[] = [
    OnboardingFlow,
    ...Object.values(TAB_ROOTS).map((r) => r.component),
    ...Object.values(PUSH_SCREENS),
    ...Object.values(SHEETS),
    ...Object.values(MODALS),
  ]
  for (const c of all) c.preload().catch(() => {})
}
