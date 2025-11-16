import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Your global Tailwind styles
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from './lib/supabaseClient' // Import our client

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wrap your App component */}
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>,
)