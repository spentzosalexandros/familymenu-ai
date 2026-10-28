// Question steps 1–4: members, kids-taste, family-taste, allergies.
import { ShieldCheckIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { motion } from 'motion/react'
import { useState } from 'react'
import { onboarding } from '../../data'
import type { L10n } from '../../data'
import { S, useT, useTp } from '../../i18n'
import { Avatar, Chip, ListGroup, ListRow, SegmentedControl, Stepper, TRI_STATE_LABELS, TriStateChip, spring } from '../../ui'
import { KID_AVATARS, adultRows, useDraft } from './draft'
import { StepPage, goNext } from './layout'
import { T } from './strings'

/** Display name of a draft member (data L10n, typed string, or a generic fallback). */
export function useMemberName() {
  const t = useT()
  return (name: L10n | string, fallback: string) => (typeof name === 'string' ? name.trim() || fallback : t(name))
}

// ---------------------------------------------------------------------------
// members
// ---------------------------------------------------------------------------
export function MembersStep() {
  const t = useT()
  const tp = useTp()
  const d = useDraft()
  return (
    <StepPage title={t(T.members.title)} sub={t(T.members.sub)} cta={t(S.continue)} onCta={goNext}>
      <ListGroup>
        <ListRow
          icon={<span className="text-[22px]">🧑🏻‍🤝‍🧑🏻</span>}
          title={t(T.members.adults)}
          accessory={
            <div className="flex items-center gap-3">
              <span className="min-w-[1.5ch] text-right text-headline tnum">{d.adults}</span>
              <Stepper value={d.adults} min={1} max={6} onChange={d.setAdults} label={t(T.members.adults)} />
            </div>
          }
        />
        <ListRow
          icon={<span className="text-[22px]">🧒🏻</span>}
          title={t(T.members.children)}
          accessory={
            <div className="flex items-center gap-3">
              <span className="min-w-[1.5ch] text-right text-headline tnum">{d.children.length}</span>
              <Stepper value={d.children.length} min={0} max={5} onChange={d.setChildren} label={t(T.members.children)} />
            </div>
          }
        />
      </ListGroup>

      {d.children.length > 0 ? (
        <ListGroup header={t(T.members.kidsHeader)} footer={t(T.members.kidsFooter)} className="mt-6">
          {d.children.map((c, i) => (
            <motion.div key={c.key} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring.default}>
              <div className="flex items-center gap-3 px-4 py-2.5">
                <button
                  type="button"
                  className="pressable relative shrink-0 rounded-full before:absolute before:-inset-1 before:content-['']"
                  aria-label={t(T.members.childN, { n: i + 1 })}
                  onClick={() => d.updateChild(c.key, { avatar: KID_AVATARS[(KID_AVATARS.indexOf(c.avatar) + 1) % KID_AVATARS.length] })}
                >
                  <Avatar emoji={c.avatar} color={c.color} size={44} />
                </button>
                <div className="min-w-0 flex-1">
                  <input
                    value={typeof c.name === 'string' ? c.name : t(c.name)}
                    onChange={(e) => d.updateChild(c.key, { name: e.target.value })}
                    placeholder={t(T.members.childN, { n: i + 1 })}
                    aria-label={t(T.members.namePh)}
                    className="w-full bg-transparent text-[17px] font-semibold text-label outline-none placeholder:text-label-3"
                  />
                  <div className="text-subhead text-label-2 tnum">{tp(c.age, T.members.years, { n: c.age })}</div>
                </div>
                <Stepper value={c.age} min={1} max={17} onChange={(age) => d.updateChild(c.key, { age })} label={t(T.members.age)} />
              </div>
              {i < d.children.length - 1 && <div className="ml-[72px] h-px scale-y-50 bg-separator" />}
            </motion.div>
          ))}
        </ListGroup>
      ) : (
        <p className="mx-6 mt-6 text-subhead text-label-2">{t(T.members.noKids)}</p>
      )}
    </StepPage>
  )
}

// ---------------------------------------------------------------------------
// kids-taste
// ---------------------------------------------------------------------------
export function KidsTasteStep() {
  const t = useT()
  const name = useMemberName()
  const d = useDraft()
  const [sel, setSel] = useState<string>(d.children[0]?.key ?? '')
  const child = d.children.find((c) => c.key === sel) ?? d.children[0]
  const prefs = child ? d.tastes[child.key] ?? {} : {}
  return (
    <StepPage title={t(T.kidsTaste.title)} sub={t(T.kidsTaste.sub)} cta={t(S.continue)} onCta={goNext}>
      {child ? (
        <>
          {d.children.length > 1 && (
            <div className="px-4 pb-4">
              <SegmentedControl
                value={child.key}
                onChange={setSel}
                options={d.children.map((c, i) => ({
                  value: c.key,
                  label: (
                    <span className="inline-flex items-center gap-1.5">
                      <span>{c.avatar}</span>
                      <span className="truncate">{name(c.name, t(T.members.childN, { n: i + 1 }))}</span>
                    </span>
                  ),
                }))}
              />
            </div>
          )}
          <div className="mx-6 mb-3 flex flex-wrap gap-x-4 gap-y-1 text-footnote text-label-2">
            <span>❤️ {t(TRI_STATE_LABELS.love)}</span>
            <span>✓ {t(TRI_STATE_LABELS.eats)}</span>
            <span>🚫 {t(TRI_STATE_LABELS.refuses)}</span>
          </div>
          <motion.div key={child.key} className="flex flex-wrap gap-2 px-4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={spring.default}>
            {onboarding.foods.map((f) => (
              <TriStateChip
                key={f.tag}
                label={t(f.label)}
                emoji={f.emoji}
                value={prefs[f.tag]}
                onChange={(p) => d.setTaste(child.key, f.tag, p)}
              />
            ))}
          </motion.div>
          <p className="mx-6 mt-5 text-footnote text-label-2">✨ {t(T.kidsTaste.hint)}</p>
        </>
      ) : (
        <p className="mx-6 text-body text-label-2">{t(T.kidsTaste.noKids)}</p>
      )}
    </StepPage>
  )
}

