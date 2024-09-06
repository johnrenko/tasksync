'use client'

import { useState, useEffect } from 'react'
import { supabase, signInWithMagicLink, signOut } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [cooldown, setCooldown] = useState(false)

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
        <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full p-2 border rounded"
            disabled={cooldown}
          />
          <button 
            type="submit" 
            className={`w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${cooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={cooldown || loading}
          >
            Send Magic Link
          </button>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </form>
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