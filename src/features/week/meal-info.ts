import { useCallback, useMemo } from 'react'
import { childIds, getRecipe } from '../../data'
import type { MemberId } from '../../data/types'
import { useChildTaste } from '../../store'

/** Which children love a recipe, using the live taste profiles (feedback moves included). */
export function useKidLoves(): (recipeId: string) => MemberId[] {
  const nikos = useChildTaste('nikos')
  const eleni = useChildTaste('eleni')
  const loves = useMemo(() => {
    const map: Partial<Record<MemberId, Set<string>>> = {
      nikos: new Set(nikos.filter((f) => f.pref === 'love').map((f) => f.tag)),
      eleni: new Set(eleni.filter((f) => f.pref === 'love').map((f) => f.tag)),
    }
    return map
  }, [nikos, eleni])
  return useCallback(
    (recipeId: string) => {
      const r = getRecipe(recipeId)
      if (!r) return []
      return childIds.filter((c) => r.foodTags.some((tag) => loves[c]?.has(tag)))
    },
    [loves],
  )
}
