import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App'
import './styles.css'

import { ErrorBoundary } from './ErrorBoundary'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)


