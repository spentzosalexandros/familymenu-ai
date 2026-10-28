// The first-run flow. One question per screen; steps slide horizontally like a navigation stack
// (forward: in from the right, back: out to the right), interruptible springs, driven by store.onboarding.step
// so ?onboarding=<step> deep links land on any step.
import { CaretLeftIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import type { ComponentType } from 'react'
import { useState } from 'react'
import { useDevice } from '../../app'
import { S, useT } from '../../i18n'
import { ONBOARDING_STEPS } from '../../store'
import type { OnboardingStep } from '../../store'
import { IconButton, spring } from '../../ui'
import { HEADER_H, QUESTION_STEPS, goBack, goNext, stepIndex } from './layout'
import { PaywallStep } from './Paywall'
import { AllergiesStep, FamilyTasteStep, KidsTasteStep, MembersStep } from './steps-family'
import { GeneratingStep, ReadyStep, WelcomeStep } from './steps-moments'
import { BudgetStep, LocationStep, MealsStep } from './steps-plan'
import { T } from './strings'

const STEPS: Record<OnboardingStep, ComponentType> = {
  welcome: WelcomeStep,
  members: MembersStep,
  'kids-taste': KidsTasteStep,
  'family-taste': FamilyTasteStep,
  allergies: AllergiesStep,
  meals: MealsStep,
  budget: BudgetStep,
  location: LocationStep,
  generating: GeneratingStep,
  ready: ReadyStep,
  paywall: PaywallStep,
}

/** Steps where "Παράλειψη" makes sense (the prefilled answers are kept). */
const SKIPPABLE: OnboardingStep[] = ['kids-taste', 'family-taste']
/** Steps with a back button but no progress bar. */
const BACK_ONLY: OnboardingStep[] = ['ready', 'paywall']

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-28%', opacity: dir > 0 ? 1 : 0.7, zIndex: dir > 0 ? 2 : 1 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-28%' : '100%', opacity: dir > 0 ? 0.7 : 1, zIndex: dir > 0 ? 1 : 2 }),
}

export function OnboardingFlow({ step: stepProp }: { step?: OnboardingStep }) {
  const step: OnboardingStep = stepProp && ONBOARDING_STEPS.includes(stepProp) ? stepProp : 'welcome'
  // Direction derived from the previous step (React's "adjust state on prop change" pattern).
  const [nav, setNav] = useState({ step, dir: 1 })
  if (nav.step !== step) setNav({ step, dir: stepIndex(step) >= stepIndex(nav.step) ? 1 : -1 })
  const dir = nav.step === step ? nav.dir : 1
  const Step = STEPS[step]

  return (
    <div className="absolute inset-0 overflow-hidden bg-bg-grouped">
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={step}
          className="absolute inset-0 shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.18)]"
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={spring.push}
        >
          <Step />
        </motion.div>
      </AnimatePresence>
      <Header step={step} />
    </div>
  )
}

function Header({ step }: { step: OnboardingStep }) {
  const t = useT()
  const { safeTop } = useDevice()
  const qi = QUESTION_STEPS.indexOf(step)
  const showProgress = qi >= 0
  const show = showProgress || BACK_ONLY.includes(step)
  const progress = showProgress ? (qi + 1) / QUESTION_STEPS.length : 1
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="hdr"
          className="absolute inset-x-0 top-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-bg-grouped from-70% to-transparent" style={{ height: safeTop + HEADER_H + 10 }} />
          <div className="relative flex items-center gap-2 px-2" style={{ paddingTop: safeTop, height: safeTop + HEADER_H }}>
            <IconButton label={t(S.back)} icon={<CaretLeftIcon weight="bold" />} variant="plain" size={34} onClick={goBack} />
            <div className="flex-1 px-1">
              {showProgress && (
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-fill-3"
                  role="progressbar"
                  aria-valuemin={1}
                  aria-valuemax={QUESTION_STEPS.length}
                  aria-valuenow={qi + 1}
                  aria-label={t(T.stepOf, { n: qi + 1, total: QUESTION_STEPS.length })}
                >
                  <motion.div className="h-full w-full rounded-full bg-primary" style={{ originX: 0 }} initial={false} animate={{ scaleX: progress }} transition={spring.default} />
                </div>
              )}
            </div>
            <div className="flex min-w-[76px] justify-end pr-2">
              {SKIPPABLE.includes(step) && (
                <button type="button" className="pressable relative h-11 px-2 text-[17px] text-primary" onClick={goNext}>
                  {t(S.skip)}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
