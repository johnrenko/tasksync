'use client'

import { useState, useEffect } from 'react'
import { supabase, signInWithMagicLink, signUpWithEmail, signInWithEmail, signInWithGoogle, signOut } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [cooldown, setCooldown] = useState(false)
  const [authMode, setAuthMode] = useState<'magic-link' | 'sign-up' | 'sign-in'>('magic-link')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleMagicLinkSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (cooldown) {
      setErrorMessage('Please wait before trying again.')
      return
    }

    setLoading(true)
    setErrorMessage('')
    const { error } = await signInWithMagicLink(email)
    if (error) {
      console.error('Error signing in:', error)
      if (error.message.includes('rate limit')) {
        setErrorMessage('Too many sign-in attempts. Please try again in a few minutes.')
        setCooldown(true)
        setTimeout(() => setCooldown(false), 60000) // 1 minute cooldown
      } else {
        setErrorMessage(error.message)
      }
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    const { error } = await signUpWithEmail(email, password)
    if (error) {
      console.error('Error signing up:', error)
      setErrorMessage(error.message)
    } else {
      alert('Check your email to confirm your account!')
    }
    setLoading(false)
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    const { error } = await signInWithEmail(email, password)
    if (error) {
      console.error('Error signing in:', error)
      setErrorMessage(error.message)
    }
    setLoading(false)
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setErrorMessage('')
    const { error } = await signInWithGoogle()
    if (error) {
      console.error('Error signing in with Google:', error)
      setErrorMessage(error.message)
    }
    setLoading(false)
  }

  async function handleSignOut() {
    setLoading(true)
    const { error } = await signOut()
    if (error) console.error('Error signing out:', error)
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setAuthMode('magic-link')}
            className={`p-2 ${authMode === 'magic-link' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
          >
            Magic Link
          </button>
          <button
            onClick={() => setAuthMode('sign-up')}
            className={`p-2 ${authMode === 'sign-up' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setAuthMode('sign-in')}
            className={`p-2 ${authMode === 'sign-in' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
          >
            Sign In
          </button>
        </div>
        <form onSubmit={authMode === 'magic-link' ? handleMagicLinkSignIn : authMode === 'sign-up' ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full p-2 border rounded"
            disabled={cooldown}
          />
          {authMode !== 'magic-link' && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full p-2 border rounded"
            />
          )}
          <button 
            type="submit" 
            className={`w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${cooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={cooldown || loading}
          >
            {authMode === 'magic-link' ? 'Send Magic Link' : authMode === 'sign-up' ? 'Sign Up' : 'Sign In'}
          </button>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </form>
        <div className="text-center">or</div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full p-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 flex items-center justify-center"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          Sign In with Google
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <span>Logged in as: {user.email}</span>
        <button onClick={handleSignOut} className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
          Sign Out
        </button>
      </div>
      {children}
    </div>
  )
}