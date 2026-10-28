import { ArrowRightIcon, CheckCircleIcon, SparkleIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { foodTagInfo, recipes, slots } from '../../data'
import type { FeedbackEntry, FeedbackReason, LearningResult, MemberId, Rating } from '../../data/types'
import { navigate, toast, useScreen } from '../../app'
import { useLang, useT } from '../../i18n'
import { actions, useFeedbackEntries, useMeal, usePlan, useToday, useWeek } from '../../store'
import { Avatar, Badge, Button, Chip, EmptyState, FoodImage, SafeBadge, Screen, SegmentedControl, spring, tap, tapTransition } from '../../ui'
import { children, memberOf } from './shared'
import { LEFTOVERS, NAME_ACC, NAME_NOM, PREF_LABEL, RATING, REASONS, T } from './strings'

type Leftovers = NonNullable<FeedbackEntry['leftovers']>
type Answer = { rating?: Rating; reason?: FeedbackReason }
type Phase = 'form' | 'thinking' | 'done'

export function FeedbackSheet({ mealId }: { mealId: string }) {
  const t = useT()
  const meal = useMeal(mealId)
  const previous = useFeedbackEntries().find((e) => e.plannedMealId === mealId)
  // Freeze the meal as it was when the sheet opened (the AI may change the plan underneath).
  const [snapshot] = useState(() => meal)
  const [answers, setAnswers] = useState<Record<string, Answer>>(() =>
    Object.fromEntries((previous?.ratings ?? []).map((r) => [r.memberId, { rating: r.rating, reason: r.reason }])),
  )
  const [leftovers, setLeftovers] = useState<Leftovers>(previous?.leftovers ?? 'none')
  const [phase, setPhase] = useState<Phase>('form')
  const [result, setResult] = useState<LearningResult | null>(null)
  const toDone = useCallback(() => setPhase('done'), [])

  const m = snapshot ?? meal
  if (!m) {
    return (
      <Screen title={t(T.feedbackTitle)}>
        <EmptyState emoji="🍽️" title={t(T.mealMissing)} />
      </Screen>
    )
  }
  const complete = children.every((c) => answers[c.id]?.rating)

  const submit = () => {
    if (!complete) return
    const entry: FeedbackEntry = {
      plannedMealId: m.id,
      recipeId: m.recipeId,
      ratings: children.map((c) => ({ memberId: c.id, rating: answers[c.id]!.rating!, reason: answers[c.id]?.reason })),
      leftovers,
    }
    const res = actions.submitFeedback(entry)
    setResult(res)
    setPhase('thinking')
  }

  return (
    <Screen
      title={t(T.feedbackTitle)}
      className="flex flex-col"
      contentClassName="flex-1"
      hideDone={phase === 'thinking'}
      bottomBar={
        phase === 'form' ? (
          <div className="w-full">
            <Button size="lg" full disabled={!complete} onClick={submit} icon={<SparkleIcon weight="fill" />}>
              {t(T.submit)}
            </Button>
            <p className="mt-1.5 h-4 text-center text-footnote text-label-2">{complete ? '' : t(T.submitHint)}</p>
          </div>
        ) : phase === 'done' && result ? (
          <DoneActions result={result} />
        ) : undefined
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'form' && (
          <motion.div key="form" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <Form
              mealId={m.id}
              recipeId={m.recipeId}
              day={m.day}
              slot={m.slot}
              answers={answers}
              setAnswer={(id, a) => setAnswers((s) => ({ ...s, [id]: a }))}
              leftovers={leftovers}
              setLeftovers={setLeftovers}
            />
          </motion.div>
        )}
        {phase === 'thinking' && (
          <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Thinking onDone={toDone} />
          </motion.div>
        )}
        {phase === 'done' && result && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <Done result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------
function useWhen(day: string, slot: keyof typeof slots) {
  const t = useT()
  const week = useWeek()
  const today = useToday()
  const di = week.days.findIndex((d) => d.id === day)
  const ti = week.days.findIndex((d) => d.id === today)
  const when = di === ti ? t(T.today) : di === ti - 1 ? t(T.yesterday) : t(week.days[di]?.long)
  return `${when} · ${t(slots[slot].label)}`
}

function Form(props: {
  mealId: string
  recipeId: string
  day: string
  slot: keyof typeof slots
  answers: Record<string, Answer>
  setAnswer: (id: MemberId, a: Answer) => void
  leftovers: Leftovers
  setLeftovers: (v: Leftovers) => void
}) {
  const t = useT()
  const recipe = recipes[props.recipeId]
  const when = useWhen(props.day, props.slot)
  return (
    <div className="space-y-5 px-4 pt-1 pb-4">
      <div className="flex items-center gap-3.5">
        <FoodImage recipeId={props.recipeId} aspect="1 / 1" rounded="rounded-[16px]" className="w-[84px] shrink-0" priority />
        <div className="min-w-0 flex-1">
          <p className="text-footnote font-semibold text-label-2">{when}</p>
          <h2 className="text-title-3 font-bold text-label">{recipe ? t(recipe.name) : props.recipeId}</h2>
          <SafeBadge recipeId={props.recipeId} className="mt-1.5" />
        </div>
      </div>

      {children.map((c) => (
        <ChildAnswer key={c.id} memberId={c.id} value={props.answers[c.id] ?? {}} onChange={(a) => props.setAnswer(c.id, a)} />
      ))}

      <div className="rounded-[18px] bg-bg-grouped-2 p-4 shadow-card">
        <p className="text-headline text-label">{t(T.leftoversQ)}</p>
        <p className="mb-3 text-footnote text-label-2">{t(T.leftoversHint)}</p>
        <SegmentedControl
          aria-label={t(T.leftoversQ)}
          options={LEFTOVERS.map((o) => ({ value: o.id, label: t(o.label) }))}
          value={props.leftovers}
          onChange={props.setLeftovers}
        />
      </div>
    </div>
  )
}

function ChildAnswer({ memberId, value, onChange }: { memberId: MemberId; value: Answer; onChange: (a: Answer) => void }) {
  const t = useT()
  const lang = useLang()
  const member = memberOf(memberId)!
  const needsReason = value.rating === 'some' || value.rating === 'none'
  const name = lang === 'el' ? NAME_NOM[memberId].el : member.name.en
  return (
    <div className="rounded-[18px] bg-bg-grouped-2 p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2.5">
        <Avatar member={member} size={36} />
        <p className="text-headline text-label">{t(T.howMuch, { name })}</p>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t(T.howMuch, { name })}>
        {(['all', 'some', 'none'] as Rating[]).map((r) => {
          const selected = value.rating === r
          const dim = value.rating && !selected
          return (
            <motion.button
              key={r}
              type="button"
              role="radio"
              aria-checked={selected}
              data-rating={`${memberId}-${r}`}
              whileTap={tap}
              transition={tapTransition}
              onClick={() => onChange({ rating: r, reason: r === 'all' ? undefined : value.reason })}
              className={
                'relative flex h-[92px] flex-col items-center justify-center gap-1 rounded-[16px] select-none ' +
                'transition-[background-color,box-shadow,opacity] duration-200 ease-out ' +
                (selected ? 'bg-primary-tint shadow-[inset_0_0_0_2px_var(--primary)]' : 'bg-fill-4') +
                (dim ? ' opacity-60' : '')
              }
            >
              <motion.span
                className="text-[38px] leading-none"
                aria-hidden
                animate={{ scale: selected ? 1.14 : 1 }}
                transition={selected ? spring.bouncy : spring.snappy}
              >
                {RATING[r].emoji}
              </motion.span>
              <span className={'text-subhead font-semibold ' + (selected ? 'text-primary' : 'text-label')}>{t(RATING[r].label)}</span>
              {selected && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-1.5 right-1.5 text-[18px] text-primary"
                >
                  <CheckCircleIcon weight="fill" />
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence initial={false}>
        {needsReason && (
          <motion.div
            key="reasons"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.default}
            className="overflow-hidden"
          >
            <p className="pt-3.5 pb-2 text-footnote text-label-2">{t(member.id === 'eleni' ? T.whyF : T.why)}</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((rs) => (
                <Chip
                  key={rs.id}
                  size="sm"
                  tone="tinted"
                  emoji={rs.emoji}
                  selected={value.reason === rs.id}
                  onToggle={() => onChange({ ...value, reason: value.reason === rs.id ? undefined : rs.id })}
                >
                  {t(rs.label)}
                </Chip>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Thinking: the short "AI" moment
// ---------------------------------------------------------------------------
function Thinking({ onDone }: { onDone: () => void }) {
  const t = useT()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  useEffect(() => {
    const ms = reduce ? 250 : 420
    const timers = T.thinkingSteps.map((_, i) => window.setTimeout(() => setStep(i + 1), ms * (i + 1)))
    const end = window.setTimeout(onDone, ms * (T.thinkingSteps.length + 1))
    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(end)
    }
  }, [onDone, reduce])
  return (
    <button type="button" onClick={onDone} className="flex w-full flex-col items-center px-8 pt-16 pb-10 text-center">
      <motion.span
        className="flex size-20 items-center justify-center rounded-full bg-primary-tint text-[40px] text-primary"
        animate={reduce ? undefined : { scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
      >
        <SparkleIcon weight="fill" />
      </motion.span>
      <p className="mt-5 text-title-3 font-bold text-label">{t(T.thinking)}</p>
      <ul className="mt-5 space-y-2.5 text-left">
        {T.thinkingSteps.map((s, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: step > i ? 1 : 0.35, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="flex items-center gap-2 text-subhead text-label"
          >
            <CheckCircleIcon weight="fill" className={step > i ? 'text-success' : 'text-label-4'} />
            {t(s)}
          </motion.li>
        ))}
      </ul>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Done: the AI's response
// ---------------------------------------------------------------------------
function Done({ result }: { result: LearningResult }) {
  const t = useT()
  const plan = usePlan()
  const week = useWeek()
  const words = useMemo(() => t(result.message).split(' '), [result.message, t])
  const changed = result.changedMealIds.map((id) => plan.find((m) => m.id === id)).filter((m) => !!m)
  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring.bouncy}
          className="flex size-16 items-center justify-center rounded-full bg-primary text-[30px] text-on-primary shadow-raised"
        >
          <SparkleIcon weight="fill" />
        </motion.span>
        <p className="mt-3 text-footnote font-semibold tracking-wide text-primary">{t(T.learnedHeader)}</p>
        <p className="mt-1.5 text-title-3 font-bold text-label" aria-live="polite">
          {words.map((w, i) => (
            <motion.span
              key={`${i}-${w}`}
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.045, ease: [0.23, 1, 0.32, 1] }}
              className="inline-block"
            >
              {w}&nbsp;
            </motion.span>
          ))}
        </p>
      </div>

      {changed.length > 0 && (
        <Reveal delay={0.35 + words.length * 0.045}>
          <p className="mt-7 mb-2 px-1 text-footnote font-semibold text-label-2">{t(T.changedMeals)}</p>
          <div className="space-y-2">
            {changed.map((m) => {
              const r = recipes[m.recipeId]
              const day = week.days.find((d) => d.id === m.day)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate({ tab: 'week', params: { day: m.day } })}
                  className="pressable flex w-full items-center gap-3 rounded-[16px] bg-bg-grouped-2 p-3 text-left shadow-card ring-2 ring-primary/60"
                >
                  <FoodImage recipeId={m.recipeId} aspect="1 / 1" rounded="rounded-[12px]" className="w-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-footnote text-label-2">
                      {day ? t(day.long) : ''} · {t(slots[m.slot].label)}
                    </p>
                    <p className="truncate text-headline text-label">{r ? t(r.name) : m.recipeId}</p>
                    <div className="mt-1 flex gap-1.5">
                      {m.adaptedFor && (
                        <Badge tone="primary" emoji="✨">
                          {t(T.adaptedFor, { name: t(NAME_ACC[m.adaptedFor]) })}
                        </Badge>
                      )}
                      {m.leftoverOf && (
                        <Badge tone="success" emoji="♻️">
                          {t(T.leftoverBadge)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ArrowRightIcon className="shrink-0 text-label-3" />
                </button>
              )
            })}
          </div>
        </Reveal>
      )}

      {result.tasteChanges.length > 0 && (
        <Reveal delay={0.5 + words.length * 0.045}>
          <p className="mt-6 mb-2 px-1 text-footnote font-semibold text-label-2">{t(T.tasteMoves)}</p>
          <div className="overflow-hidden rounded-[16px] bg-bg-grouped-2 shadow-card">
            {result.tasteChanges.map((c, i) => {
              const member = memberOf(c.memberId)!
              const info = foodTagInfo[c.tag]
              return (
                <button
                  key={`${c.memberId}-${c.tag}`}
                  type="button"
                  onClick={() => navigate({ tab: 'family', screen: 'child', params: { id: c.memberId } })}
                  className={'flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-fill-4 ' + (i ? 'hairline-t' : '')}
                >
                  <Avatar member={member} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-subhead font-semibold text-label">
                      {info?.emoji} {info ? t(info.label) : c.tag}
                    </p>
                    <p className="text-footnote text-label-2">
                      {t(PREF_LABEL[c.from])} → <span className="font-semibold text-primary">{t(PREF_LABEL[c.to])}</span>
                    </p>
                  </div>
                  <ArrowRightIcon className="shrink-0 text-label-3" />
                </button>
              )
            })}
          </div>
        </Reveal>
      )}

      {!changed.length && !result.tasteChanges.length && (
        <Reveal delay={0.4 + words.length * 0.045}>
          <p className="mt-6 text-center text-subhead text-label-2">{t(T.noChanges)}</p>
        </Reveal>
      )}
    </div>
  )
}

function Reveal({ delay, children: content }: { delay: number; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.default, delay }}>
      {content}
    </motion.div>
  )
}

function DoneActions({ result }: { result: LearningResult }) {
  const t = useT()
  const ctx = useScreen()
  const plan = usePlan()
  const first = result.changedMealIds.map((id) => plan.find((m) => m.id === id)).find((m) => !!m)
  const finish = () => {
    ctx.close()
    if (first) {
      toast(T.planUpdated, {
        icon: '✨',
        description: result.message,
        action: { label: T.show, onClick: () => navigate({ tab: 'week', params: { day: first.day } }) },
      })
    } else {
      toast(T.thanks, { icon: '😋', tone: 'success' })
    }
  }
  return (
    <div className="flex w-full gap-2">
      {first && (
        <Button size="lg" variant="gray" className="flex-1" onClick={() => navigate({ tab: 'week', params: { day: first.day } })}>
          {t(T.seePlan)}
        </Button>
      )}
      <Button size="lg" className="flex-1" onClick={finish}>
        {t(T.great)}
      </Button>
    </div>
  )
}
