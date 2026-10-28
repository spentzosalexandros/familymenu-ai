import { CheckCircleIcon, SparkleIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { feedbackHistory, initialPlan, recapStats, recipes, slots, week as demoWeek } from '../../data'
import type { MemberId, RecapStats } from '../../data/types'
import { closeModal, navigate } from '../../app'
import { formatEUR, formatMinutes, useLang, useT, useTp } from '../../i18n'
import { actions, getState, useAppStore, useBudget, usePlan, usePlanCost, useWeek, useWeekIndex } from '../../store'
import { AnimatedNumber, Avatar, Badge, BudgetBar, Button, FoodImage, ProgressBar, Ring, Screen, spring } from '../../ui'
import { memberOf } from './shared'
import { NAME_ACC, NAME_GEN, T } from './strings'

const useAdaptedIds = () => useAppStore((s) => s.adapted)

type Phase = 'recap' | 'generating' | 'ready'

export function RecapScreen() {
  const t = useT()
  const weekIndex = useWeekIndex()
  // Freeze the week's numbers when the recap opens (starting next week replaces the plan).
  const [stats] = useState<RecapStats>(() => {
    const s = getState()
    return recapStats(s.weekIndex === 1 ? initialPlan : s.plan, [...feedbackHistory, ...s.feedback.entries])
  })
  const [phase, setPhase] = useState<Phase>(() => (weekIndex === 1 ? 'ready' : 'recap'))

  const toReady = useCallback(() => setPhase('ready'), [])
  const finishWeek = () => {
    closeModal()
    navigate({ tab: 'week' })
  }

  return (
    <Screen
      title={t(T.recapTitle)}
      bottomBar={
        phase === 'recap' ? (
          <div className="w-full">
            <Button size="lg" full icon={<SparkleIcon weight="fill" />} onClick={() => setPhase('generating')}>
              {t(T.recapCta)}
            </Button>
          </div>
        ) : phase === 'ready' ? (
          <div className="w-full">
            <Button size="lg" full onClick={finishWeek}>
              {t(T.seeWeek)}
            </Button>
          </div>
        ) : undefined
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'recap' && (
          <motion.div key="recap" exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Recap stats={stats} />
          </motion.div>
        )}
        {phase === 'generating' && (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Generating onDone={toReady} />
          </motion.div>
        )}
        {phase === 'ready' && (
          <motion.div key="ready" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring.default}>
            <Ready />
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}

// ---------------------------------------------------------------------------
// The recap
// ---------------------------------------------------------------------------
function useCountUp(delay = 250) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setOn(true), delay)
    return () => window.clearTimeout(id)
  }, [delay])
  return on
}

