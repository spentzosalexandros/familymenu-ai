import { useEffect, useSyncExternalStore } from 'react'
import { useAppStore } from '../store/store'

const mql = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null
const subscribe = (cb: () => void) => {
  mql?.addEventListener('change', cb)
  return () => mql?.removeEventListener('change', cb)
}
const systemDark = () => !!mql?.matches

/** 'light' | 'dark' after resolving 'auto' against the OS setting. */
export function useResolvedTheme(): 'light' | 'dark' {
  const setting = useAppStore((s) => s.settings.theme)
  const dark = useSyncExternalStore(subscribe, systemDark, () => false)
  return setting === 'auto' ? (dark ? 'dark' : 'light') : setting
}

/** Applies theme / palette / lang to <html> (tokens are keyed off data attributes). */
export function useApplyTheme() {
  const theme = useResolvedTheme()
  const palette = useAppStore((s) => s.settings.palette)
  const lang = useAppStore((s) => s.settings.lang)
  useEffect(() => {
    const d = document.documentElement
    const changed = d.dataset.theme !== theme || d.dataset.palette !== palette
    if (changed && d.dataset.ready) {
      // Ease the switch instead of an abrupt brightness jump.
      d.classList.add('theme-transition')
      window.setTimeout(() => d.classList.remove('theme-transition'), 350)
    }
    d.dataset.theme = theme
    d.dataset.palette = palette
    d.dataset.ready = '1'
    const bg = getComputedStyle(d).getPropertyValue('--bg-grouped').trim()
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg || '#000'))
  }, [theme, palette])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
}
