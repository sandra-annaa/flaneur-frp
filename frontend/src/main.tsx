import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// PrimeReact core
import 'primereact/resources/themes/lara-light-blue/theme.css' // theme
import 'primereact/resources/primereact.min.css'               // core css
import 'primeicons/primeicons.css'                             // icons
import 'primeflex/primeflex.css'                               // optional layout utils

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
