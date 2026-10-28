import { BellIcon, ChatCircleIcon, CopyIcon, DotsThreeIcon, EnvelopeSimpleIcon, PrinterIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { closeSheet, toast } from '../../app'
import { family, ingredients } from '../../data'
import { formatEUR, tNow, useLang, useT, useTp } from '../../i18n'
import { useGroceryList, usePantry, useSelectedStore, useWeek } from '../../store'
import { Avatar, ListGroup, ListRow, Screen, ease, haptic } from '../../ui'
import { atStore, listText, sum } from './shared'
import { T } from './strings'

type AppId = 'viber' | 'whatsapp' | 'messages' | 'email'

/** Brand-neutral circles with a letter or a generic glyph — no logos. */
const APPS: { id: AppId; label: { el: string; en: string }; bg: string; glyph: ReactNode }[] = [
  { id: 'viber', label: T.viaViber, bg: '#7A5FD8', glyph: <span className="text-[24px] font-bold">V</span> },
  { id: 'whatsapp', label: T.viaWhatsApp, bg: '#1E9E6A', glyph: <span className="text-[24px] font-bold">W</span> },
  { id: 'messages', label: T.viaMessages, bg: '#34B759', glyph: <ChatCircleIcon weight="fill" className="text-[28px]" /> },
  { id: 'email', label: T.viaEmail, bg: '#2F7FE0', glyph: <EnvelopeSimpleIcon weight="fill" className="text-[26px]" /> },
]

/** Mock iOS share sheet for the shopping list. */
export function ShareSheet() {
  const t = useT()
  const tp = useTp()
  const lang = useLang()
  const all = useGroceryList()
  const pantry = usePantry()
  const store = useSelectedStore()
  const week = useWeek()
  const items = all.filter((it) => !pantry.includes(it.ingredientId))
  const total = sum(items, store)
  const giorgos = family.members.find((m) => m.id === 'giorgos')

  const desc = () => tNow(T.sentDesc, { items: tp(items.length, T.items), at: atStore(store, lang) })
  const done = (message: string, icon = '✅') => {
    haptic(12)
    closeSheet()
    window.setTimeout(() => toast(message, { icon, description: desc(), tone: 'success' }), 180)
  }
  const sendVia = (app: AppId) => done(tNow(T.sentTo, { app: tNow(APPS.find((a) => a.id === app)!.label) }))

  const copy = () => {
    const text = listText(items, store, lang, t(week.label))
    try {
      void navigator.clipboard?.writeText(text).catch(() => undefined)
    } catch {
      /* clipboard unavailable (insecure origin): the toast still confirms the mock action */
    }
    haptic(8)
    closeSheet()
    window.setTimeout(() => toast(tNow(T.copied), { icon: '📋', description: tNow(T.copiedDesc) }), 180)
  }
  const print = () => {
    closeSheet()
    window.setTimeout(() => toast(tNow(T.printed), { icon: '🖨️', description: tNow(T.printedDesc) }), 180)
  }
  const reminder = () => {
    closeSheet()
    window.setTimeout(() => toast(tNow(T.reminderSet), { icon: '⏰' }), 180)
  }

  const preview = items.slice(0, 3)

  return (
    <Screen title={t(T.shareTitle)}>
      <div className="space-y-5 px-4 pb-4">
        {/* what is being shared */}
        <div className="flex items-center gap-3 rounded-[14px] bg-bg-grouped-2 p-3">
          <img src="/icon.svg" alt="" className="size-12 shrink-0 rounded-[11px] shadow-[0_0_0_0.5px_var(--separator)]" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-headline text-label">
              {t(T.listTitle)} · {t(week.label)}
            </div>
            <div className="truncate text-footnote text-label-2 tnum">
              {t(T.listMeta, { items: tp(items.length, T.items), total: formatEUR(total, lang), at: atStore(store, lang) })}
            </div>
            <div className="mt-0.5 truncate text-caption text-label-3">
              {preview.map((it) => t(ingredients[it.ingredientId].name)).join(', ')}
              {items.length > preview.length && ` ${t(T.more, { n: items.length - preview.length })}`}
            </div>
          </div>
        </div>

        {/* people */}
        <div className="ios-hscroll -mx-4 flex gap-4 px-5">
          {giorgos && (
            <Person
              label={t(giorgos.name)}
              avatar={<Avatar member={giorgos} size={58} ring={false} />}
              badge={APPS[0]}
              onPress={() => done(tNow(T.sentToPerson, { name: tNow(giorgos.name), app: 'Viber' }))}
            />
          )}
          <Person
            label={t(T.familyGroup)}
            avatar={
              <span className="flex size-[58px] items-center justify-center rounded-full bg-fill-3 text-[28px]" aria-hidden>
                👨‍👩‍👧‍👦
              </span>
            }
            badge={APPS[1]}
            onPress={() => done(tNow(T.sentToGroup, { name: tNow(T.familyGroup) }))}
          />
        </div>

        {/* apps */}
        <div className="hairline-t -mx-4 pt-4">
          <div className="ios-hscroll flex gap-4 px-5">
            {APPS.map((a) => (
              <AppButton key={a.id} label={t(a.label)} bg={a.bg} glyph={a.glyph} onPress={() => sendVia(a.id)} />
            ))}
            <AppButton
              label={t(T.viaMore)}
              bg="var(--fill-3)"
              fg="var(--label-2)"
              glyph={<DotsThreeIcon weight="bold" className="text-[28px]" />}
              onPress={() => sendVia('messages')}
            />
          </div>
        </div>

        {/* actions */}
        <ListGroup className="mx-0!">
          <ListRow title={t(T.copy)} accessory={<CopyIcon className="text-[22px] text-label" />} onPress={copy} />
          <ListRow title={t(T.print)} accessory={<PrinterIcon className="text-[22px] text-label" />} onPress={print} />
          <ListRow title={t(T.addReminder)} accessory={<BellIcon className="text-[22px] text-label" />} onPress={reminder} />
        </ListGroup>
      </div>
    </Screen>
  )
}

function Person({
  label,
  avatar,
  badge,
  onPress,
}: {
  label: string
  avatar: ReactNode
  badge: (typeof APPS)[number]
  onPress: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.1, ease: ease.out }}
      className="flex w-[70px] shrink-0 flex-col items-center gap-1.5"
    >
      <span className="relative">
        {avatar}
        <span
          className="absolute -right-0.5 -bottom-0.5 flex size-[22px] items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-bg-grouped"
          style={{ background: badge.bg }}
          aria-hidden
        >
          {badge.id === 'viber' ? 'V' : badge.id === 'whatsapp' ? 'W' : '•'}
        </span>
      </span>
      <span className="w-full truncate text-center text-caption text-label">{label}</span>
    </motion.button>
  )
}

function AppButton({ label, bg, fg = '#fff', glyph, onPress }: { label: string; bg: string; fg?: string; glyph: ReactNode; onPress: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.1, ease: ease.out }}
      className="flex w-[64px] shrink-0 flex-col items-center gap-1.5"
    >
      <span className="flex size-[60px] items-center justify-center rounded-full" style={{ background: bg, color: fg }} aria-hidden>
        {glyph}
      </span>
      <span className="w-full truncate text-center text-caption text-label">{label}</span>
    </motion.button>
  )
}
