import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const EMPTY_STATE = {
  transactions: [],
  subscriptions: [],
  savings: [],
  settings: { name: '', language: 'en', currency: 'CZK', monthlySavingsGoal: 0 },
  isNewUser: false,
  loading: true,
}

// Supabase returns snake_case — convert to camelCase for the app
const mapSub = (s) => ({ ...s, nextDate: s.next_date })
const mapSettings = (s) => ({
  name: s.name || '',
  language: s.language || 'en',
  currency: s.currency || 'CZK',
  monthlySavingsGoal: s.monthly_savings_goal || 0,
})

export function useStore(userId) {
  const [state, setState] = useState(EMPTY_STATE)

  useEffect(() => {
    if (!userId) return
    loadAll()
  }, [userId])

  async function loadAll() {
    setState(s => ({ ...s, loading: true }))
    try {
      const [txRes, subRes, savRes, setRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', userId),
        supabase.from('savings').select('*').eq('user_id', userId),
        supabase.from('user_settings').select('*').eq('id', userId).single(),
      ])

      setState({
        transactions: txRes.data || [],
        subscriptions: (subRes.data || []).map(mapSub),
        savings: savRes.data || [],
        settings: setRes.data ? mapSettings(setRes.data) : { name: '', language: 'en', currency: 'CZK', monthlySavingsGoal: 0 },
        isNewUser: !setRes.data,
        loading: false,
      })
    } catch (e) {
      console.error('Load error:', e)
      setState(s => ({ ...s, loading: false }))
    }
  }

  // ── Transactions ──────────────────────────────────────
  const addTransaction = useCallback(async (tx) => {
    const row = { id: crypto.randomUUID(), ...tx, user_id: userId }
    const { data, error } = await supabase.from('transactions').insert(row).select().single()
    if (error) { console.error('addTransaction:', error.message); return }
    if (data) setState(s => ({ ...s, transactions: [data, ...s.transactions] }))
  }, [userId])

  const editTransaction = useCallback(async (id, patch) => {
    const { error } = await supabase.from('transactions').update(patch).eq('id', id).eq('user_id', userId)
    if (error) { console.error('editTransaction:', error.message); return }
    setState(s => ({ ...s, transactions: s.transactions.map(t => t.id === id ? { ...t, ...patch } : t) }))
  }, [userId])

  const deleteTransaction = useCallback(async (id) => {
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId)
    setState(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }))
  }, [userId])

  const importTransactions = useCallback(async (txs) => {
    const rows = txs.map(tx => ({ id: crypto.randomUUID(), ...tx, user_id: userId }))
    const { data, error } = await supabase.from('transactions').insert(rows).select()
    if (error) { console.error('importTransactions:', error.message); return }
    if (data) setState(s => ({ ...s, transactions: [...data, ...s.transactions] }))
  }, [userId])

  // ── Subscriptions ─────────────────────────────────────
  const addSubscription = useCallback(async (sub) => {
    const { nextDate, category, ...rest } = sub  // strip category (not in DB), convert nextDate
    const row = { id: crypto.randomUUID(), ...rest, next_date: nextDate || new Date().toISOString(), user_id: userId }
    const { data, error } = await supabase.from('subscriptions').insert(row).select().single()
    if (error) { console.error('addSubscription:', error.message); return }
    if (data) setState(s => ({ ...s, subscriptions: [...s.subscriptions, mapSub(data)] }))
  }, [userId])

  const editSubscription = useCallback(async (id, patch) => {
    const { nextDate, ...rest } = patch
    const dbPatch = { ...rest, ...(nextDate ? { next_date: nextDate } : {}) }
    const { error } = await supabase.from('subscriptions').update(dbPatch).eq('id', id).eq('user_id', userId)
    if (error) { console.error('editSubscription:', error.message); return }
    setState(s => ({ ...s, subscriptions: s.subscriptions.map(sub => sub.id === id ? { ...sub, ...patch } : sub) }))
  }, [userId])

  const toggleSubscription = useCallback(async (id) => {
    const sub = state.subscriptions.find(s => s.id === id)
    if (!sub) return
    const active = !sub.active
    await supabase.from('subscriptions').update({ active }).eq('id', id).eq('user_id', userId)
    setState(s => ({ ...s, subscriptions: s.subscriptions.map(sub => sub.id === id ? { ...sub, active } : sub) }))
  }, [userId, state.subscriptions])

  const deleteSubscription = useCallback(async (id) => {
    await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', userId)
    setState(s => ({ ...s, subscriptions: s.subscriptions.filter(sub => sub.id !== id) }))
  }, [userId])

  // ── Savings ───────────────────────────────────────────
  const addSavingsGoal = useCallback(async (goal) => {
    const row = { id: crypto.randomUUID(), ...goal, user_id: userId }
    const { data, error } = await supabase.from('savings').insert(row).select().single()
    if (error) { console.error('addSavingsGoal:', error.message); return }
    if (data) setState(s => ({ ...s, savings: [...s.savings, data] }))
  }, [userId])

  const editSavingsGoal = useCallback(async (id, patch) => {
    const { error } = await supabase.from('savings').update(patch).eq('id', id).eq('user_id', userId)
    if (error) { console.error('editSavingsGoal:', error.message); return }
    setState(s => ({ ...s, savings: s.savings.map(g => g.id === id ? { ...g, ...patch } : g) }))
  }, [userId])

  const updateSavingsGoal = useCallback(async (id, delta) => {
    const goal = state.savings.find(g => g.id === id)
    if (!goal) return
    const saved = Math.max(0, (parseFloat(goal.saved) || 0) + delta)
    const { error } = await supabase.from('savings').update({ saved }).eq('id', id).eq('user_id', userId)
    if (error) { console.error('updateSavingsGoal:', error.message); return }
    setState(s => ({ ...s, savings: s.savings.map(g => g.id === id ? { ...g, saved } : g) }))
  }, [userId, state.savings])

  const deleteSavingsGoal = useCallback(async (id) => {
    await supabase.from('savings').delete().eq('id', id).eq('user_id', userId)
    setState(s => ({ ...s, savings: s.savings.filter(g => g.id !== id) }))
  }, [userId])

  // ── Settings ──────────────────────────────────────────
  const updateSettings = useCallback(async (patch) => {
    const dbPatch = { updated_at: new Date().toISOString() }
    if (patch.name !== undefined) dbPatch.name = patch.name
    if (patch.language !== undefined) dbPatch.language = patch.language
    if (patch.currency !== undefined) dbPatch.currency = patch.currency
    if (patch.monthlySavingsGoal !== undefined) dbPatch.monthly_savings_goal = patch.monthlySavingsGoal
    const { error } = await supabase.from('user_settings').upsert({ id: userId, ...dbPatch })
    if (error) { console.error('updateSettings:', error.message); return }
    setState(s => ({ ...s, settings: { ...s.settings, ...patch }, isNewUser: false }))
  }, [userId])

  const setCurrency = useCallback(async (currency) => {
    await supabase.from('user_settings').upsert({ id: userId, currency, updated_at: new Date().toISOString() })
    setState(s => ({ ...s, settings: { ...s.settings, currency } }))
  }, [userId])

  const completeSetup = useCallback(async ({ name, language, currency }) => {
    await supabase.from('user_settings').upsert({
      id: userId, name, language, currency,
      monthly_savings_goal: 0, updated_at: new Date().toISOString()
    })
    setState(s => ({ ...s, settings: { name, language, currency, monthlySavingsGoal: 0 }, isNewUser: false }))
  }, [userId])

  const resetData = useCallback(async () => {
    await Promise.all([
      supabase.from('transactions').delete().eq('user_id', userId),
      supabase.from('subscriptions').delete().eq('user_id', userId),
      supabase.from('savings').delete().eq('user_id', userId),
      supabase.from('user_settings').delete().eq('id', userId),
    ])
    setState({ ...EMPTY_STATE, loading: false, isNewUser: true })
  }, [userId])

  return {
    state,
    addTransaction, editTransaction, deleteTransaction, importTransactions,
    addSubscription, editSubscription, toggleSubscription, deleteSubscription,
    addSavingsGoal, editSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    updateSettings, setCurrency, completeSetup, resetData,
  }
}
