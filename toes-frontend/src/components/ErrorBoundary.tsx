import React from 'react'

interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message }
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('Unhandled React error:', err, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white border rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">
              {this.state.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, message: '' })
                window.location.href = '/'
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
