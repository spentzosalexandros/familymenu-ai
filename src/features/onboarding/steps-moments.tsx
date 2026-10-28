// Welcome, the AI "generating" moment and the plan-ready summary.
import { CheckIcon, LeafIcon, ShieldCheckIcon, SparkleIcon, TimerIcon, WalletIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { DAY_IDS, planSummary, recipes, storeById, week } from '../../data'
import { toast, useDevice, useStatusBarStyle } from '../../app'
import { S, formatEUR, useLang, useT, useTp } from '../../i18n'
import { actions, useBudget, usePantry, usePlan, usePrefs } from '../../store'
import { BudgetBar, Button, FoodImage, spring } from '../../ui'
import { useDraft } from './draft'
import { StepPage, goNext, goTo } from './layout'
import { T } from './strings'

// ---------------------------------------------------------------------------
// welcome
// ---------------------------------------------------------------------------
export function WelcomeStep() {
  const t = useT()
  const { safeTop, safeBottom } = useDevice()
  useStatusBarStyle('light')
  const signIn = () => {
    actions.completeOnboarding()
    toast(T.welcome.welcomeBack, { icon: '👋' })
  }
  const benefits = [
    { icon: <TimerIcon weight="fill" />, bg: 'var(--primary)', title: T.welcome.benefitTime, sub: T.welcome.benefitTimeSub },
    { icon: <WalletIcon weight="fill" />, bg: 'var(--accent)', title: T.welcome.benefitMoney, sub: T.welcome.benefitMoneySub },
    { icon: <LeafIcon weight="fill" />, bg: '#34A853', title: T.welcome.benefitWaste, sub: T.welcome.benefitWasteSub },
  ]
  return (
    <div className="absolute inset-0 flex flex-col bg-bg">
      <div className="relative h-[42%] shrink-0 overflow-hidden">
        <FoodImage src="/images/hero.jpg" alt="" aspect="auto" rounded="rounded-none" priority className="absolute inset-0 size-full" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" style={{ height: safeTop + 64 }} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </div>
      <div className="relative -mt-6 flex min-h-0 flex-1 flex-col px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.gentle, delay: 0.05 }}>
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="" className="size-8 rounded-[8px] shadow-card" />
            <span className="text-headline tracking-[-0.01em] text-label">{t(S.appName)}</span>
          </div>
          <h1 className="mt-3 text-[30px] leading-[1.12] font-bold tracking-[-0.02em] text-label">
            {t(T.welcome.headline1)}
            <br />
            <span className="text-primary">{t(T.welcome.headline2)}</span>
          </h1>
        </motion.div>
        <ul className="mt-5 space-y-3.5">
          {benefits.map((b, i) => (
            <motion.li
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.default, delay: 0.15 + i * 0.06 }}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-[19px] text-white" style={{ background: b.bg }}>
                {b.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-headline leading-tight text-label">{t(b.title)}</span>
                <span className="block text-footnote text-label-2">{t(b.sub)}</span>
              </span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-auto pt-4" style={{ paddingBottom: Math.max(safeBottom, 12) + 4 }}>
          <Button size="lg" full onClick={goNext}>
            {t(T.welcome.cta)}
          </Button>
          <Button variant="plain" full className="mt-1" onClick={signIn}>
            {t(T.welcome.signIn)}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// generating — the AI moment (≈3 s, tap anywhere to skip)
// ---------------------------------------------------------------------------
const STAGE_MS = 680
const TOTAL_MS = 3100

export function GeneratingStep() {
  const t = useT()
  const tp = useTp()
  const lang = useLang()
  const plan = usePlan()
  const prefs = usePrefs()
  const budget = useBudget()
  const d = useDraft()
  const [stage, setStage] = useState(0) // 0..4 rows done
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const timers = [1, 2, 3, 4].map((n) => window.setTimeout(() => setStage(n), 250 + n * STAGE_MS - 200))
    const fin = window.setTimeout(() => setFinished(true), TOTAL_MS - 350)
    const go = window.setTimeout(() => goTo('ready'), TOTAL_MS)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(fin)
      clearTimeout(go)
    }
  }, [])

  const kidsAreDemo = d.children.length === 2 && d.children[0].key === 'nikos' && d.children[1].key === 'eleni' && d.children.every((c) => typeof c.name !== 'string')
  const anyNuts = Object.values(d.allergies).some((l) => l.includes('nuts'))
  const rows = [
    kidsAreDemo ? t(T.generating.tasteKids) : t(T.generating.tasteGeneric),
    anyNuts ? t(T.generating.nuts) : t(T.generating.allergens),
    tp(prefs.stores.length, T.generating.prices, { n: prefs.stores.length }),
    t(T.generating.budget, { v: formatEUR(budget, lang, { decimals: 0 }) }),
  ]

  // 7 days × lunch + dinner thumbnails assembling into the week
  const tiles = useMemo(
    () =>
      DAY_IDS.map((day) => ({
        day,
        meals: plan.filter((m) => m.day === day && (m.slot === 'lunch' || m.slot === 'dinner')).sort((a, b) => (a.slot === b.slot ? 0 : a.slot === 'lunch' ? -1 : 1)),
      })),
    [plan],
  )

  return (
    <button
      type="button"
      className="absolute inset-0 flex flex-col items-center overflow-hidden bg-bg text-left"
      onClick={() => goTo('ready')}
      aria-label={t(T.generating.tap)}
    >
      {/* soft aura */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[8%] left-1/2 size-[440px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 45%, transparent) 0%, color-mix(in srgb, var(--accent) 25%, transparent) 45%, transparent 70%)' }}
        animate={{ scale: [0.9, 1.05, 0.95], rotate: [0, 40, 80] }}
        transition={{ duration: 3.2, ease: 'easeInOut' }}
      />

      <div className="relative mt-[22%] flex flex-col items-center px-6">
        <motion.div
          className="flex size-16 items-center justify-center rounded-[20px] bg-primary text-[32px] text-on-primary shadow-raised"
          animate={finished ? { scale: 1, rotate: 0 } : { scale: [1, 1.08, 1], rotate: [0, 8, -4, 0] }}
          transition={finished ? spring.snappy : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {finished ? (
              <motion.span key="ok" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={spring.snappy}>
                <CheckIcon weight="bold" />
              </motion.span>
            ) : (
              <motion.span key="spark" exit={{ opacity: 0, scale: 0.6 }}>
                <SparkleIcon weight="fill" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        <h1 className="mt-5 text-center text-title-2 font-bold text-label">{finished ? t(T.generating.done) : t(T.generating.title)}</h1>
      </div>

      {/* week grid assembling */}
      <div className="relative mt-7 grid w-full grid-cols-7 gap-1.5 px-5">
        {tiles.map((col, ci) => (
          <div key={col.day} className="flex flex-col items-center gap-1.5">
            <span className="text-caption-2 font-semibold text-label-2">{t(week.days[ci].short)}</span>
            {col.meals.map((m, ri) => (
              <motion.div
                key={m.id}
                className="aspect-square w-full overflow-hidden rounded-[10px] shadow-card"
                initial={{ opacity: 0, scale: 0.9, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ ...spring.default, delay: 0.25 + (ci * 2 + ri) * 0.12 }}
              >
                <FoodImage recipeId={m.recipeId} aspect="auto" rounded="rounded-none" className="size-full" />
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* staged checklist */}
      <ul className="relative mt-8 w-full space-y-3.5 px-8">
        {rows.map((label, i) => {
          const done = stage > i
          const active = stage === i
          return (
            <li key={i} className="flex items-center gap-3">
              <span className="relative flex size-6 shrink-0 items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  {done ? (
                    <motion.span
                      key="done"
                      className="flex size-6 items-center justify-center rounded-full bg-primary text-[13px] text-on-primary"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={spring.snappy}
                    >
                      <CheckIcon weight="bold" />
                    </motion.span>
                  ) : active ? (
                    <motion.span
                      key="spin"
                      className="size-5 rounded-full border-2 border-fill-2 border-t-primary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <motion.span key="idle" className="size-5 rounded-full border-2 border-fill-2" exit={{ opacity: 0 }} />
                  )}
                </AnimatePresence>
              </span>
              <span className={clsx('text-callout transition-colors duration-300', done || active ? 'text-label' : 'text-label-3')}>{label}</span>
            </li>
          )
        })}
      </ul>

      <span className="absolute bottom-10 text-footnote text-label-3">{t(T.generating.tap)}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// ready
// ---------------------------------------------------------------------------
export function ReadyStep() {
  const t = useT()
  const tp = useTp()
  const lang = useLang()
  const plan = usePlan()
  const pantry = usePantry()
  const budget = useBudget()
  const sum = useMemo(() => planSummary(plan, pantry), [plan, pantry])
  const lunches = useMemo(() => DAY_IDS.map((day) => plan.find((m) => m.day === day && m.slot === 'lunch')).filter((m) => !!m), [plan])

  const stats = [
    { emoji: '🍽️', title: tp(sum.meals, T.ready.meals, { n: sum.meals }), sub: t(T.ready.mealsSub) },
    { emoji: '🛡️', title: t(T.ready.allergens, { n: sum.allergenMeals }), sub: t(T.ready.allergensSub), tone: 'text-success' },
    { emoji: '♻️', title: tp(sum.leftoverMeals, T.ready.leftovers, { n: sum.leftoverMeals }), sub: tp(sum.reusedIngredients, T.ready.reused, { n: sum.reusedIngredients }) },
  ]

  return (
    <StepPage cta={t(T.ready.cta)} onCta={goNext}>
      <div className="flex flex-col items-center px-6 pt-1 pb-6 text-center">
        <motion.div
          className="flex size-16 items-center justify-center rounded-full bg-success text-[30px] text-white shadow-raised"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring.bouncy}
        >
          <CheckIcon weight="bold" />
        </motion.div>
        <h1 className="mt-4 text-title-1 font-bold text-balance text-label">{t(T.ready.title)}</h1>
        <p className="mt-1.5 text-body text-label-2">{t(T.ready.sub)}</p>
      </div>

      {/* cost vs budget */}
      <motion.div
        className="mx-4 rounded-[18px] bg-bg-grouped-2 p-4 shadow-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.default, delay: 0.08 }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-subhead font-semibold text-label-2">{t(T.ready.costTitle)}</span>
          <span className="text-footnote text-label-3">{t(T.ready.atStore, { store: storeById(sum.store).name })}</span>
        </div>
        <div className="mt-1 text-[34px] leading-tight font-bold tracking-[-0.02em] text-label tnum">{formatEUR(sum.total, lang)}</div>
        <BudgetBar value={sum.total} budget={budget} className="mt-2" />
        <p className="mt-2 text-caption text-label-3">{t(S.indicativePrices)}</p>
      </motion.div>

      <div className="mx-4 mt-3 rounded-[18px] bg-bg-grouped-2 px-4 py-1 shadow-card">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            className={clsx('flex items-center gap-3 py-3', i > 0 && 'hairline-t')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.default, delay: 0.14 + i * 0.05 }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-fill-4 text-[20px]">{s.emoji}</span>
            <span className="min-w-0">
              <span className={clsx('block text-headline leading-tight', s.tone ?? 'text-label')}>{s.title}</span>
              <span className="block text-footnote text-label-2">{s.sub}</span>
            </span>
          </motion.div>
        ))}
      </div>

      <h2 className="mx-6 mt-6 mb-2.5 text-headline text-label">{t(T.ready.weekPreview)}</h2>
      <div className="ios-hscroll flex gap-2.5 px-4 pb-1">
        {lunches.map((m, i) => (
          <motion.div
            key={m.id}
            className="w-[124px] shrink-0"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring.default, delay: 0.2 + i * 0.04 }}
          >
            <FoodImage recipeId={m.recipeId} aspect="1 / 1" rounded="rounded-[14px]" />
            <div className="mt-1.5 text-caption font-semibold text-label-2">{t(week.days.find((x) => x.id === m.day)?.short)}</div>
            <RecipeName id={m.recipeId} />
          </motion.div>
        ))}
      </div>
      <div className="mx-6 mt-4 flex items-center gap-1.5 text-footnote text-label-2">
        <ShieldCheckIcon weight="fill" className="text-success" />
        {t(T.ready.allSafe)}
      </div>
    </StepPage>
  )
}

function RecipeName({ id }: { id: string }) {
  const t = useT()
  return <div className="line-clamp-2 text-footnote leading-snug text-label">{t(recipes[id]?.name)}</div>
}
