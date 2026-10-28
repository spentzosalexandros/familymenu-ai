import { useCallback } from 'react'
import type { Lang } from '../data/types'
import { useAppStore } from '../store/store'
import { translate } from './format'
import type { PluralForms, Text, Vars } from './format'
import { plural } from './format'

export * from './format'
export { S } from './strings'

/** Current UI language ('el' | 'en'). */
export const useLang = (): Lang => useAppStore((s) => s.settings.lang)

export type TFunction = (text: Text | null | undefined, vars?: Vars) => string

/**
 * const t = useT()
 * t({ el: 'Σήμερα', en: 'Today' })            → 'Σήμερα'
 * t(recipe.name)                               → L10n from src/data
 * t({ el: '{n} γεύματα', en: '{n} meals' }, { n: 28 })
 */
export function useT(): TFunction {
  const lang = useLang()
  return useCallback<TFunction>((text, vars) => translate(text, lang, vars), [lang])
}

/** Plural helper bound to the current language: tp(3, { el: {one, other}, en: {one, other} }) */
export function useTp() {
  const lang = useLang()
  return useCallback(
    (n: number, forms: { el: PluralForms; en: PluralForms }, vars?: Vars) => plural(n, forms, lang, vars),
    [lang],
  )
}

/** Non-hook translate for event handlers / non-React code (reads the current language). */
export function tNow(text: Text | null | undefined, vars?: Vars) {
  return translate(text, useAppStore.getState().settings.lang, vars)
}