function Recap({ stats }: { stats: RecapStats }) {
  const t = useT()
  const lang = useLang()
  const on = useCountUp()
  const left = stats.budget - stats.spent
  const overall = stats.acceptanceOverall ?? 0
  const tp = useTp()
  // One row per dish (a dish both kids discovered shows both names).
  const favs = stats.newFavorites.reduce<{ recipeId: string; memberIds: MemberId[] }[]>((acc, f) => {
    const row = acc.find((x) => x.recipeId === f.recipeId)
    if (row) row.memberIds.push(f.memberId)
    else acc.push({ recipeId: f.recipeId, memberIds: [f.memberId] })
    return acc
  }, [])
  return (
    <div className="space-y-7 px-4 pt-2 pb-6">
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={spring.bouncy}
          className="text-[56px] leading-none"
          aria-hidden
        >
          🏆
        </motion.span>
        <p className="mt-3 text-footnote font-semibold text-label-2">{t(demoWeek.label)}</p>
        <h2 className="mt-1 text-title-1 font-bold text-label">{t(T.recapHello)}</h2>
        <p className="mt-1.5 max-w-[32ch] text-subhead text-label-2">{t(T.recapIntro)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat emoji="⏱️" delay={0} label={t(T.statTime)} hint={formatMinutes(stats.minutesSaved, lang)}>
          <AnimatedNumber value={on ? stats.minutesSaved : 0} suffix={t(T.minutesUnit)} />
        </Stat>
        <Stat
          emoji="💶"
          delay={0.05}
          label={t(T.statSpent)}
          hint={t(left >= 0 ? T.statUnder : T.statOver, { v: formatEUR(Math.abs(left), lang) })}
        >
          <AnimatedNumber value={on ? stats.spent : 0} format="eur" />
        </Stat>
        <Stat emoji="🌱" delay={0.1} label={t(T.statWaste)}>
          <AnimatedNumber value={on ? stats.wasteKgAvoided : 0} format="kg" />
        </Stat>
        <Stat emoji="♻️" delay={0.15} label={tp(stats.leftoverMeals, T.statLeftoversN)}>
          <AnimatedNumber value={on ? stats.leftoverMeals : 0} />
        </Stat>
      </div>

      <section className="rounded-[18px] bg-bg-grouped-2 p-4 shadow-card">
        <h3 className="text-headline text-label">{t(T.kidsAte)}</h3>
        <div className="mt-3 flex items-center gap-4">
          <Ring value={on ? overall / 100 : 0} size={92} stroke={10} color="var(--success)">
            <span className="text-title-3 font-bold text-label">
              <AnimatedNumber value={on ? overall : 0} format="percent" />
            </span>
            <span className="text-caption-2 text-label-2">{t(T.overall)}</span>
          </Ring>
          <div className="min-w-0 flex-1 space-y-3">
            {stats.acceptance.map((a) => {
              const m = memberOf(a.memberId)!
              return (
                <div key={a.memberId}>
                  <div className="mb-1 flex items-center gap-2">
                    <Avatar member={m} size={24} ring={false} />
                    <span className="flex-1 text-subhead font-semibold text-label">{t(m.name)}</span>
                    <span className="text-subhead font-semibold text-label tnum">
                      <AnimatedNumber value={on ? a.percent : 0} format="percent" />
                    </span>
                  </div>
                  <ProgressBar value={on ? a.percent / 100 : 0} tone={a.percent >= 80 ? 'success' : 'primary'} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {stats.topHits.length > 0 && (
        <section>
          <h3 className="mb-2.5 px-1 text-title-3 font-bold text-label">{t(T.topHits)}</h3>
          <div className="ios-hscroll -mx-4 flex gap-3 px-4 pb-1">
            {stats.topHits.map((h, i) => {
              const r = recipes[h.recipeId]
              const m = memberOf(h.memberId)!
              return (
                <motion.div
                  key={`${h.recipeId}-${h.memberId}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring.default, delay: 0.3 + i * 0.06 }}
                  className="w-[164px] shrink-0 overflow-hidden rounded-[18px] bg-bg-grouped-2 shadow-card"
                >
                  <FoodImage recipeId={h.recipeId} aspect="4 / 3" rounded="rounded-none" />
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-[2.6em] text-subhead font-semibold text-label">{r ? t(r.name) : h.recipeId}</p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-footnote text-label-2">
                      <Avatar member={m} size={20} ring={false} />
                      <span className="truncate">{t(m.name)}</span>
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {favs.length > 0 && (
        <section>
          <h3 className="mb-2.5 px-1 text-title-3 font-bold text-label">{t(T.newFavs)}</h3>
          <div className="overflow-hidden rounded-[18px] bg-bg-grouped-2 shadow-card">
            {favs.map((f, i) => {
              const r = recipes[f.recipeId]
              const names = f.memberIds.map((id) => t(NAME_GEN[id])).join(lang === 'el' ? ' και ' : ' and ')
              return (
                <div key={f.recipeId} className={'flex items-center gap-3 px-4 py-3 ' + (i ? 'hairline-t' : '')}>
                  <FoodImage recipeId={f.recipeId} aspect="1 / 1" rounded="rounded-[10px]" className="w-12 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-subhead font-semibold text-label">{r ? t(r.name) : f.recipeId}</p>
                    <p className="text-footnote text-label-2">{t(T.favOf, { name: names })}</p>
                  </div>
                  <span className="text-[22px]" aria-hidden>
                    ⭐
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <LearnedThisWeek />
    </div>
  )
}

function Stat({ emoji, label, hint, delay, children }: { emoji: string; label: string; hint?: string; delay: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.default, delay: 0.1 + delay }}
      className="rounded-[18px] bg-bg-grouped-2 p-4 shadow-card"
    >
      <span className="text-[24px] leading-none" aria-hidden>
        {emoji}
      </span>
      <p className="mt-2 text-title-2 font-bold text-label tnum">{children}</p>
      <p className="text-footnote text-label-2">{label}</p>
      {hint && <p className="mt-1 text-caption font-semibold text-primary">{hint}</p>}
    </motion.div>
  )
}

function LearnedThisWeek() {
  const t = useT()
  const insights = getState().feedback.insights.filter((i) => i.kind === 'learned').slice(0, 4)
  if (!insights.length) return null
  return (
    <section>
      <h3 className="mb-2.5 px-1 text-title-3 font-bold text-label">{t(T.learnedWeek)}</h3>
      <div className="overflow-hidden rounded-[18px] bg-bg-grouped-2 shadow-card">
        {insights.map((ins, i) => (
          <div key={ins.id} className={'flex gap-3 px-4 py-3 ' + (i ? 'hairline-t' : '')}>
            <span className="text-[20px] leading-6" aria-hidden>
              {ins.icon}
            </span>
            <p className="text-subhead text-label">{t(ins.text)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Generating next week
// ---------------------------------------------------------------------------
function Generating({ onDone }: { onDone: () => void }) {
  const t = useT()
  const reduce = useReducedMotion()
  const plan = usePlan()
  const [step, setStep] = useState(0)
  const done = useRef(false)
  const [thumbs] = useState(() => plan.filter((m) => m.slot === 'lunch' || m.slot === 'dinner').slice(0, 9).map((m) => m.recipeId))
  const finish = useCallback(() => {
    if (done.current) return
    done.current = true
    actions.startNextWeek()
    onDone()
  }, [onDone])
  useEffect(() => {
    const ms = reduce ? 300 : 650
    const timers = T.genSteps.map((_, i) => window.setTimeout(() => setStep(i + 1), ms * (i + 0.6)))
    const end = window.setTimeout(finish, ms * (T.genSteps.length + 0.4))
    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(end)
    }
  }, [reduce, finish])
  return (
    <button type="button" onClick={finish} className="flex w-full flex-col items-center px-6 pt-8 pb-10 text-center">
      <div className="grid grid-cols-3 gap-2">
        {thumbs.map((id, i) => (
          <motion.div
            key={`${id}-${i}`}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...spring.default, delay: 0.08 * i }}
            className="w-[78px]"
          >
            <FoodImage recipeId={id} aspect="1 / 1" rounded="rounded-[14px]" />
          </motion.div>
        ))}
      </div>
      <p className="mt-7 text-title-3 font-bold text-label">{t(T.genTitle)}</p>
      <ul className="mt-4 space-y-2.5 text-left">
        {T.genSteps.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-subhead text-label">
            <motion.span animate={{ scale: step > i ? 1 : 0.9, opacity: step > i ? 1 : 0.4 }} transition={spring.snappy} className="flex">
              <CheckCircleIcon weight="fill" className={step > i ? 'text-success' : 'text-label-4'} />
            </motion.span>
            <span className={step > i ? '' : 'text-label-3'}>{t(s)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-footnote text-label-3">{t(T.genSkip)}</p>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Next week ready
// ---------------------------------------------------------------------------
function Ready() {
  const t = useT()
  const plan = usePlan()
  const week = useWeek()
  const adapted = useAdaptedIds()
  const cost = usePlanCost()
  const budget = useBudget()
  const meals = adapted.map((id) => plan.find((m) => m.id === id)).filter((m) => !!m)
  return (
    <div className="space-y-6 px-4 pt-4 pb-6">
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring.bouncy}
          className="flex size-16 items-center justify-center rounded-full bg-primary text-[30px] text-on-primary shadow-raised"
        >
          <SparkleIcon weight="fill" />
        </motion.span>
        <p className="mt-3 text-footnote font-semibold text-label-2">{t(week.label)}</p>
        <h2 className="mt-1 text-title-2 font-bold text-label">{t(T.readyTitle)}</h2>
        <p className="mt-1 text-subhead text-label-2">{t(T.readyBody, { n: meals.length })}</p>
      </div>

      <div className="rounded-[18px] bg-bg-grouped-2 p-4 shadow-card">
        <p className="mb-2 text-footnote font-semibold text-label-2">{t(T.readyCost)}</p>
        <BudgetBar value={cost} budget={budget} />
      </div>

      <div className="space-y-2.5">
        {meals.map((m, i) => {
          const r = recipes[m.recipeId]
          const day = week.days.find((d) => d.id === m.day)
          const who = m.adaptedFor ? memberOf(m.adaptedFor) : undefined
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.default, delay: 0.15 + i * 0.08 }}
              className="flex gap-3 rounded-[18px] bg-bg-grouped-2 p-3 shadow-card ring-2 ring-primary/50"
            >
              {/* Plain <img>: FoodImage can stay invisible for an already-cached image (see notes). */}
              <img
                src={r?.image ?? `/images/food/${m.recipeId}.jpg`}
                alt={r ? t(r.name) : ''}
                draggable={false}
                className="size-16 shrink-0 self-start rounded-[12px] bg-fill-3 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-footnote text-label-2">
                  {day ? t(day.long) : ''} · {t(slots[m.slot].label)}
                </p>
                <p className="text-headline text-label">{r ? t(r.name) : m.recipeId}</p>
                {who && (
                  <Badge tone="primary" emoji="✨" className="mt-1">
                    {t(T.adaptedFor, { name: t(NAME_ACC[who.id]) })}
                  </Badge>
                )}
                <p className="mt-1 text-footnote text-label-2">{t(m.reason)}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
