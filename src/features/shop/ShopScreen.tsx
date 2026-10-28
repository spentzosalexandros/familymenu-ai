import { CaretDownIcon, CaretRightIcon, CheckIcon, ExportIcon, HouseIcon, InfoIcon, RecycleIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { alert, openSheet, toast } from '../../app'
import { PRICE_DISCLAIMER, aisles, ingredients, planSummary, storeById, stores } from '../../data'
import type { GroceryItem, StoreId } from '../../data/types'
import { S, formatEUR, formatNumber, tNow, useLang, useT, useTp } from '../../i18n'
import {
  actions,
  useBudget,
  useCheapestStore,
  useChecked,
  useGroceryList,
  usePantry,
  usePlan,
  useSelectedStore,
  useStoreTotals,
  useWeek,
} from '../../store'
import { AnimatedNumber, Badge, BudgetBar, Button, Card, EmptyState, IconButton, Ring, Screen, SwipeableRow, ease, haptic, spring } from '../../ui'
import { atStore, byAisle, sum } from './shared'
import { T } from './strings'

const CHECK_DELAY = 420

/** Shop tab: store cards, the list by aisle, check-off into "Στο καλάθι", swipe "Το έχω ήδη". */
export function ShopScreen() {
  const t = useT()
  const tp = useTp()
  const lang = useLang()
  const items = useGroceryList()
  const totals = useStoreTotals()
  const cheapest = useCheapestStore()
  const selected = useSelectedStore()
  const checked = useChecked()
  const pantry = usePantry()
  const plan = usePlan()
  const budget = useBudget()
  const week = useWeek()
  const summary = useMemo(() => planSummary(plan, pantry, selected), [plan, pantry, selected])

  // Items that were just ticked: shown checked in place for a beat, then committed (they move to the cart).
  const [pending, setPending] = useState<string[]>([])
  const timers = useRef(new Map<string, number>())
  useEffect(() => {
    const map = timers.current
    return () => map.forEach((id) => window.clearTimeout(id))
  }, [])

  const toBuy = items.filter((it) => !checked.includes(it.ingredientId) && !pantry.includes(it.ingredientId))
  const inCart = items.filter((it) => checked.includes(it.ingredientId) && !pantry.includes(it.ingredientId))
  const atHome = items.filter((it) => pantry.includes(it.ingredientId))
  const groups = byAisle(toBuy)
  const remaining = sum(toBuy, selected)
  const cartTotal = sum(inCart, selected)
  const listed = toBuy.length + inCart.length
  const [cartOpen, setCartOpen] = useState(true)

  const tick = (id: string) => {
    const map = timers.current
    if (map.has(id)) {
      // second tap while it animates: cancel
      window.clearTimeout(map.get(id))
      map.delete(id)
      setPending((p) => p.filter((x) => x !== id))
      return
    }
    haptic(10)
    setPending((p) => [...p, id])
    map.set(
      id,
      window.setTimeout(() => {
        map.delete(id)
        actions.toggleChecked(id)
        setPending((p) => p.filter((x) => x !== id))
      }, CHECK_DELAY),
    )
  }

  const toPantry = (it: GroceryItem) => {
    const name = tNow(ingredients[it.ingredientId].name)
    const saved = it.price[selected]
    const undo = actions.togglePantry(it.ingredientId)
    toast(tNow(T.pantryToast, { name }), {
      icon: '🏠',
      description: tNow(T.pantryToastDesc, { v: formatEUR(saved, lang) }),
      action: { label: S.undo, onClick: undo },
    })
  }

  const restore = (it: GroceryItem) => {
    actions.togglePantry(it.ingredientId)
    toast(tNow(T.restored, { name: tNow(ingredients[it.ingredientId].name) }), { icon: '↩︎' })
  }

  const startOver = () => {
    const keep = selected
    actions.resetShopping()
    actions.selectStore(keep)
  }

  return (
    <Screen
      title={t(S.tabs.shop)}
      subtitle={t(week.label)}
      avatar
      trailing={<IconButton label={t(T.share)} variant="plain" size={34} icon={<ExportIcon />} onClick={() => openSheet('share')} />}
    >
      <div className="space-y-6 pb-4">
        {/* ---------- stores ---------- */}
        <section>
          <div className="ios-hscroll flex gap-3 px-4 pt-1 pb-3">
            {stores.map((s) => (
              <StoreCard
                key={s.id}
                id={s.id}
                total={totals[s.id]}
                cheapestTotal={totals[cheapest]}
                isCheapest={s.id === cheapest}
                isSelected={s.id === selected}
              />
            ))}
          </div>
          <div className="flex items-center justify-between px-5">
            <button
              type="button"
              onClick={() => alert({ title: T.disclaimerTitle, message: T.disclaimerBody })}
              className="relative flex items-center gap-1.5 text-footnote text-label-2 transition-opacity active:opacity-50 before:absolute before:-inset-3 before:content-['']"
            >
              <InfoIcon className="text-[15px]" />
              {t(S.indicativePrices)}
            </button>
            <button
              type="button"
              onClick={() => openSheet('compare')}
              className="relative flex items-center gap-0.5 text-subhead font-medium text-primary transition-opacity active:opacity-50 before:absolute before:-inset-3 before:content-['']"
            >
              {t(T.compare)}
              <CaretRightIcon weight="bold" className="text-[13px]" />
            </button>
          </div>
        </section>

        {/* ---------- summary ---------- */}
        <section className="px-4">
          <Card padding="lg">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-footnote text-label-2">{t(T.toBuy)}</div>
                <AnimatedNumber value={remaining} format="eur" className="text-title-1 font-bold text-label" />
                <div className="mt-0.5 text-footnote text-label-2">{t(T.pricesAt, { at: atStore(selected, lang) })}</div>
              </div>
              <Ring value={listed ? inCart.length / listed : 0} size={64} stroke={7} aria-label={t(T.progress, { done: inCart.length, all: listed })}>
                <span className="text-footnote font-semibold text-label tnum">
                  {inCart.length}/{listed}
                </span>
              </Ring>
            </div>
            <div className="hairline-t mt-4 pt-4">
              <BudgetBar value={totals[selected]} budget={budget} />
            </div>
          </Card>
        </section>

        {/* ---------- list by aisle ---------- */}
        {toBuy.length > 0 ? (
          <div className="space-y-5">
            {inCart.length === 0 && <p className="px-5 text-footnote text-label-2">{t(T.swipeHint)}</p>}
            <AnimatePresence initial={false}>
              {groups.map((g) => (
                <motion.section
                  key={g.aisle}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: ease.out }}
                  className="overflow-hidden"
                >
                  <h2 className="flex items-baseline gap-2 px-5 pb-1.5 text-footnote text-label-2">
                    <span className="text-[15px]">{aisles[g.aisle].emoji}</span>
                    <span className="font-semibold text-label">{t(aisles[g.aisle].label)}</span>
                    <span>· {g.items.length}</span>
                  </h2>
                  <div className="mx-4 overflow-hidden rounded-[12px] bg-bg-grouped-2">
                    <AnimatePresence initial={false}>
                      {g.items.map((it, i) => (
                        <motion.div
                          key={it.ingredientId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={spring.layout}
                          className="overflow-hidden"
                        >
                          <SwipeableRow
                            contentClassName="bg-bg-grouped-2"
                            trailing={[
                              { key: 'pantry', label: t(T.haveIt), icon: <HouseIcon weight="fill" />, color: 'var(--warning)', onPress: () => toPantry(it) },
                            ]}
                          >
                            <ItemRow
                              item={it}
                              store={selected}
                              checked={pending.includes(it.ingredientId)}
                              onToggle={() => tick(it.ingredientId)}
                              last={i === g.items.length - 1}
                            />
                          </SwipeableRow>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          listed > 0 && (
            <EmptyState
              emoji="🎉"
              title={t(T.allDone)}
              message={t(T.allDoneMsg)}
              action={
                <Button variant="tinted" size="sm" onClick={startOver}>
                  {t(T.startOver)}
                </Button>
              }
            />
          )
        )}

        {/* ---------- in the cart ---------- */}
        {inCart.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-2 px-5 pb-1.5">
              <h2 className="flex items-baseline gap-2 text-footnote text-label-2">
                <span className="text-[15px]">🛒</span>
                <span className="font-semibold text-label">{t(T.inCart)}</span>
                <span className="tnum">
                  · {inCart.length} · <AnimatedNumber value={cartTotal} format="eur" />
                </span>
              </h2>
              <button
                type="button"
                onClick={() => setCartOpen((o) => !o)}
                aria-expanded={cartOpen}
                className="relative flex items-center gap-1 text-footnote font-medium text-primary transition-opacity active:opacity-50 before:absolute before:-inset-3 before:content-['']"
              >
                {t(cartOpen ? T.hideCart : T.showCart)}
                <motion.span animate={{ rotate: cartOpen ? 0 : -90 }} transition={spring.snappy} className="flex">
                  <CaretDownIcon weight="bold" />
                </motion.span>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {cartOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={spring.layout}
                  className="overflow-hidden"
                >
                  <div className="mx-4 overflow-hidden rounded-[12px] bg-bg-grouped-2">
                    <AnimatePresence initial={false}>
                      {inCart.map((it, i) => (
                        <motion.div
                          key={it.ingredientId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={spring.layout}
                          className="overflow-hidden"
                        >
                          <ItemRow
                            item={it}
                            store={selected}
                            checked
                            onToggle={() => actions.toggleChecked(it.ingredientId)}
                            last={i === inCart.length - 1}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* ---------- already at home ---------- */}
        {atHome.length > 0 && (
          <section>
            <h2 className="flex items-baseline gap-2 px-5 pb-1.5 text-footnote text-label-2">
              <span className="text-[15px]">🏠</span>
              <span className="font-semibold text-label">{t(T.pantrySection)}</span>
              <span>· {atHome.length}</span>
            </h2>
            <div className="mx-4 overflow-hidden rounded-[12px] bg-bg-grouped-2">
              {atHome.map((it, i) => (
                <button
                  key={it.ingredientId}
                  type="button"
                  onClick={() => restore(it)}
                  className="relative flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75 active:bg-fill-3"
                >
                  <span className="text-[20px] leading-none" aria-hidden>
                    {ingredients[it.ingredientId].emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body text-label-2">{t(ingredients[it.ingredientId].name)}</span>
                  <span className="text-subhead text-primary">{t(T.restore)}</span>
                  {i < atHome.length - 1 && <span aria-hidden className="absolute right-0 bottom-0 left-[52px] h-px scale-y-50 bg-separator" />}
                </button>
              ))}
            </div>
            <p className="px-5 pt-1.5 text-footnote text-label-2">{t(T.pantryFooter)}</p>
          </section>
        )}

        {/* ---------- waste note + share ---------- */}
        <section className="space-y-4 px-4">
          <Card className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-tint text-[20px] text-success">
              <RecycleIcon weight="bold" />
            </span>
            <div className="min-w-0">
              <div className="text-headline text-label">{t(T.wasteTitle)}</div>
              <p className="mt-0.5 text-subhead text-label-2">
                {t(T.waste, { reused: tp(summary.reusedIngredients, T.wasteReused), leftovers: tp(summary.leftoverMeals, T.wasteLeftovers) })}
              </p>
            </div>
          </Card>
          <Button variant="tinted" size="lg" full icon={<ExportIcon weight="bold" />} onClick={() => openSheet('share')}>
            {t(T.shareList)}
          </Button>
          <p className="text-center text-caption text-label-3">{tp(listed, T.items)} · {t(PRICE_DISCLAIMER)}</p>
        </section>
      </div>
    </Screen>
  )
}

// ---------------------------------------------------------------------------
function StoreCard({
  id,
  total,
  cheapestTotal,
  isCheapest,
  isSelected,
}: {
  id: StoreId
  total: number
  cheapestTotal: number
  isCheapest: boolean
  isSelected: boolean
}) {
  const t = useT()
  const lang = useLang()
  const store = storeById(id)
  const pct = cheapestTotal > 0 ? ((total - cheapestTotal) / cheapestTotal) * 100 : 0
  return (
    <motion.button
      type="button"
      onClick={() => {
        haptic(6)
        actions.selectStore(id)
      }}
      aria-pressed={isSelected}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1, ease: ease.out }}
      className={clsx(
        'relative flex w-[156px] shrink-0 flex-col rounded-[18px] bg-bg-grouped-2 p-3.5 text-left shadow-card',
        'transition-shadow duration-200',
        isSelected ? 'shadow-[0_0_0_2px_var(--primary)]' : '',
      )}
    >
      <div className="flex min-h-[20px] items-start gap-2">
        <span className="mt-[5px] size-2.5 shrink-0 rounded-full" style={{ background: store.color }} aria-hidden />
        <span className="line-clamp-2 min-w-0 flex-1 text-subhead leading-[1.25] font-semibold break-words text-label">{store.name}</span>
        <AnimatePresence initial={false}>
          {isSelected && (
            <motion.span
              key="sel"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={spring.snappy}
              className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] text-on-primary"
              aria-label={t(T.selected)}
            >
              <CheckIcon weight="bold" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatedNumber value={total} format="eur" className="mt-2 text-title-3 font-bold text-label" />
      <div className="mt-1 flex h-[22px] items-center">
        {isCheapest ? (
          <Badge tone="success">{t(T.cheapest)}</Badge>
        ) : (
          <span className="text-footnote font-medium text-label-2 tnum">+{formatNumber(Math.round(pct * 10) / 10, lang, 1, 1)}%</span>
        )}
      </div>
      <div className="mt-1 text-caption text-label-3 tnum">{t(T.km, { d: formatNumber(store.distanceKm, lang, 1, 1) })}</div>
    </motion.button>
  )
}

// ---------------------------------------------------------------------------
function ItemRow({
  item,
  store,
  checked,
  onToggle,
  last,
}: {
  item: GroceryItem
  store: StoreId
  checked: boolean
  onToggle: () => void
  last: boolean
}) {
  const t = useT()
  const tp = useTp()
  const lang = useLang()
  const ing = ingredients[item.ingredientId]
  const name = t(ing.name)
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={t(checked ? T.uncheckLabel : T.checkLabel, { name })}
      className="relative flex min-h-[60px] w-full items-center gap-3 py-2 pr-4 pl-3.5 text-left transition-colors duration-75 select-none active:bg-fill-3"
    >
      <CheckCircle checked={checked} />
      <span className="w-7 shrink-0 text-center text-[22px] leading-none" aria-hidden>
        {ing.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={clsx(
            'line-clamp-2 block text-body transition-colors duration-200',
            checked ? 'text-label-3 line-through decoration-label-3' : 'text-label',
          )}
        >
          {name}
        </span>
        <span className="block text-footnote text-label-2">
          {item.packs > 1 ? t(T.packs, { n: item.packs, pack: t(ing.pack.label) }) : t(ing.pack.label)} · {tp(item.usedIn.length, T.forMeals)}
        </span>
      </span>
      <span className={clsx('shrink-0 text-body tnum transition-colors duration-200', checked ? 'text-label-3' : 'text-label')}>
        {formatEUR(item.price[store], lang)}
      </span>
      {!last && <span aria-hidden className="pointer-events-none absolute right-0 bottom-0 left-[92px] h-px scale-y-50 bg-separator" />}
    </button>
  )
}

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <span className="relative flex size-[26px] shrink-0 items-center justify-center" aria-hidden>
      <span className={clsx('absolute inset-0 rounded-full border-[1.5px] transition-colors duration-150', checked ? 'border-primary' : 'border-label-3')} />
      <motion.span
        className="absolute inset-0 rounded-full bg-primary"
        initial={false}
        animate={{ scale: checked ? 1 : 0.5, opacity: checked ? 1 : 0 }}
        transition={spring.snappy}
      />
      <svg viewBox="0 0 24 24" className="relative size-[15px] text-on-primary">
        <motion.path
          d="M5 12.5l4.2 4.2L19 7"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: checked ? 0.22 : 0.1, delay: checked ? 0.06 : 0, ease: ease.out }}
        />
      </svg>
    </span>
  )
}
