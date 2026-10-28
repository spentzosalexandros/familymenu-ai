import { HeartIcon, ProhibitIcon, ShieldCheckIcon, SparkleIcon, ThumbsUpIcon } from '@phosphor-icons/react'
import { LayoutGroup, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { allergenLabels, dayOfMealId, foodTagInfo, recipes, slots } from '../../data'
import type { DayId, Member, MemberId, Preference } from '../../data/types'
import { openSheet } from '../../app'
import { useT } from '../../i18n'
import { useInsights, usePendingFeedback, useToday, useWeek } from '../../store'
import { AnimatedNumber, Avatar, Badge, Button, Card, EmptyState, FoodImage, Ring, Screen, SectionHeader, getDeviceScale, prefersReducedMotion, spring } from '../../ui'
import { hasRatings, memberOf, useAcceptance, useAnimatedTaste, useDailyAcceptance, useWeekFeedback } from './shared'
import { PREF_LABEL, RATING, REASONS, T } from './strings'

export function ChildProfileScreen({ id }: { id: string }) {
  const t = useT()
  const member = memberOf(id)
  const scrollRef = useRef<HTMLDivElement>(null)
  if (!member) {
    return (
      <Screen title={t(T.profileOf)}>
        <EmptyState emoji="🤔" title={t(T.notFound)} />
      </Screen>
    )
  }
  return (
    <Screen title={t(member.name)} scrollRef={scrollRef}>
      <div className="space-y-7 pt-2 pb-4">
        <Header member={member} />
        {member.role === 'child' && (
          <>
            <TasteBoard memberId={member.id} scrollRef={scrollRef} />
            <WeekChart memberId={member.id} />
            <RecentFeedback memberId={member.id} />
            <ChildInsights memberId={member.id} />
          </>
        )}
      </div>
    </Screen>
  )
}

function Header({ member }: { member: Member }) {
  const t = useT()
  const { stats, lastWeek } = useAcceptance()
  const fb = useWeekFeedback()
  const pending = usePendingFeedback()
  const pct = stats.acceptance.find((a) => a.memberId === member.id)?.percent ?? 0
  const rated = member.role === 'child' && (lastWeek || hasRatings(fb, member.id))
  return (
    <div className="px-4">
      <Card padding="lg">
        <div className="flex items-center gap-4">
          <Avatar member={member} size={76} />
          <div className="min-w-0 flex-1">
            <h2 className="text-title-2 font-bold text-label">{t(member.name)}</h2>
            <p className="text-subhead text-label-2">
              {t(member.role === 'child' ? T.child : T.parent)} · {t(T.years, { n: member.age })}
            </p>
          </div>
          {member.role === 'child' && (
            <div className="flex flex-col items-center gap-1">
              <Ring value={rated ? pct / 100 : 0} size={64} stroke={7} color="var(--success)">
                <span className="text-subhead font-bold text-label">{rated ? <AnimatedNumber value={pct} format="percent" /> : '—'}</span>
              </Ring>
              <span className="text-caption-2 text-label-2">{t(T.acceptance)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 rounded-[12px] bg-fill-4 p-3">
          <p className="flex items-center gap-1.5 text-footnote font-semibold text-label-2">
            <ShieldCheckIcon weight="fill" className="text-success" /> {t(T.allergyCard)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {member.allergies.length ? (
              member.allergies.map((a) => (
                <Badge key={a} tone="danger" size="md" emoji={allergenLabels[a].emoji}>
                  {t(allergenLabels[a].label)}
                </Badge>
              ))
            ) : (
              <Badge tone="neutral" size="md">
                {t(T.noAllergies)}
              </Badge>
            )}
          </div>
          {member.allergies.length > 0 && (
            <p className="mt-2 text-footnote text-label-2">
              {t(T.safeNote)} {t(T.allergyGuard)}
            </p>
          )}
        </div>
        {member.role === 'child' && pending.length > 0 && (
          <Button variant="tinted" full className="mt-3" onClick={() => openSheet('feedback', { mealId: pending[0] })}>
            😋 {t(T.feedbackTitle)}
          </Button>
        )}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Taste board: Λατρεύει / Τρώει / Όχι ακόμα with layout animations
// ---------------------------------------------------------------------------
const COLUMNS: { pref: Preference; icon: ReactNode; tone: string; chip: string }[] = [
  { pref: 'love', icon: <HeartIcon weight="fill" />, tone: 'text-danger', chip: 'bg-danger-tint text-label' },
  { pref: 'eats', icon: <ThumbsUpIcon weight="fill" />, tone: 'text-primary', chip: 'bg-primary-tint text-label' },
  { pref: 'refuses', icon: <ProhibitIcon weight="bold" />, tone: 'text-label-2', chip: 'bg-fill-3 text-label-2' },
]

function TasteBoard({ memberId, scrollRef }: { memberId: MemberId; scrollRef: RefObject<HTMLDivElement | null> }) {
  const t = useT()
  const { map, recent, pending } = useAnimatedTaste(memberId)
  const entries = [...map.entries()]
  const ref = useRef<HTMLElement>(null)
  // A food is about to move: bring the board into view first so the move is seen.
  const [initialPending] = useState(pending)
  useEffect(() => {
    if (!initialPending) return
    const id = window.setTimeout(() => {
      const box = scrollRef.current
      const el = ref.current
      if (!box || !el) return
      const top = box.scrollTop + (el.getBoundingClientRect().top - box.getBoundingClientRect().top) / getDeviceScale() - 112
      box.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }, 420)
    return () => window.clearTimeout(id)
  }, [initialPending, scrollRef])
  return (
    <section ref={ref}>
      <SectionHeader title={t(T.tasteTitle)} subtitle={t(T.tasteSub)} />
      <LayoutGroup id={`taste-${memberId}`}>
        <div className="mx-4 space-y-3">
          {COLUMNS.map((col) => {
            const foods = entries.filter(([, p]) => p === col.pref)
            return (
              <motion.div key={col.pref} layout transition={spring.layout} className="rounded-[18px] bg-bg-grouped-2 p-4 shadow-card">
                <motion.h3 layout="position" className="mb-2.5 flex items-center gap-1.5 text-headline text-label">
                  <span className={col.tone}>{col.icon}</span>
                  {t(PREF_LABEL[col.pref])}
                  <span className="text-subhead font-normal text-label-3 tnum">{foods.length}</span>
                </motion.h3>
                <div className="flex flex-wrap gap-2">
                  {foods.map(([tag]) => {
                    const info = foodTagInfo[tag]
                    const isNew = recent.has(tag)
                    return (
                      <motion.span
                        key={tag}
                        layoutId={`${memberId}-${tag}`}
                        layout
                        transition={spring.layout}
                        className={
                          'relative inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-footnote font-medium ' +
                          col.chip +
                          (isNew ? ' shadow-[inset_0_0_0_2px_var(--primary)]' : '')
                        }
                      >
                        <span aria-hidden>{info?.emoji ?? '🍽️'}</span>
                        {info ? t(info.label) : tag}
                        {isNew && <SparkleIcon weight="fill" className="text-primary" aria-label={t(T.justChanged)} />}
                      </motion.span>
                    )
                  })}
                  {!foods.length && <span className="text-subhead text-label-3">{t(T.emptyColumn)}</span>}
                </div>
              </motion.div>
            )
          })}
        </div>
      </LayoutGroup>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Weekly acceptance mini-chart
// ---------------------------------------------------------------------------
function WeekChart({ memberId }: { memberId: MemberId }) {
  const t = useT()
  const week = useWeek()
  const today = useToday()
  const data = useDailyAcceptance(memberId)
  const any = data.some((d) => d.percent !== null)
  return (
    <section>
      <SectionHeader title={t(T.chartTitle)} subtitle={t(T.chartSub)} />
      <div className="mx-4 rounded-[18px] bg-bg-grouped-2 p-4 shadow-card">
        <div className="flex h-36 items-end justify-between gap-2" role="img" aria-label={t(T.chartTitle)}>
          {data.map((d) => {
            const day = week.days.find((x) => x.id === d.day)
            const pct = d.percent
            const color = pct === null ? 'var(--fill-3)' : pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--primary)' : 'var(--warning)'
            return (
              <div key={d.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-caption-2 font-semibold text-label-2 tnum">{pct === null ? '' : `${pct}%`}</span>
                <div className="relative w-full max-w-7 flex-1">
                  <div className="absolute inset-0 rounded-[8px] bg-fill-4" />
                  {pct !== null && (
                    <motion.div
                      className="absolute inset-x-0 bottom-0 origin-bottom rounded-[8px]"
                      style={{ background: color, height: `${Math.max(6, pct)}%` }}
                      initial={{ scaleY: 0.2, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={spring.gentle}
                    />
                  )}
                </div>
                <span className={'text-caption ' + (d.day === (today as DayId) ? 'font-bold text-primary' : 'text-label-2')}>
                  {day ? t(day.short) : d.day}
                </span>
              </div>
            )
          })}
        </div>
        {!any && <p className="mt-3 text-center text-footnote text-label-2">{t(T.chartEmpty)}</p>}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Recent feedback
// ---------------------------------------------------------------------------
function RecentFeedback({ memberId }: { memberId: MemberId }) {
  const t = useT()
  const week = useWeek()
  const fb = useWeekFeedback()
  const rows = fb
    .filter((e) => e.ratings.some((r) => r.memberId === memberId))
    .sort((a, b) => {
      const da = week.days.findIndex((d) => d.id === dayOfMealId(a.plannedMealId))
      const db = week.days.findIndex((d) => d.id === dayOfMealId(b.plannedMealId))
      return db - da || (b.plannedMealId > a.plannedMealId ? 1 : -1)
    })
    .slice(0, 5)
  return (
    <section>
      <SectionHeader title={t(T.recentTitle)} />
      <div className="mx-4 overflow-hidden rounded-[18px] bg-bg-grouped-2 shadow-card">
        {!rows.length && <p className="p-4 text-subhead text-label-2">{t(T.recentEmpty)}</p>}
        {rows.map((e, i) => {
          const r = e.ratings.find((x) => x.memberId === memberId)!
          const recipe = recipes[e.recipeId]
          const day = week.days.find((d) => d.id === dayOfMealId(e.plannedMealId))
          const slot = e.plannedMealId.split('-')[1] as keyof typeof slots
          const reason = r.reason ? REASONS.find((x) => x.id === r.reason) : undefined
          return (
            <div key={e.plannedMealId} className={'flex items-center gap-3 px-4 py-3 ' + (i ? 'hairline-t' : '')}>
              <FoodImage recipeId={e.recipeId} aspect="1 / 1" rounded="rounded-[10px]" className="w-12 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-subhead font-semibold text-label">{recipe ? t(recipe.name) : e.recipeId}</p>
                <p className="truncate text-footnote text-label-2">
                  {day ? t(day.short) : ''} · {slots[slot] ? t(slots[slot].label) : ''}
                  {reason ? ` · ${reason.emoji} ${t(reason.label)}` : ''}
                </p>
              </div>
              <span className="flex flex-col items-center">
                <span className="text-[26px] leading-none" aria-hidden>
                  {RATING[r.rating].emoji}
                </span>
                <span className="mt-0.5 text-caption-2 text-label-2">{t(RATING[r.rating].label)}</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Insights about this child
// ---------------------------------------------------------------------------
function ChildInsights({ memberId }: { memberId: MemberId }) {
  const t = useT()
  const insights = useInsights().filter((i) => i.memberId === memberId)
  return (
    <section>
      <SectionHeader title={t(T.insightsTitle)} />
      <div className="space-y-2 px-4">
        {!insights.length && <p className="px-1 text-subhead text-label-2">{t(T.insightsEmpty)}</p>}
        {insights.map((ins) => (
          <motion.div key={ins.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={spring.default}>
            <Card padding="sm" highlight={ins.when.en === 'Just now'}>
              <div className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fill-4 text-[18px]" aria-hidden>
                  {ins.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-footnote font-semibold text-label-2">{t(ins.when)}</p>
                  <p className="text-subhead text-label">{t(ins.text)}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
