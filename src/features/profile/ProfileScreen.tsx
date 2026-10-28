import { ArrowCounterClockwiseIcon, BellIcon, CameraIcon, CheckIcon, CrownSimpleIcon, InfoIcon, LeafIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { alert, toast } from '../../app'
import { PALETTE_INFO } from '../../app/Presenter'
import { family, stores as dataStores } from '../../data'
import type { StoreId } from '../../data/types'
import { S, formatEUR, formatNumber, joinNames, useLang, useT, useTp } from '../../i18n'
import { PALETTES, actions, usePrefs, useSettings, useTrial } from '../../store'
import { Avatar, AvatarStack, Card, ListGroup, ListRow, ProgressBar, Screen, SegmentedControl, Slider, Switch } from '../../ui'
import { ALLERGEN_LABEL, DIET_LABEL, FALLBACK_STORES, PS } from './strings'

/** Profile & settings (large sheet, opened from the avatar in the nav bar). */
export function ProfileScreen() {
  const t = useT()
  const tp = useTp()
  const lang = useLang()
  const settings = useSettings()
  const prefs = usePrefs()
  const trial = useTrial()
  const members = family.members
  const storeList = dataStores.length ? dataStores : FALLBACK_STORES
  const diets = family.diets.filter((d) => d.startsWith('fasting')).map((d) => t(DIET_LABEL[d]))

  const confirmReset = () =>
    alert({
      title: PS.resetTitle,
      message: PS.resetBody,
      actions: [
        { label: S.cancel, style: 'cancel' },
        {
          label: PS.resetDemo,
          style: 'destructive',
          onPress: () => {
            actions.resetDemo()
            toast(PS.resetDone, { icon: '↺' })
          },
        },
      ],
    })

  return (
    <Screen title={t(PS.title)}>
      {/* family header */}
      <div className="flex flex-col items-center px-6 pt-2 pb-6 text-center">
        <AvatarStack members={members} size={52} />
        <h1 className="mt-3 text-title-2 text-label">{t(PS.familyName)}</h1>
        <p className="mt-0.5 text-subhead text-label-2">
          {t(family.city)} · {t(PS.people, { n: members.length })}
        </p>
      </div>

      <div className="space-y-8">
        {/* subscription */}
        <section className="mx-4">
          <div className="px-4 pb-1.5 text-footnote text-label-2">{t(PS.subscription)}</div>
          <Card padding="none" className="shadow-none">
            <div className="flex items-start gap-3 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-primary text-[20px] text-on-primary">
                <CrownSimpleIcon weight="fill" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-headline text-label">{t(PS.planName)}</span>
                  <span className="rounded-full bg-primary-tint px-2 py-0.5 text-caption font-semibold text-primary">{t(PS.trial)}</span>
                </div>
                <p className="mt-0.5 text-subhead text-label">{tp(trial.daysLeft, PS.daysLeft)}</p>
                <p className="text-footnote text-label-2">{t(PS.thenPrice, { price: formatEUR(trial.price, lang) })}</p>
                <ProgressBar className="mt-3" value={(7 - trial.daysLeft) / 7} height={5} aria-label={t(PS.trial)} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert({ title: PS.manageAlertTitle, message: PS.manageAlertBody })}
              className="hairline-t flex h-11 w-full items-center px-4 text-left text-body text-primary transition-colors active:bg-fill-3"
            >
              {t(PS.manage)}
            </button>
          </Card>
        </section>

        {/* budget */}
        <ListGroup header={t(PS.budget)} footer={t(PS.budgetFooter)}>
          <ListRow title={t(PS.weeklyBudget)} value={t(PS.perWeek, { v: formatEUR(prefs.budget, lang, { decimals: 0 }) })} />
          <div className="px-4 pb-1">
            <Slider
              value={prefs.budget}
              min={60}
              max={250}
              step={5}
              onChange={actions.setBudget}
              aria-label={t(PS.budget)}
              valueText={formatEUR(prefs.budget, lang, { decimals: 0 })}
            />
          </div>
        </ListGroup>

        {/* stores */}
        <ListGroup header={t(PS.stores)} footer={t(PS.storesFooter)}>
          {storeList.map((st) => {
            const on = prefs.stores.includes(st.id as StoreId)
            return (
              <ListRow
                key={st.id}
                icon={<span className="size-3 rounded-full" style={{ background: st.color }} />}
                title={st.name}
                subtitle={t(PS.km, { v: formatNumber(st.distanceKm, lang, 1, 1) })}
                accessory={
                  <CheckIcon weight="bold" className={clsx('text-[18px] text-primary transition-opacity duration-150', on ? 'opacity-100' : 'opacity-0')} />
                }
                onPress={() => actions.togglePreferredStore(st.id as StoreId)}
                aria-label={`${st.name}${on ? ' ✓' : ''}`}
              />
            )
          })}
        </ListGroup>

        {/* diet & allergies */}
        <ListGroup header={t(PS.diet)} footer={t(PS.safetyFooter)}>
          {members.map((m) => (
            <ListRow
              key={m.id}
              icon={<Avatar member={m} size={30} ring={false} />}
              title={m.name[lang]}
              subtitle={
                m.allergies.length ? (
                  <span className="font-medium text-danger">
                    {t(PS.allergy, { list: joinNames(m.allergies.map((a) => t(ALLERGEN_LABEL[a])), lang) })}
                  </span>
                ) : (
                  t(PS.noAllergy)
                )
              }
            />
          ))}
          <ListRow icon={<LeafIcon weight="fill" />} iconBg="#34A853" title={t(PS.fasting)} value={diets.length ? diets.join(', ') : t(PS.dietsNone)} />
        </ListGroup>

        {/* notifications */}
        <ListGroup header={t(PS.notifications)}>
          <ListRow
            icon={<BellIcon weight="fill" />}
            iconBg="#FF3B30"
            title={t(PS.reminder)}
            subtitle={t(PS.reminderSub, { time: prefs.reminderTime })}
            accessory={<Switch checked={prefs.feedbackReminder} onChange={actions.setFeedbackReminder} aria-label={t(PS.reminder)} />}
          />
        </ListGroup>

        {/* language + appearance */}
        <ListGroup header={`${t(PS.language)} · ${t(PS.appearance)}`}>
          <div className="space-y-3 px-4 py-3.5">
            <SegmentedControl
              aria-label={t(PS.language)}
              value={settings.lang}
              onChange={actions.setLang}
              options={[
                { value: 'el', label: 'Ελληνικά' },
                { value: 'en', label: 'English' },
              ]}
            />
            <SegmentedControl
              aria-label={t(PS.appearance)}
              value={settings.theme}
              onChange={actions.setTheme}
              options={[
                { value: 'light', label: t(PS.light) },
                { value: 'dark', label: t(PS.dark) },
                { value: 'auto', label: t(PS.auto) },
              ]}
            />
          </div>
          <div className="hairline-t flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="text-body text-label">{t(PS.colours)}</span>
            <div className="flex gap-2.5" role="radiogroup" aria-label={t(PS.colours)}>
              {PALETTES.map((p) => {
                const info = PALETTE_INFO[p]
                const active = settings.palette === p
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={t(info.name)}
                    onClick={() => actions.setPalette(p)}
                    className={clsx(
                      'relative size-8 rounded-full transition-transform duration-100 active:scale-90 before:absolute before:-inset-1.5 before:content-[\'\']',
                      active ? 'ring-2 ring-label ring-offset-2 ring-offset-bg-grouped-2' : 'ring-1 ring-separator',
                    )}
                    style={{ background: `conic-gradient(${info.primary} 0 50%, ${info.accent} 50% 100%)` }}
                  />
                )
              })}
            </div>
          </div>
        </ListGroup>

        {/* about */}
        <ListGroup header={t(PS.about)} footer={t(PS.demoNote)}>
          <ListRow icon={<InfoIcon weight="fill" />} iconBg="#8E8E93" title={t(PS.version)} value={t(PS.versionValue)} />
          <ListRow icon={<CameraIcon weight="fill" />} iconBg="#34C759" title={t(PS.credits)} subtitle={t(PS.creditsSub)} onPress={() => window.open('/images/CREDITS.md', '_blank', 'noopener')} />
          <ListRow icon={<ArrowCounterClockwiseIcon weight="bold" />} iconBg="#FF9500" title={t(PS.resetDemo)} destructive onPress={confirmReset} chevron={false} />
        </ListGroup>
      </div>
    </Screen>
  )
}