// ---------------------------------------------------------------------------
// family-taste
// ---------------------------------------------------------------------------
export function FamilyTasteStep() {
  const t = useT()
  const d = useDraft()
  return (
    <StepPage title={t(T.familyTaste.title)} sub={t(T.familyTaste.sub)} cta={t(S.continue)} onCta={goNext}>
      <ChipSection title={t(T.familyTaste.likes)}>
        {onboarding.cuisines.map((c) => (
          <Chip key={c.id} emoji={c.emoji} selected={d.cuisines.includes(c.id)} onToggle={() => d.toggle('cuisines', c.id)}>
            {t(c.label)}
          </Chip>
        ))}
      </ChipSection>
      <ChipSection title={t(T.familyTaste.dislikes)} className="mt-7">
        {onboarding.dislikes.map((c) => (
          <Chip key={c.id} emoji={c.emoji} tone="tinted" selected={d.dislikes.includes(c.id)} onToggle={() => d.toggle('dislikes', c.id)}>
            {t(c.label)}
          </Chip>
        ))}
      </ChipSection>
    </StepPage>
  )
}

function ChipSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <h2 className="mx-6 mb-2.5 text-headline text-label">{title}</h2>
      <div className="flex flex-wrap gap-2 px-4">{children}</div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// allergies
// ---------------------------------------------------------------------------
export function AllergiesStep() {
  const t = useT()
  const name = useMemberName()
  const d = useDraft()
  const rows = [
    ...adultRows(d.adults).map((a, i) => ({ ...a, fallback: t(T.members.adultN, { n: i + 1 }) })),
    ...d.children.map((c, i) => ({ key: c.key, name: c.name, avatar: c.avatar, color: c.color, fallback: t(T.members.childN, { n: i + 1 }) })),
  ]
  return (
    <StepPage title={t(T.allergies.title)} sub={t(T.allergies.sub)} cta={t(S.continue)} onCta={goNext}>
      <div className="mx-4 mb-6 flex items-start gap-3 rounded-[14px] bg-success-tint p-3.5">
        <ShieldCheckIcon weight="fill" className="mt-0.5 shrink-0 text-[24px] text-success" />
        <div>
          <p className="text-headline text-label">{t(T.allergies.promise)}</p>
          <p className="mt-0.5 text-subhead text-label-2">{t(T.allergies.promiseSub)}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map((m) => {
          const list = d.allergies[m.key] ?? []
          return (
            <div key={m.key} className="mx-4 rounded-[14px] bg-bg-grouped-2 py-3">
              <div className="flex items-center gap-3 px-3.5">
                <Avatar emoji={m.avatar} color={m.color} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-headline text-label">{name(m.name, m.fallback)}</div>
                  <div className={clsx('text-footnote', list.length ? 'text-danger' : 'text-label-2')}>
                    {list.length
                      ? list.map((id) => t(onboarding.allergens.find((a) => a.id === id)?.label ?? id)).join(', ')
                      : t(T.allergies.none)}
                  </div>
                </div>
              </div>
              <div className="ios-hscroll mt-2.5 flex gap-2 px-3.5">
                {onboarding.allergens.map((a) => (
                  <Chip key={a.id} size="sm" emoji={a.emoji} tone="tinted" selected={list.includes(a.id)} onToggle={() => d.toggleAllergy(m.key, a.id)}>
                    {t(a.label)}
                  </Chip>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <section className="mt-7">
        <h2 className="mx-6 mb-2.5 text-headline text-label">{t(T.allergies.diets)}</h2>
        <div className="flex flex-wrap gap-2 px-4">
          {onboarding.diets.map((c) => (
            <Chip key={c.id} emoji={c.emoji} selected={d.diets.includes(c.id)} onToggle={() => d.toggle('diets', c.id)}>
              {t(c.label)}
            </Chip>
          ))}
        </div>
        <p className="mx-6 mt-2.5 text-footnote text-label-2">{t(T.allergies.dietsFooter)}</p>
      </section>
    </StepPage>
  )
}
