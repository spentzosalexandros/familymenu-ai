import { useEffect, useId } from 'react'
import type { StatusBarStyle } from '../store'
import { getState } from '../store'

/**
 * Ask for light (white) or dark status-bar text while this component is mounted and `active`,
 * e.g. over a dark hero photo: useStatusBarStyle('light', heroVisible). The last request wins.
 */
export function useStatusBarStyle(style: StatusBarStyle, active = true) {
  const id = useId()
  useEffect(() => {
    if (!active) return
    getState().pushStatusBar(id, style)
    return () => getState().removeStatusBar(id)
  }, [id, style, active])
}
