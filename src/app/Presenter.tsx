import { ArrowCounterClockwiseIcon, ArrowRightIcon, BellRingingIcon, CalendarCheckIcon, CheckIcon, SparkleIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { L10n } from '../data/types'
import { useT } from '../i18n'
import type { Palette } from '../store'
import { PALETTES, actions, useSettings } from '../store'
import { SegmentedControl } from '../ui/Controls'
import { JOURNEYS, resetDemo, sendFeedbackNotification, skipToSunday } from './journeys'
import { Screen } from './Screen'

const P = {
  title: { el: 'FamilyMenu AI', en: 'FamilyMenu AI' },
  subtitle: { el: 'Διαδραστικό πρωτότυπο για παρουσίαση', en: 'Interactive prototype for presenting' },
  journeys: { el: 'Διαδρομές', en: 'Journeys' },
  scenarios: { el: 'Σενάρια', en: 'Scenarios' },
  appearance: { el: 'Εμφάνιση', en: 'Appearance' },
  notify: { el: 'Ειδοποίηση 16:30', en: 'Notification 16:30' },
  notifyHint: { el: '«Πώς πήγε το γιουβέτσι;»', en: '“How was the giouvetsi?”' },
  sunday: { el: 'Πάμε Κυριακή', en: 'Skip to Sunday' },
  sundayHint: { el: 'Ανασκόπηση εβδομάδας', en: 'Weekly recap' },
  onboarding: { el: 'Ξανά η εισαγωγή', en: 'Restart onboarding' },
  onboardingHint: { el: 'Από το καλωσόρισμα', en: 'From the welcome screen' },
  reset: { el: 'Επαναφορά demo', en: 'Reset demo' },
  resetHint: { el: 'Αρχικό πλάνο και λίστα', en: 'Initial plan and list' },
  language: { el: 'Γλώσσα', en: 'Language' },
  theme: { el: 'Θέμα', en: 'Theme' },
  palette: { el: 'Χρώματα', en: 'Colours' },
  light: { el: 'Φωτεινό', en: 'Light' },
  dark: { el: 'Σκοτεινό', en: 'Dark' },
  auto: { el: 'Αυτόματο', en: 'Auto' },
  footer: {
    el: 'Ενδεικτικές τιμές και δεδομένα — χωρίς πραγματικό AI, backend ή πληρωμές.',
    en: 'Indicative prices and data — no real AI, backend or payments.',
  },
  phoneHint: {
    el: 'Στο κινητό: κράτα πατημένη την ώρα για αυτά τα χειριστήρια.',
    en: 'On a phone: long-press the clock for these controls.',
  },
  sheetTitle: { el: 'Παρουσίαση', en: 'Presenter' },
}

export const PALETTE_INFO: Record<Palette, { name: L10n; primary: string; accent: string; bg: string }> = {
  olive: { name: { el: 'Ελιά', en: 'Olive' }, primary: '#5b772b', accent: '#c9653b', bg: '#f6f1e7' },
  tomato: { name: { el: 'Ντομάτα', en: 'Tomato' }, primary: '#d13a2b', accent: '#2f7d35', bg: '#ffffff' },
  aegean: { name: { el: 'Αιγαίο', en: 'Aegean' }, primary: '#1562b0', accent: '#f5c518', bg: '#ffffff' },
}

function PresenterControls({ onAction }: { onAction?: () => void }) {
  const t = useT()
  const settings = useSettings()
  const [last, setLast] = useState<string | null>(null)
  const done = (id: string, fn: () => void) => () => {
    setLast(id)
    onAction?.()
    // Let the presenter sheet close before navigating.
    window.setTimeout(fn, onAction ? 320 : 0)
  }
  return (
    <div className="space-y-6">
      <section>
        <GroupTitle>{t(P.journeys)}</GroupTitle>
        <div className="overflow-hidden rounded-[16px] bg-bg-grouped-2 shadow-card">
          {JOURNEYS.map((j, i) => (
            <button
              key={j.id}
              type="button"
              onClick={done(j.id, j.run)}
              className={clsx(
                'group relative flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors duration-100 hover:bg-fill-4 active:bg-fill-3',
                i > 0 && 'hairline-t',
              )}
            >
              <span className="relative flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-fill-4 text-[20px]">
                {j.emoji}
                <span className="absolute -top-1 -left-1 flex size-[18px] items-center justify-center rounded-full bg-primary text-[10.5px] font-bold text-on-primary tnum">
                  {i + 1}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-subhead font-semibold text-label">{t(j.title)}</span>
                <span className="mt-0.5 block text-footnote leading-[17px] text-label-2">{t(j.description)}</span>
              </span>
              {last === j.id ? (
                <CheckIcon weight="bold" className="shrink-0 text-[15px] text-primary" />
              ) : (
                <ArrowRightIcon weight="bold" className="shrink-0 text-[14px] text-label-3 transition-transform duration-150 group-hover:translate-x-0.5" />
              )}
            </button>
          ))}
        </div>
      </section>

      <section>
        <GroupTitle>{t(P.scenarios)}</GroupTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <Tile icon={<BellRingingIcon weight="fill" />} title={t(P.notify)} hint={t(P.notifyHint)} onClick={done('notify', sendFeedbackNotification)} />
          <Tile icon={<CalendarCheckIcon weight="fill" />} title={t(P.sunday)} hint={t(P.sundayHint)} onClick={done('sunday', skipToSunday)} />
          <Tile icon={<SparkleIcon weight="fill" />} title={t(P.onboarding)} hint={t(P.onboardingHint)} onClick={done('onb', () => actions.restartOnboarding('welcome'))} />
          <Tile icon={<ArrowCounterClockwiseIcon weight="bold" />} title={t(P.reset)} hint={t(P.resetHint)} onClick={done('reset', resetDemo)} />
        </div>
      </section>

      <section>
        <GroupTitle>{t(P.appearance)}</GroupTitle>
        <div className="space-y-3.5 rounded-[16px] bg-bg-grouped-2 p-3.5 shadow-card">
          <Row label={t(P.language)}>
            <SegmentedControl
              aria-label={t(P.language)}
              className="w-[180px]"
              value={settings.lang}
              onChange={actions.setLang}
              options={[
                { value: 'el', label: 'Ελληνικά' },
                { value: 'en', label: 'English' },
              ]}
            />
          </Row>
          <Row label={t(P.theme)}>
            <SegmentedControl
              aria-label={t(P.theme)}
              className="w-[220px]"
              value={settings.theme}
              onChange={actions.setTheme}
              options={[
                { value: 'light', label: t(P.light) },
                { value: 'dark', label: t(P.dark) },
                { value: 'auto', label: t(P.auto) },
              ]}
            />
          </Row>
          <Row label={t(P.palette)}>
            <div className="flex gap-2" role="radiogroup" aria-label={t(P.palette)}>
              {PALETTES.map((p) => (
                <Swatch key={p} palette={p} active={settings.palette === p} onClick={() => actions.setPalette(p)} label={t(PALETTE_INFO[p].name)} />
              ))}
            </div>
          </Row>
        </div>
      </section>
      <p className="px-1 text-footnote leading-[18px] text-label-2">{t(P.footer)}</p>
    </div>
  )
}

function GroupTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 px-1 text-footnote font-semibold text-label-2">{children}</h3>
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-subhead text-label">{label}</span>
      {children}
    </div>
  )
}

