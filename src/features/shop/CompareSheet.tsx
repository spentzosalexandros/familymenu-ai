import { ArrowsSplitIcon, CheckIcon } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { PRICE_DISCLAIMER, bestSplit, ingredients, storeById, storeIds, stores } from '../../data'
import type { StoreId } from '../../data/types'
import { formatEUR, formatNumber, useLang, useT } from '../../i18n'
import { actions, useCheapestStore, useGroceryList, usePantry, useSelectedStore, useStoreTotals } from '../../store'
import { AnimatedNumber, Badge, Card, ListGroup, ListRow, Screen } from '../../ui'
import { atStore } from './shared'
import { T } from './strings'

/** Store comparison: totals per store, best two-store split, the biggest item differences. */
export function CompareSheet() {
  const t = useT()
  const lang = useLang()
  const items = useGroceryList()
  const pantry = usePantry()
  const totals = useStoreTotals()
  const cheapest = useCheapestStore()
  const selected = useSelectedStore()

  const split = useMemo(() => bestSplit(items, pantry), [items, pantry])
  const splitStores = (Object.keys(split.byStore) as StoreId[]).sort(
    (a, b) => (split.byStore[b]?.length ?? 0) - (split.byStore[a]?.length ?? 0),
  )
  const saving = Math.max(0, totals[cheapest] - split.total)

  const diffs = useMemo(() => {
    return items
      .filter((it) => !pantry.includes(it.ingredientId))
      .map((it) => {
        const sorted = [...storeIds].sort((a, b) => it.price[a] - it.price[b])
        const cheap = sorted[0]
        const dear = sorted[sorted.length - 1]
        return { it, cheap, dear, diff: Math.round((it.price[dear] - it.price[cheap]) * 100) / 100 }
      })
      .sort((a, b) => b.diff - a.diff)
      .slice(0, 5)
  }, [items, pantry])

  const ranked = [...stores].sort((a, b) => totals[a.id] - totals[b.id])

  return (
    <Screen title={t(T.compareTitle)}>
      <div className="space-y-7 pb-6">
        <p className="px-5 text-subhead text-label-2">{t(T.compareIntro)}</p>

        <ListGroup header={t(T.perStore)} footer={t(PRICE_DISCLAIMER)}>
          {ranked.map((s) => {
            const pct = totals[cheapest] > 0 ? ((totals[s.id] - totals[cheapest]) / totals[cheapest]) * 100 : 0
            return (
              <ListRow
                key={s.id}
                onPress={() => actions.selectStore(s.id)}
                icon={<span className="block size-3 rounded-full" style={{ background: s.color }} />}
                title={
                  <span className="flex items-center gap-2">
                    {s.name}
                    {s.id === cheapest && <Badge tone="success">{t(T.cheapest)}</Badge>}
                  </span>
                }
                subtitle={
                  <span className="tnum">
                    {t(T.km, { d: formatNumber(s.distanceKm, lang, 1, 1) })}
                    {s.id !== cheapest && ` · +${formatNumber(Math.round(pct * 10) / 10, lang, 1, 1)}%`}
                  </span>
                }
                accessory={
                  <span className="flex items-center gap-2">
                    <AnimatedNumber value={totals[s.id]} format="eur" className="text-body font-semibold text-label" />
                    <span className="flex w-5 justify-center text-primary">{s.id === selected && <CheckIcon weight="bold" />}</span>
                  </span>
                }
              />
            )
          })}
        </ListGroup>

        <section className="px-4">
          <Card className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-tint text-[19px] text-primary">
                <ArrowsSplitIcon weight="bold" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-headline text-label">{t(T.splitTitle)}</div>
                <div className="text-footnote text-label-2 tnum">
                  <AnimatedNumber value={split.total} format="eur" className="font-semibold text-label" />
                  {saving > 0 && <span className="text-success"> · −{formatEUR(saving, lang)}</span>}
                </div>
              </div>
            </div>
            <p className="text-subhead text-label-2">
              {splitStores.length >= 2 && saving > 0.009
                ? t(T.splitBody, { a: atStore(splitStores[0], lang), b: atStore(splitStores[1], lang), save: formatEUR(saving, lang) })
                : t(T.splitNone, { a: atStore(cheapest, lang) })}
            </p>
            {splitStores.length >= 2 && (
              <div className="grid grid-cols-2 gap-2">
                {splitStores.map((id) => (
                  <div key={id} className="rounded-[12px] bg-fill-4 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-subhead font-semibold text-label">
                      <span className="size-2 rounded-full" style={{ background: storeById(id).color }} />
                      <span className="truncate">{storeById(id).name}</span>
                    </div>
                    <div className="text-footnote text-label-2 tnum">{t(T.splitAt, { n: split.byStore[id]?.length ?? 0 })}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        <ListGroup header={t(T.biggestDiffs)}>
          {diffs.map(({ it, cheap, dear, diff }) => (
            <ListRow
              key={it.ingredientId}
              icon={<span className="text-[22px] leading-none">{ingredients[it.ingredientId].emoji}</span>}
              title={t(ingredients[it.ingredientId].name)}
              subtitle={<span className="tnum">{t(T.diffRow, { cheap: `${storeById(cheap).name} ${formatEUR(it.price[cheap], lang)}`, dear: `${storeById(dear).name} ${formatEUR(it.price[dear], lang)}` })}</span>}
              value={formatEUR(diff, lang)}
            />
          ))}
        </ListGroup>
      </div>
    </Screen>
  )
}
