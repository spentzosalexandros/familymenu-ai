import { ArrowsClockwiseIcon, BookOpenTextIcon, ChatCircleTextIcon, HammerIcon, ShareNetworkIcon } from '@phosphor-icons/react'
import { S, useT } from '../i18n'
import type { Text } from '../i18n'
import { actions } from '../store'
import { asset } from '../ui/asset'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Display'
import { ListGroup, ListRow } from '../ui/List'
import { ContextMenu } from './ContextMenu'
import { openSheet, push, toast } from './nav'
import { Screen } from './Screen'
import { useScreen } from './screen-context'

export type PlaceholderProps = {
  /** Export name, e.g. 'TodayScreen'. */
  name: string
  title: Text
  params?: Record<string, unknown>
  /** Owner agent, shown in the card. */
  owner?: string
  /** Large title for tab roots. */
  tabRoot?: boolean
}

/**
 * A clearly-labelled placeholder that already uses the real scaffold (large title, back button,
 * sheet header…). Feature agents replace these with the real screens.
 */
export function Placeholder({ name, title, params, owner, tabRoot }: PlaceholderProps) {
  const t = useT()
  const ctx = useScreen()
  const entries = Object.entries(params ?? {}).filter(([, v]) => v != null)
  return (
    <Screen title={t(title)} avatar={tabRoot} subtitle={tabRoot ? t({ el: 'Προσωρινή οθόνη', en: 'Placeholder' }) : undefined}>
      <div className="space-y-6 px-4 pt-2">
        <ContextMenu
          title={name}
          items={[
            { key: 'recipe', label: { el: 'Άνοιγμα συνταγής', en: 'Open a recipe' }, icon: <BookOpenTextIcon />, onSelect: () => push('recipe', { id: 'chicken-giouvetsi', mealId: 'tue-lunch' }) },
            { key: 'swap', label: { el: 'Αλλαγή γεύματος', en: 'Swap a meal' }, icon: <ArrowsClockwiseIcon />, onSelect: () => openSheet('swap', { mealId: 'tue-lunch' }) },
            { key: 'toast', label: { el: 'Δοκιμή ειδοποίησης', en: 'Test toast' }, icon: <ChatCircleTextIcon />, onSelect: () => toast({ el: 'Η αλλαγή αποθηκεύτηκε', en: 'Change saved' }, { icon: '✓', action: { label: S.undo, onClick: () => {} } }) },
          ]}
        >
        <Card padding="lg">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-primary-tint text-[22px] text-primary">
              <HammerIcon weight="duotone" />
            </span>
            <div className="min-w-0 flex-1">
              <Badge tone="accent">{t(S.placeholder.badge)}</Badge>
              <h2 className="mt-1.5 font-mono text-headline text-label">{name}</h2>
              {owner && <p className="text-footnote text-label-2">src/features/{owner}</p>}
            </div>
          </div>
          <p className="mt-3 text-subhead text-label-2">{t(S.placeholder.body)}</p>
          {entries.length > 0 && (
            <dl className="mt-3 space-y-1 rounded-[10px] bg-fill-4 p-2.5 font-mono text-caption">
              {entries.map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-label-2">{k}</dt>
                  <dd className="truncate text-label">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
        </ContextMenu>

        {ctx.container === 'stack' && (
          <ListGroup header={t({ el: 'Δοκιμή πλοήγησης', en: 'Navigation test' })}>
            <ListRow
              icon={<BookOpenTextIcon weight="fill" />}
              iconBg="var(--primary)"
              title={t({ el: 'Άνοιγμα συνταγής', en: 'Open a recipe' })}
              onPress={() => push('recipe', { id: 'chicken-giouvetsi', mealId: 'tue-lunch' })}
            />
            <ListRow
              icon={<ArrowsClockwiseIcon weight="bold" />}
              iconBg="var(--accent)"
              title={t({ el: 'Αλλαγή γεύματος', en: 'Swap a meal' })}
              onPress={() => openSheet('swap', { mealId: 'tue-lunch' })}
            />
            <ListRow
              icon={<ChatCircleTextIcon weight="fill" />}
              iconBg="#5E9CD8"
              title={t({ el: 'Πώς πήγε;', en: 'How did it go?' })}
              onPress={() => openSheet('feedback', { mealId: 'mon-dinner' })}
            />
            <ListRow
              icon={<ShareNetworkIcon weight="bold" />}
              iconBg="#8E8E93"
              title={t({ el: 'Κοινοποίηση λίστας', en: 'Share list' })}
              onPress={() => openSheet('share')}
            />
          </ListGroup>
        )}
      </div>
    </Screen>
  )
}

/** Placeholder for the onboarding flow: lets you finish onboarding. */
export function OnboardingPlaceholder({ step }: { step?: string }) {
  const t = useT()
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-grouped px-8 text-center">
      <img src={asset('/icon.svg')} alt="" className="mb-5 size-20 rounded-[20px] shadow-raised" />
      <Badge tone="accent">{t(S.placeholder.badge)}</Badge>
      <h1 className="mt-3 text-title-1 text-label">OnboardingFlow</h1>
      <p className="mt-2 text-subhead text-label-2">
        step: <code className="font-mono">{step ?? 'welcome'}</code>
      </p>
      <div className="absolute inset-x-6 bottom-12">
        <Button size="lg" full onClick={() => actions.completeOnboarding()}>
          {t(S.continue)}
        </Button>
      </div>
    </div>
  )
}
