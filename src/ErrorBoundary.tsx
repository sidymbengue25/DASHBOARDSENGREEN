import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error)
    return { hasError: true, message }
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-lg bg-white shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-gray-600 mb-4">{this.state.message}</p>
            <button
              className="px-4 py-2 rounded bg-emerald-600 text-white"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}


