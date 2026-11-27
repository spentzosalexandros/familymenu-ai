// Paywall → mock subscription confirmation sheet → success → app (Today).
import { BellIcon, CheckIcon, LockOpenIcon, ShoppingCartIcon, ShieldCheckIcon, SparkleIcon, StarIcon, XIcon, LeafIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useDevice } from '../../app'
import { S, formatEUR, localeOf, useLang, useT } from '../../i18n'
import { actions, useDemoDay, useTrial } from '../../store'
import { Button, IconButton, asset, spring } from '../../ui'
import { StepPage } from './layout'
import { T } from './strings'

export function PaywallStep() {
  const t = useT()
  const lang = useLang()
  const trial = useTrial()
  const [sheet, setSheet] = useState(false)
  const [success, setSuccess] = useState(false)
  const price = formatEUR(trial.price, lang)

  const benefits = [
    { icon: <SparkleIcon weight="fill" />, title: T.paywall.b1, sub: T.paywall.b1s },
    { icon: <ShoppingCartIcon weight="fill" />, title: T.paywall.b2, sub: T.paywall.b2s },
    { icon: <ShieldCheckIcon weight="fill" />, title: T.paywall.b3, sub: T.paywall.b3s },
    { icon: <LeafIcon weight="fill" />, title: T.paywall.b4, sub: T.paywall.b4s },
  ]
  const timeline = [
    { icon: <LockOpenIcon weight="fill" />, title: T.paywall.tlToday, sub: t(T.paywall.tlTodaySub) },
    { icon: <BellIcon weight="fill" />, title: T.paywall.tlDay5, sub: t(T.paywall.tlDay5Sub) },
    { icon: <StarIcon weight="fill" />, title: T.paywall.tlDay7, sub: t(T.paywall.tlDay7Sub, { price }) },
  ]

  return (
    <>
      <StepPage
        cta={t(T.paywall.cta)}
        onCta={() => setSheet(true)}
        note={
          <span className="block">
            <span className="block">{t(T.paywall.price, { price })}</span>
            <span className="block font-semibold text-label">{t(T.paywall.cancel)}</span>
          </span>
        }
      >
        <div className="flex flex-col items-center px-6 pb-5 text-center">
          <img src={asset('/icon.svg')} alt="" className="size-[72px] rounded-[18px] shadow-raised" />
          <span className="mt-3 rounded-full bg-accent-tint px-2.5 py-0.5 text-caption font-semibold text-accent-ink">{t(T.paywall.badge)}</span>
          <h1 className="mt-2 text-title-1 font-bold text-balance text-label">{t(T.paywall.title)}</h1>
          <p className="mt-1.5 text-body text-label-2">{t(T.paywall.sub)}</p>
        </div>

        <ul className="mx-4 space-y-3 rounded-[18px] bg-bg-grouped-2 p-4 shadow-card">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-tint text-[19px] text-primary">{b.icon}</span>
              <span className="min-w-0">
                <span className="block text-headline leading-tight text-label">{t(b.title)}</span>
                <span className="block text-footnote text-label-2">{t(b.sub)}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* trial timeline */}
        <ol className="mx-4 mt-4 rounded-[18px] bg-bg-grouped-2 p-4 shadow-card">
          {timeline.map((s, i) => (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {i < timeline.length - 1 && <span className="absolute top-8 bottom-0 left-[15px] w-0.5 rounded-full bg-primary/25" />}
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] text-on-primary">{s.icon}</span>
              <span className="min-w-0 pt-0.5">
                <span className="block text-headline leading-tight text-label">{t(s.title)}</span>
                <span className="block text-footnote text-label-2">{s.sub}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex justify-center gap-4 text-footnote text-label-3">
          <span>{t(T.paywall.restore)}</span>
          <span>{t(T.paywall.terms)}</span>
          <span>{t(T.paywall.privacy)}</span>
        </div>
        <p className="mt-1 text-center text-caption text-label-3">{t(T.paywall.demoNote)}</p>
      </StepPage>

      <SubscribeSheet
        open={sheet}
        onClose={() => setSheet(false)}
        onDone={() => {
          setSheet(false)
          setSuccess(true)
        }}
      />
      <AnimatePresence>{success && <Success key="ok" />}</AnimatePresence>
    </>
  )
}

// ---------------------------------------------------------------------------
// mock subscription confirmation (generic iOS-style purchase sheet, no store logos)
// ---------------------------------------------------------------------------
function SubscribeSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const t = useT()
  const lang = useLang()
  const trial = useTrial()
  const today = useDemoDay()
  const { safeBottom } = useDevice()
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle')
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!open) setPhase('idle')
  }, [open])
  useEffect(() => {
    if (phase === 'busy') {
      const id = window.setTimeout(() => setPhase('done'), 900)
      return () => clearTimeout(id)
    }
    if (phase === 'done') {
      const id = window.setTimeout(() => doneRef.current(), 750)
      return () => clearTimeout(id)
    }
  }, [phase])

  const price = formatEUR(trial.price, lang)
  const first = new Date(Date.parse(today?.date ?? '2026-10-27') + trial.daysLeft * 86_400_000)
  const firstLabel = new Intl.DateTimeFormat(localeOf(lang), { day: 'numeric', month: 'long', year: 'numeric' }).format(first)

  const rows = [
    { k: t(T.subscribe.trial), v: t(T.subscribe.trialValue) },
    { k: t(T.subscribe.starting, { date: firstLabel }), v: t(T.subscribe.perMonth, { price }) },
    { k: t(T.subscribe.account), v: t(T.subscribe.accountValue) },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="dim"
            className="absolute inset-0 z-40 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={phase === 'idle' ? onClose : undefined}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={t(T.subscribe.title)}
            className="absolute inset-x-2 bottom-2 z-50 overflow-hidden rounded-[32px] bg-bg-elevated shadow-float"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={spring.sheet}
          >
            <div className="flex items-center justify-between px-5 pt-4">
              <span className="text-headline text-label">{t(T.subscribe.title)}</span>
              <IconButton label={t(S.close)} icon={<XIcon weight="bold" />} variant="gray" size={30} onClick={onClose} disabled={phase !== 'idle'} />
            </div>
            <div className="flex items-center gap-3 px-5 pt-4">
              <img src={asset('/icon.svg')} alt="" className="size-14 rounded-[14px] shadow-card" />
              <div className="min-w-0">
                <div className="text-headline text-label">{t(T.subscribe.product)}</div>
                <div className="text-subhead text-label-2">{t(T.subscribe.plan)}</div>
              </div>
            </div>
            <dl className="mx-5 mt-4 divide-y divide-separator/60 rounded-[14px] bg-fill-4 px-3.5">
              {rows.map((r) => (
                <div key={r.k} className="flex items-center justify-between gap-3 py-2.5 text-subhead">
                  <dt className="text-label-2">{r.k}</dt>
                  <dd className="font-semibold text-label tnum">{r.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mx-5 mt-3 text-caption text-label-3">{t(T.subscribe.fine)}</p>
            <div className="px-5 pt-4" style={{ paddingBottom: Math.max(safeBottom - 8, 12) + 6 }}>
              <Button
                size="lg"
                full
                tone={phase === 'done' ? 'success' : 'primary'}
                loading={phase === 'busy'}
                onClick={() => phase === 'idle' && setPhase('busy')}
                icon={phase === 'done' ? <CheckIcon weight="bold" /> : undefined}
              >
                {phase === 'idle' ? t(T.subscribe.confirm) : phase === 'busy' ? t(T.subscribe.processing) : t(T.subscribe.done)}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// success → Today
// ---------------------------------------------------------------------------
function Success() {
  const t = useT()
  const { safeBottom } = useDevice()
  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center bg-bg px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <motion.div
          className="relative flex size-24 items-center justify-center rounded-full bg-primary text-[46px] text-on-primary shadow-raised"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring.bouncy, delay: 0.05 }}
        >
          <CheckIcon weight="bold" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute text-[18px]"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], x: Math.cos((i / 6) * Math.PI * 2) * 76, y: Math.sin((i / 6) * Math.PI * 2) * 76, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {['✨', '🍝', '🥕', '✨', '🍋', '🧀'][i]}
            </motion.span>
          ))}
        </motion.div>
        <motion.h1 className="mt-7 text-title-1 font-bold text-label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.default, delay: 0.15 }}>
          {t(T.success.title)}
        </motion.h1>
        <motion.p className="mt-2 text-body text-label-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.default, delay: 0.22 }}>
          {t(T.success.sub)}
        </motion.p>
      </div>
      <div className="w-full" style={{ paddingBottom: Math.max(safeBottom, 12) + 8 }}>
        <Button size="lg" full onClick={() => actions.completeOnboarding()}>
          {t(T.success.cta)}
        </Button>
      </div>
    </motion.div>
  )
}
