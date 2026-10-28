import { WarningCircleIcon } from '@phosphor-icons/react'
import { Component, Suspense } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { S, useT } from '../i18n'
import { Button } from '../ui/Button'

type Props = { name: string; children: ReactNode; onClose?: () => void; resetKey?: string }
type State = { error: Error | null }

/** Catches render errors of one route so the rest of the app keeps working. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error): State {
    return { error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[route:${this.props.name}]`, error, info.componentStack)
  }
  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }
  render() {
    if (this.state.error) {
      return <RouteError name={this.props.name} error={this.state.error} onRetry={() => this.setState({ error: null })} onClose={this.props.onClose} />
    }
    return this.props.children
  }
}

function RouteError({ name, error, onRetry, onClose }: { name: string; error: Error; onRetry: () => void; onClose?: () => void }) {
  const t = useT()
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-grouped px-8 text-center">
      <WarningCircleIcon className="mb-3 text-[44px] text-warning" weight="duotone" />
      <h2 className="text-title-3 text-label">{t(S.routeError.title)}</h2>
      <p className="mt-1.5 max-w-[30ch] text-subhead text-label-2">{t(S.routeError.body)}</p>
      <code className="mt-4 max-w-full truncate rounded-lg bg-fill-4 px-2.5 py-1 text-caption text-label-3">
        {name}: {error.message}
      </code>
      <div className="mt-6 flex gap-3">
        {onClose && (
          <Button variant="gray" onClick={onClose}>
            {t(S.back)}
          </Button>
        )}
        <Button variant="tinted" onClick={onRetry}>
          {t(S.retry)}
        </Button>
      </div>
    </div>
  )
}

/** ErrorBoundary + Suspense (lazy feature chunk) for one route. */
export function RouteBoundary({ name, children, onClose, fallback }: Props & { fallback?: ReactNode }) {
  return (
    <ErrorBoundary name={name} onClose={onClose}>
      <Suspense fallback={fallback ?? <div className="absolute inset-0 bg-bg-grouped" />}>{children}</Suspense>
    </ErrorBoundary>
  )
}
