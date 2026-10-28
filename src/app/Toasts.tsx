import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { Toaster, toast as sonner } from 'sonner'
import { useT } from '../i18n'
import type { Text } from '../i18n'
import { useResolvedTheme } from './theme'

export type ToastOptions = {
  message: Text
  description?: Text
  /** Emoji string or an icon element. */
  icon?: ReactNode
  /** e.g. { label: S.undo, onClick: undo } */
  action?: { label: Text; onClick: () => void }
  /** ms, default 3200 (6000 with an action). */
  duration?: number
  tone?: 'default' | 'success' | 'danger'
}

export function showToast(o: ToastOptions) {
  return sonner.custom((id) => <IosToast id={id} {...o} />, {
    duration: o.duration ?? (o.action ? 6000 : 3200),
  })
}

function IosToast({ id, message, description, icon, action, tone = 'default' }: ToastOptions & { id: string | number }) {
  const t = useT()
  return (
    <div
      role="status"
      className={clsx(
        'material-thick flex w-full items-center gap-3 rounded-[20px] py-3 pr-3 pl-4 text-label',
        'shadow-[0_10px_30px_-6px_rgba(0,0,0,0.22),0_0_0_0.5px_var(--separator)]',
      )}
    >
      {icon != null && (
        <span
          className={clsx(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-[17px]',
            tone === 'success' ? 'bg-success-tint text-success' : tone === 'danger' ? 'bg-danger-tint text-danger' : 'bg-primary-tint text-primary',
          )}
          aria-hidden
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-subhead font-semibold">{t(message)}</div>
        {description && <div className="mt-0.5 text-footnote text-label-2">{t(description)}</div>}
      </div>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick()
            sonner.dismiss(id)
          }}
          className="relative shrink-0 rounded-full bg-primary-tint px-3.5 py-1.5 text-subhead font-semibold text-primary transition-transform duration-100 active:scale-95 before:absolute before:-inset-2 before:content-['']"
        >
          {t(action.label)}
        </button>
      )}
    </div>
  )
}

/** Sonner Toaster rendered inside the phone screen (its fixed position is contained by the phone). */
export function PhoneToaster({ bottom }: { bottom: number }) {
  const theme = useResolvedTheme()
  return (
    <Toaster
      position="bottom-center"
      theme={theme}
      offset={{ bottom, left: 12, right: 12 }}
      mobileOffset={{ bottom, left: 12, right: 12 }}
      gap={8}
      visibleToasts={3}
      style={{ ['--width' as string]: '369px' }}
      toastOptions={{ unstyled: true, className: 'w-full' }}
    />
  )
}
