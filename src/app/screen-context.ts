import { createContext, useContext } from 'react'
import type { RefObject } from 'react'
import type { Detent, TabId } from '../store'

export type ScreenContainer = 'stack' | 'sheet' | 'modal' | 'onboarding'

export type ScreenCtxValue = {
  container: ScreenContainer
  /** Tab that owns this screen (stack screens). */
  tab?: TabId
  /** Unique key of the route / presentation. */
  routeKey: string
  /** 0 = tab root. */
  depth: number
  /** Top-most screen of its stack / presentation. */
  isTop: boolean
  /** Title of the screen underneath (back button label). */
  prevTitle?: string
  /** Screens report their title so the next screen's back button can show it. */
  setTitle: (title: string) => void
  /** Pop (stack, depth > 0), close the sheet or the modal. */
  close: () => void
  /** Pixels to keep clear at the bottom (tab bar + home indicator). */
  bottomInset: number
  sheet?: {
    detent: Detent
    detents: Detent[]
    /** Move to the large detent. */
    expand: () => void
    /** The sheet's scroll container (the Screen scaffold uses it for its header). */
    scrollRef: RefObject<HTMLDivElement | null>
  }
}

export const ScreenCtx = createContext<ScreenCtxValue>({
  container: 'onboarding',
  routeKey: 'root',
  depth: 0,
  isTop: true,
  setTitle: () => {},
  close: () => {},
  bottomInset: 0,
})

/** Where the current screen lives and how to close it. */
export const useScreen = () => useContext(ScreenCtx)
