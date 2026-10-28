import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { useDevice } from '../../app'
import { ONBOARDING_STEPS, actions, getState } from '../../store'
import type { OnboardingStep } from '../../store'
import { Button } from '../../ui'

/** The 7 question steps that show the progress bar. */
export const QUESTION_STEPS: OnboardingStep[] = ['members', 'kids-taste', 'family-taste', 'allergies', 'meals', 'budget', 'location']
export const HEADER_H = 52

export const stepIndex = (s: OnboardingStep) => ONBOARDING_STEPS.indexOf(s)

export function goTo(step: OnboardingStep) {
  actions.setOnboardingStep(step)
}
export function goNext() {
  const cur = getState().onboarding.step
  const i = stepIndex(cur)
  const next = ONBOARDING_STEPS[Math.min(i + 1, ONBOARDING_STEPS.length - 1)]
  goTo(next)
}
export function goBack() {
  const cur = getState().onboarding.step
  let i = stepIndex(cur) - 1
  // Never go back into the "generating" moment.
  if (ONBOARDING_STEPS[i] === 'generating') i -= 1
  if (i >= 0) goTo(ONBOARDING_STEPS[i])
}

export type StepPageProps = {
  title?: ReactNode
  sub?: ReactNode
  children?: ReactNode
  cta: ReactNode
  onCta: () => void
  ctaDisabled?: boolean
  ctaIcon?: ReactNode
  secondary?: ReactNode
  onSecondary?: () => void
  /** Extra line above the CTA (fine print). */
  note?: ReactNode
  /** Leaves room for the persistent header (back / progress / skip). */
  header?: boolean
  className?: string
  contentClassName?: string
}

/** A full onboarding page: scrollable content + bottom CTA on a material. Opaque, so it covers the page it slides over. */
export function StepPage({ title, sub, children, cta, onCta, ctaDisabled, ctaIcon, secondary, onSecondary, note, header = true, className, contentClassName }: StepPageProps) {
  const { safeTop, safeBottom } = useDevice()
  return (
    <div className={clsx('absolute inset-0 flex flex-col bg-bg-grouped', className)}>
      <div className="ios-scroll no-scrollbar min-h-0 flex-1" style={{ paddingTop: header ? safeTop + HEADER_H : 0 }}>
        <div className={clsx('pb-6', contentClassName)}>
          {(title || sub) && (
            <div className="px-6 pt-3 pb-5">
              {title && <h1 className="text-title-1 font-bold text-balance text-label">{title}</h1>}
              {sub && <p className="mt-2 text-body text-pretty text-label-2">{sub}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
      <div className="relative shrink-0 px-6 pt-3" style={{ paddingBottom: Math.max(safeBottom, 12) + 8 }}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-bg-grouped to-transparent" />
        {note && <div className="mb-2.5 text-center text-footnote text-label-2">{note}</div>}
        <Button size="lg" full onClick={onCta} disabled={ctaDisabled} iconRight={ctaIcon}>
          {cta}
        </Button>
        {secondary && (
          <Button variant="plain" size="md" full className="mt-1" onClick={onSecondary}>
            {secondary}
          </Button>
        )}
      </div>
    </div>
  )
}
