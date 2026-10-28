import { CaretRightIcon, ShieldCheckIcon, SparkleIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { allergenLabels, family, foodTagInfo, recipes, slots } from '../../data'
import type { Insight, Member } from '../../data/types'
import { push, openModal, openSheet } from '../../app'
import { useLang, useT } from '../../i18n'
import { useChildTaste, useInsights, useMeal, usePendingFeedback, useToday, useWeek, useWeekIndex } from '../../store'
import { AnimatedNumber, Avatar, Badge, Button, Card, FoodImage, Ring, Screen, SectionHeader, spring } from '../../ui'
import { useAcceptance, hasRatings, useWeekFeedback } from './shared'
import { T } from './strings'

export function FamilyScreen() {
  const t = useT()
  const today = useToday()
  const weekIndex = useWeekIndex()
  const pending = usePendingFeedback()
  return (
    <Screen title={t(T.title)} subtitle={t(family.city)} avatar>
      <div className="space-y-7 pb-4">
        {today === 'sun' && weekIndex === 0 && <RecapCard />}
        {pending.length > 0 && <PendingCard ids={pending} />}
        <section>
          <SectionHeader title={t(T.members)} />
          <div className="space-y-3 px-4">
            {family.members
              .filter((m) => m.role === 'child')
              .map((m) => (
                <ChildCard key={m.id} member={m} />
              ))}
            <ParentsCard />
          </div>
          <p className="mt-3 flex items-center gap-1.5 px-5 text-footnote text-label-2">
            <ShieldCheckIcon weight="fill" className="shrink-0 text-success" />
            {t(T.safeNote)}
          </p>
        </section>
        <Timeline />
      </div>
    </Screen>
  )
}

function ChildCard({ member }: { member: Member }) {
  const t = useT()
  const lang = useLang()
  const { stats, lastWeek } = useAcceptance()
  const fb = useWeekFeedback()
  const taste = useChildTaste(member.id)
  const pct = stats.acceptance.find((a) => a.memberId === member.id)?.percent ?? 0
  const rated = lastWeek || hasRatings(fb, member.id)
  const loves = taste.filter((f) => f.pref === 'love').slice(0, 4)
  const color = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--primary)' : 'var(--warning)'
  return (
    <Card padding="none" onPress={() => push('child', { id: member.id }, 'family')} aria-label={member.name[lang]}>
      <div className="flex items-center gap-3.5 p-4">
        <Avatar member={member} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-headline text-label">{member.name[lang]}</h3>
            <span className="text-subhead text-label-2">{t(T.years, { n: member.age })}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {member.allergies.length ? (
              member.allergies.map((a) => (
                <Badge key={a} tone="danger" emoji={allergenLabels[a].emoji}>
                  {t(T.allergyTo, { a: t(allergenLabels[a].label).toLocaleLowerCase(lang === 'el' ? 'el-GR' : 'en-GB') })}
                </Badge>
              ))
            ) : (
              <Badge tone="neutral">{t(T.noAllergies)}</Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <Ring value={rated ? pct / 100 : 0} size={60} stroke={6} color={color} aria-label={`${pct}%`}>
            <span className="text-footnote font-bold text-label tnum">
              {rated ? <AnimatedNumber value={pct} format="percent" /> : '—'}
            </span>
          </Ring>
          <span className="text-caption-2 text-label-2">{t(lastWeek ? T.lastWeekShort : T.acceptance)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 hairline-t px-4 py-2.5">
        <span className="shrink-0 text-footnote text-label-2">{t(T.loves)}</span>
        <div className="flex min-w-0 flex-1 gap-1 overflow-hidden [mask-image:linear-gradient(to_right,black_85%,transparent)]">
          {loves.map((f) => (
            <span key={f.tag} className="shrink-0 rounded-full bg-fill-4 px-2 py-0.5 text-footnote text-label">
              {foodTagInfo[f.tag]?.emoji} {t(foodTagInfo[f.tag]?.label ?? f.tag)}
            </span>
          ))}
        </div>
        <CaretRightIcon className="shrink-0 text-label-3" />
      </div>
    </Card>
  )
}

function ParentsCard() {
  const t = useT()
  const lang = useLang()
  const parents = family.members.filter((m) => m.role === 'adult')
  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {parents.map((p) => (
            <span key={p.id} className="rounded-full ring-2 ring-bg-grouped-2">
              <Avatar member={p} size={44} ring={false} />
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-headline text-label">{parents.map((p) => p.name[lang]).join(lang === 'el' ? ' και ' : ' & ')}</h3>
          <p className="text-subhead text-label-2">
            {t(parents.length > 1 ? T.parents : T.parent)} · {parents.map((p) => p.age).join(', ')}
          </p>
        </div>
      </div>
      <p className="mt-3 text-subhead text-label-2">{t(T.parentsNote)}</p>
    </Card>
  )
}

function PendingCard({ ids }: { ids: string[] }) {
  const t = useT()
  return (
    <section>
      <SectionHeader title={t(T.pendingTitle)} />
      <div className="space-y-2 px-4">
        {ids.map((id) => (
          <PendingRow key={id} mealId={id} />
        ))}
      </div>
    </section>
  )
}

function PendingRow({ mealId }: { mealId: string }) {
  const t = useT()
  const meal = useMeal(mealId)
  const week = useWeek()
  const today = useToday()
  if (!meal) return null
  const r = recipes[meal.recipeId]
  const dayIdx = week.days.findIndex((d) => d.id === meal.day)
  const todayIdx = week.days.findIndex((d) => d.id === today)
  const when = dayIdx === todayIdx - 1 ? t(T.yesterday) : dayIdx === todayIdx ? t(T.today) : t(week.days[dayIdx]?.long)
  return (
    <Card padding="sm" onPress={() => openSheet('feedback', { mealId })}>
      <div className="flex items-center gap-3">
        <FoodImage recipeId={meal.recipeId} aspect="1 / 1" rounded="rounded-[12px]" className="w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-footnote text-label-2">
            {when} · {t(slots[meal.slot].label)}
          </p>
          <p className="truncate text-headline text-label">{r ? t(r.name) : meal.recipeId}</p>
          <p className="text-subhead">😋 😐 🙅</p>
        </div>
        <Button variant="tinted" size="sm">
          {t(T.pendingCta)}
        </Button>
      </div>
    </Card>
  )
}

function RecapCard() {
  const t = useT()
  return (
    <div className="px-4">
      <Card padding="lg" onPress={() => openModal('recap')} className="bg-primary text-on-primary">
        <div className="flex items-start gap-3">
          <span className="text-[34px] leading-none" aria-hidden>
            🏆
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-headline">{t(T.recapCardTitle)}</h3>
            <p className="mt-0.5 text-subhead opacity-85">{t(T.recapCardBody)}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-subhead font-semibold">
              {t(T.recapCardCta)} <CaretRightIcon weight="bold" />
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Timeline() {
  const t = useT()
  const insights = useInsights()
  return (
    <section>
      <SectionHeader title={t(T.learned)} subtitle={t(T.learnedSub)} />
      <div className="mx-4 rounded-[18px] bg-bg-grouped-2 px-4 py-2 shadow-card">
        <ol className="relative">
          <AnimatePresence initial={false}>
            {insights.map((ins, i) => (
              <TimelineItem key={ins.id} insight={ins} last={i === insights.length - 1} />
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </section>
  )
}

function TimelineItem({ insight, last }: { insight: Insight; last: boolean }) {
  const t = useT()
  const member = insight.memberId ? family.members.find((m) => m.id === insight.memberId) : undefined
  const fresh = insight.when.en === 'Just now'
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={spring.layout}
      className="relative flex gap-3 py-3"
    >
      <div className="relative flex w-9 shrink-0 flex-col items-center">
        <span
          className={
            'relative z-[1] flex size-9 items-center justify-center rounded-full text-[18px] ' +
            (fresh ? 'bg-primary-tint ring-2 ring-primary' : 'bg-fill-4')
          }
          aria-hidden
        >
          {insight.icon}
        </span>
        {!last && <span className="absolute top-10 -bottom-3 w-px bg-separator" aria-hidden />}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-footnote font-semibold text-label-2">{t(insight.when)}</span>
          {member && (
            <span className="inline-flex items-center gap-1 text-footnote text-label-2">
              · <Avatar member={member} size={16} ring={false} /> {t(member.name)}
            </span>
          )}
          {fresh && (
            <Badge tone="primary" icon={<SparkleIcon weight="fill" />} className="ml-auto">
              {t(T.newBadge)}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-subhead text-label">{t(insight.text)}</p>
      </div>
    </motion.li>
  )
}
