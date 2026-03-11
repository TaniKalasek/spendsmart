import { useState, useEffect, useCallback } from "react";
import { INITIAL_STATE } from "../data/constants";

const STORAGE_KEY = "spendsmart-v2";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_STATE;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useStore() {
  const [state, setState] = useState(() => loadState());

  useEffect(() => { saveState(state); }, [state]);

  const update = useCallback((fn) => setState((prev) => fn(prev)), []);

  // Wizard completion — sets name, language, currency, marks not new
  const completeSetup = useCallback(({ name, language, currency }) => {
    update((s) => ({
      ...s,
      currency,
      isNewUser: false,
      settings: { ...s.settings, name, language, monthlySavingsGoal: 0 },
    }));
  }, [update]);

  // Transactions
  const addTransaction = useCallback((tx) => {
    update((s) => ({ ...s, transactions: [{ ...tx, id: Date.now() }, ...s.transactions] }));
  }, [update]);

  const deleteTransaction = useCallback((id) => {
    update((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }));
  }, [update]);

  const editTransaction = useCallback((id, patch) => {
    update((s) => ({ ...s, transactions: s.transactions.map((t) => t.id === id ? { ...t, ...patch } : t) }));
  }, [update]);

  const importTransactions = useCallback((txs) => {
    update((s) => ({ ...s, transactions: [...txs, ...s.transactions] }));
  }, [update]);

  // Subscriptions
  const addSubscription = useCallback((sub) => {
    update((s) => ({ ...s, subscriptions: [{ ...sub, id: Date.now() }, ...s.subscriptions] }));
  }, [update]);

  const toggleSubscription = useCallback((id) => {
    update((s) => ({ ...s, subscriptions: s.subscriptions.map((sub) => sub.id === id ? { ...sub, active: !sub.active } : sub) }));
  }, [update]);

  const deleteSubscription = useCallback((id) => {
    update((s) => ({ ...s, subscriptions: s.subscriptions.filter((sub) => sub.id !== id) }));
  }, [update]);

  const editSubscription = useCallback((id, patch) => {
    update((s) => ({ ...s, subscriptions: s.subscriptions.map((sub) => sub.id === id ? { ...sub, ...patch } : sub) }));
  }, [update]);

  // Savings
  const addSavingsGoal = useCallback((goal) => {
    update((s) => ({ ...s, savings: [...s.savings, { ...goal, id: Date.now() }] }));
  }, [update]);

  const updateSavingsGoal = useCallback((id, delta) => {
    update((s) => ({ ...s, savings: s.savings.map((g) => g.id === id ? { ...g, saved: Math.max(0, g.saved + delta) } : g) }));
  }, [update]);

  const editSavingsGoal = useCallback((id, patch) => {
    update((s) => ({ ...s, savings: s.savings.map((g) => g.id === id ? { ...g, ...patch } : g) }));
  }, [update]);

  const deleteSavingsGoal = useCallback((id) => {
    update((s) => ({ ...s, savings: s.savings.filter((g) => g.id !== id) }));
  }, [update]);

  // Settings
  const updateSettings = useCallback((patch) => {
    update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, [update]);

  const setCurrency = useCallback((code) => {
    update((s) => ({ ...s, currency: code }));
  }, [update]);

  const resetData = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    completeSetup,
    addTransaction, deleteTransaction, editTransaction, importTransactions,
    addSubscription, toggleSubscription, deleteSubscription, editSubscription,
    addSavingsGoal, updateSavingsGoal, editSavingsGoal, deleteSavingsGoal,
    updateSettings, setCurrency, resetData,
  };
}
