import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthScreen } from './components/AuthScreen.jsx'
import { supabase } from './lib/supabase.js'

function Root() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setChecking(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#34d399' }}>💸</div>
      </div>
    )
  }

  if (!user) return <AuthScreen onAuth={setUser} />
  return <App userId={user.id} userEmail={user.email} onLogout={() => supabase.auth.signOut()} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
)
