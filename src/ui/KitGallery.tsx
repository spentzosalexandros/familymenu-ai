import { ArrowsClockwiseIcon, ForkKnifeIcon, LockSimpleIcon, PlusIcon, ShareNetworkIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Screen } from '../app/Screen'
import { family } from '../data'
import type { Preference } from '../data/types'
import { formatEUR, useLang } from '../i18n'
import { Button, IconButton } from './Button'
import { Card, EmptyState, SectionHeader } from './Card'
import { Chip, TriStateChip } from './Chip'
import { SegmentedControl, Slider, Stepper, Switch } from './Controls'
import { AnimatedNumber, Avatar, AvatarStack, Badge, BudgetBar, ProgressBar, Ring, SafeBadge } from './Display'
import { FoodImage } from './FoodImage'
import { ListGroup, ListRow } from './List'
import { SwipeableRow } from './SwipeableRow'

/** Visual QA of the UI kit (dev aid): open with ?sheet=kit */
export function KitGallery() {
  const lang = useLang()
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a')
  const [on, setOn] = useState(true)
  const [n, setN] = useState(4)
  const [budget, setBudget] = useState(140)
  const [chip, setChip] = useState(true)
  const [pref, setPref] = useState<Preference>('love')
  const [spent, setSpent] = useState(127.4)
  return (
    <Screen title="UI kit">
      <div className="space-y-7 pb-6">
        <section className="flex flex-wrap gap-2 px-4">
          <Button>Filled</Button>
          <Button variant="tinted" icon={<ArrowsClockwiseIcon />}>
            Tinted
          </Button>
          <Button variant="gray">Gray</Button>
          <Button variant="plain">Plain</Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
          <Button size="sm" variant="tinted" tone="accent">
            Accent
          </Button>
          <IconButton label="Add" icon={<PlusIcon weight="bold" />} />
          <IconButton label="Share" variant="tinted" size={36} icon={<ShareNetworkIcon weight="bold" />} />
          <Button size="lg" full onClick={() => setSpent((s) => +(s + 3.2).toFixed(2))}>
            Μεγάλο κουμπί · <AnimatedNumber value={spent} format="eur" />
          </Button>
        </section>

        <section className="space-y-3 px-4">
          <SegmentedControl
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'a', label: 'Όλα' },
              { value: 'b', label: 'Μεσημεριανά' },
              { value: 'c', label: 'Βραδινά' },
            ]}
          />
          <div className="flex items-center justify-between">
            <Switch checked={on} onChange={setOn} aria-label="switch" />
            <Stepper value={n} onChange={setN} min={1} max={8} label="Μερίδες" />
            <Stepper value={n} onChange={setN} min={1} max={8} variant="inline" label="Μερίδες" />
          </div>
          <Slider value={budget} onChange={setBudget} min={60} max={250} step={5} aria-label="budget" />
          <BudgetBar value={spent} budget={budget} />
          <ProgressBar value={0.4} tone="accent" />
        </section>

        <section className="ios-hscroll flex gap-2 px-4">
          <Chip selected={chip} onToggle={() => setChip(!chip)} emoji="⚡">
            Πιο γρήγορο
          </Chip>
          <Chip emoji="€">Πιο φθηνό</Chip>
          <Chip tone="tinted" selected emoji="🌿">
            Νηστίσιμο
          </Chip>
          <TriStateChip label="Μακαρόνια" emoji="🍝" value={pref} onChange={setPref} />
          <TriStateChip label="Ψάρι" emoji="🐟" value="refuses" onChange={() => {}} />
          <TriStateChip label="Ρύζι" emoji="🍚" value="eats" onChange={() => {}} />
        </section>

        <section className="flex flex-wrap items-center gap-2 px-4">
          <Badge emoji="⭐">Αγαπημένο του Νίκου</Badge>
          <Badge tone="success" emoji="🌿">
            Νηστίσιμο
          </Badge>
          <Badge tone="accent" emoji="♻️">
            Περίσσευμα
          </Badge>
          <Badge tone="primary">Προσαρμόστηκε</Badge>
          <Badge tone="warning">Λίγος χρόνος</Badge>
          <SafeBadge />
          <AvatarStack members={family.members} size={30} />
          {family.members[3] && <Avatar member={family.members[3]} size={44} />}
          <Ring value={0.82} size={64} stroke={8}>
            <span className="text-footnote font-semibold tnum">82%</span>
          </Ring>
        </section>

        <section className="grid grid-cols-2 gap-3 px-4">
          <FoodImage recipeId="chicken-giouvetsi" />
          <FoodImage recipeId="missing-recipe-id" />
        </section>

        <SectionHeader title="Λίστα" action="Όλα" />
        <ListGroup header="Ρυθμίσεις" footer="Υποσημείωση της ομάδας.">
          <ListRow icon={<ForkKnifeIcon weight="fill" />} iconBg="var(--primary)" title="Με εικονίδιο" value={formatEUR(12.4, lang)} onPress={() => {}} />
          <ListRow title="Με διακόπτη" subtitle="Υπότιτλος" accessory={<Switch checked={on} onChange={setOn} aria-label="x" />} />
          <ListRow title="Διαγραφή" destructive onPress={() => {}} chevron={false} />
        </ListGroup>

        <div className="mx-4 overflow-hidden rounded-[12px] bg-bg-grouped-2">
          <SwipeableRow
            leading={[{ key: 'lock', label: 'Κλείδωμα', icon: <LockSimpleIcon weight="fill" />, color: 'var(--warning)', onPress: () => {} }]}
            trailing={[
              { key: 'swap', label: 'Αλλαγή', icon: <ArrowsClockwiseIcon weight="bold" />, color: 'var(--primary)', onPress: () => {} },
              { key: 'del', label: 'Διαγραφή', icon: <TrashIcon weight="fill" />, color: 'var(--danger)', onPress: () => {} },
            ]}
            contentClassName="bg-bg-grouped-2"
          >
            <div className="flex h-16 items-center px-4 text-body">Σύρε με το δάχτυλο ← →</div>
          </SwipeableRow>
        </div>

        <Card padding="none" className="mx-4">
          <EmptyState emoji="🧺" title="Η λίστα είναι άδεια" message="Πρόσθεσε γεύματα στο πλάνο για να γεμίσει." action={<Button variant="tinted">Προσθήκη</Button>} />
        </Card>
      </div>
    </Screen>
  )
}
