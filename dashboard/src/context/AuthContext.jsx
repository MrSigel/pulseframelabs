import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Map Supabase error messages
      if (error.message === 'Email not confirmed') {
        return { error: { message: 'EMAIL_NOT_CONFIRMED' } }
      }
      return { error: { message: error.message } }
    }
    return { error: null }
  }

  const signUp = async (username, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) return { error: { message: error.message } }
    // If session is null, email confirmation is required
    if (data?.user && !data?.session) {
      return { error: null, confirmEmail: true }
    }
    return { error: null, confirmEmail: false }
  }

  const resendConfirmation = async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) return { error: { message: error.message } }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resendConfirmation }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