function Tile({ icon, title, hint, onClick }: { icon: ReactNode; title: string; hint: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 rounded-[16px] bg-bg-grouped-2 p-3 text-left shadow-card transition-[transform,background-color] duration-100 hover:bg-[color-mix(in_srgb,var(--bg-grouped-2)_92%,var(--label))] active:scale-[0.97]"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-primary-tint text-[16px] text-primary">{icon}</span>
      <span>
        <span className="block text-subhead font-semibold text-label">{title}</span>
        <span className="block text-caption text-label-2">{hint}</span>
      </span>
    </button>
  )
}

function Swatch({ palette, active, onClick, label }: { palette: Palette; active: boolean; onClick: () => void; label: string }) {
  const p = PALETTE_INFO[palette]
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={clsx(
        'relative flex size-9 items-center justify-center rounded-full transition-transform duration-100 active:scale-90',
        active ? 'ring-2 ring-label ring-offset-2 ring-offset-bg-grouped-2' : 'ring-1 ring-separator',
      )}
      style={{ background: `conic-gradient(${p.primary} 0 50%, ${p.accent} 50% 100%)` }}
    >
      <span className="size-3.5 rounded-full border border-black/10" style={{ background: p.bg }} />
    </button>
  )
}

/** Desktop panel next to the phone. */
export function PresenterPanel() {
  const t = useT()
  return (
    <aside className="w-[380px] shrink-0" aria-label={t(P.sheetTitle)}>
      <header className="mb-5 flex items-center gap-3 px-1">
        <img src="/icon.svg" alt="" className="size-12 rounded-[12px] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.3)]" />
        <div>
          <h1 className="text-title-3 font-bold text-label">{t(P.title)}</h1>
          <p className="text-footnote text-label-2">{t(P.subtitle)}</p>
        </div>
      </header>
      <PresenterControls />
      <p className="mt-2 px-1 text-caption text-label-3">{t(P.phoneHint)}</p>
    </aside>
  )
}

/** The same controls as a sheet (phones: long-press the status-bar clock). */
export function PresenterSheet() {
  const t = useT()
  return (
    <Screen title={t(P.sheetTitle)}>
      <div className="px-4 pt-2">
        <PresenterControls onAction={() => actions.dismissKind('sheet')} />
      </div>
    </Screen>
  )
}
