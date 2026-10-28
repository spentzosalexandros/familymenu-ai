import { aisles, ingredients, storeById, tr } from '../../data'
import type { Aisle, GroceryItem, Lang, StoreId } from '../../data/types'
import { formatEUR } from '../../i18n'
import { T } from './strings'

export const sum = (items: GroceryItem[], store: StoreId) =>
  Math.round(items.reduce((acc, it) => acc + it.price[store], 0) * 100) / 100

/** Group items by aisle, keeping the data's walking order (groceryList is already sorted). */
export function byAisle(items: GroceryItem[]): { aisle: Aisle; items: GroceryItem[] }[] {
  const out: { aisle: Aisle; items: GroceryItem[] }[] = []
  for (const it of items) {
    const a = ingredients[it.ingredientId].aisle
    const last = out[out.length - 1]
    if (last && last.aisle === a) last.items.push(it)
    else out.push({ aisle: a, items: [it] })
  }
  return out
}

/** "στον Σκλαβενίτη" · "στο Lidl" · "at Lidl": natural preposition + article per chain. */
export function atStore(id: StoreId, lang: Lang): string {
  const name = storeById(id).name
  if (lang === 'en') return `at ${name}`
  return id === 'sklavenitis' ? 'στον Σκλαβενίτη' : `στο ${name}`
}

export const storeName = (id: StoreId) => storeById(id).name

/** Plain-text list for share / copy. */
export function listText(items: GroceryItem[], store: StoreId, lang: Lang, weekLabel: string): string {
  const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m)
  const lines: string[] = [fill(T.textHeader[lang], { week: weekLabel }), '']
  for (const group of byAisle(items)) {
    lines.push(`${aisles[group.aisle].emoji} ${tr(aisles[group.aisle].label, lang)}`)
    for (const it of group.items) {
      const ing = ingredients[it.ingredientId]
      lines.push(`• ${tr(ing.name, lang)} (${it.packs} × ${tr(ing.pack.label, lang)})`)
    }
    lines.push('')
  }
  lines.push(fill(T.textFooter[lang], { total: formatEUR(sum(items, store), lang), at: atStore(store, lang) }))
  return lines.join('\n')
}
