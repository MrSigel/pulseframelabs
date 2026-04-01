import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SubscriptionContext = createContext(null)

export const PLANS = {
  trial:     { credits: 10,  days: 1,   labelKey: 'trial' },
  monthly:   { credits: 100, days: 30,  labelKey: 'monthly' },
  quarterly: { credits: 260, days: 90,  labelKey: 'quarterly' },
  halfyear:  { credits: 460, days: 180, labelKey: 'halfYear' },
  annual:    { credits: 800, days: 365, labelKey: 'annual' },
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth()
  const [credits, setCredits] = useState(0)
  const [subscription, setSubscription] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const hasActivePlan = !!(subscription && new Date(subscription.expires_at) > new Date())

  const fetchData = async () => {
    if (!user?.id) { setLoading(false); return }

    // Fetch credits
    const { data: cred } = await supabase.from('user_credits')
      .select('balance').eq('user_id', user.id).maybeSingle()
    setCredits(cred?.balance || 0)

    // Fetch active subscription
    const { data: sub } = await supabase.from('subscriptions')
      .select('*').eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1).maybeSingle()
    setSubscription(sub || null)

    // Fetch recent transactions
    const { data: txns } = await supabase.from('credit_transactions')
      .select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20)
    setTransactions(txns || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user?.id])

  // Realtime updates
  useEffect(() => {
    if (!user?.id) return
    const ch = supabase.channel(`sub-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_credits' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [user?.id])

  const purchaseCredits = async (amount) => {
    if (!user?.id || amount <= 0) return { error: 'Invalid' }

    // Upsert credit balance
    const newBalance = credits + amount
    await supabase.from('user_credits').upsert(
      { user_id: user.id, balance: newBalance, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

    // Log transaction
    await supabase.from('credit_transactions').insert({
      user_id: user.id, amount, type: 'purchase', description: `Purchased ${amount} credits`
    })

    setCredits(newBalance)
    await fetchData()
    return { error: null }
  }

  const activatePlan = async (planKey) => {
    if (!user?.id) return { error: 'Not authenticated' }
    const plan = PLANS[planKey]
    if (!plan) return { error: 'Invalid plan' }
    if (credits < plan.credits) return { error: 'Insufficient credits' }

    const newBalance = credits - plan.credits
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + plan.days)

    // Deduct credits
    await supabase.from('user_credits').upsert(
      { user_id: user.id, balance: newBalance, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

    // Log transaction
    await supabase.from('credit_transactions').insert({
      user_id: user.id, amount: -plan.credits, type: 'plan_activation',
      description: `Activated ${planKey} plan (${plan.days} days)`
    })

    // Create subscription
    await supabase.from('subscriptions').insert({
      user_id: user.id, plan_key: planKey,
      credits_spent: plan.credits, expires_at: expiresAt.toISOString(),
    })

    await fetchData()
    return { error: null }
  }

  return (
    <SubscriptionContext.Provider value={{
      credits, subscription, hasActivePlan, transactions, loading,
      purchaseCredits, activatePlan, refreshData: fetchData,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => useContext(SubscriptionContext)
