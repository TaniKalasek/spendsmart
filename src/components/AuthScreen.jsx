import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login') // login | register | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handle = async () => {
    setError('')
    setSuccess('')
    if (!email.trim() || (!password.trim() && mode !== 'forgot')) return
    setLoading(true)

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.user)
      } else if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          setSuccess('Account created! Check your email to confirm, then log in.')
          setMode('login')
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) throw error
        setSuccess('Password reset email sent! Check your inbox.')
        setMode('login')
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', zIndex: 1,
    }}>
      <div className="bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>

      <div className="glass" style={{ width: '100%', maxWidth: 400, padding: 36, position: 'relative', zIndex: 2 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--green)', letterSpacing: -1 }}>
            💸 SpendSmart
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your account' : 'Reset password'}
          </div>
        </div>

        {/* Tabs */}
        {mode !== 'forgot' && (
          <div className="type-toggle" style={{ marginBottom: 20 }}>
            <div className={`type-opt ${mode === 'login' ? 'active-income' : ''}`} onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
              Log In
            </div>
            <div className={`type-opt ${mode === 'register' ? 'active-income' : ''}`} onClick={() => { setMode('register'); setError(''); setSuccess('') }}>
              Register
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="field">
          <label>EMAIL</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()} />
        </div>

        {mode !== 'forgot' && (
          <div className="field">
            <label>PASSWORD</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()} />
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--green)', marginBottom: 14 }}>
            {success}
          </div>
        )}

        {/* Button */}
        <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={handle} disabled={loading}>
          {loading ? '...' : mode === 'login' ? 'Log In →' : mode === 'register' ? 'Create Account →' : 'Send Reset Email →'}
        </button>

        {/* Forgot password */}
        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}>
              Forgot password?
            </span>
          </div>
        )}
        {mode === 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}>
              ← Back to login
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
