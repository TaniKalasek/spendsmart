import { useState, useCallback } from "react";
import { useStore } from "./hooks/useStore";
import { CURRENCIES } from "./data/constants";
import { useT } from "./data/translations";
import { Dashboard } from "./components/Dashboard";
import { Transactions } from "./components/Transactions";
import { Subscriptions } from "./components/Subscriptions";
import { Savings } from "./components/Savings";
import { Settings } from "./components/Settings";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { CurrencyModal } from "./components/CurrencyModal";
import { SetupWizard } from "./components/SetupWizard";
import { Toast } from "./components/Modal";

export default function App({ userId, userEmail, onLogout }) {
  const store = useStore(userId);
  const { state } = store;
  const [page, setPage] = useState("dashboard");
  const [addModal, setAddModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [showCurrency, setShowCurrency] = useState(false);
  const [toast, setToast] = useState(null);

  const lang = state.settings?.language || "en";
  const t = useT(lang);
  const currency = CURRENCIES.find((c) => c.code === (state.settings?.currency || "CZK")) || CURRENCIES[0];
  const isRTL = lang === "ar";

  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleAdd = useCallback((tx) => { store.addTransaction(tx); notify(`${tx.type === "income" ? "💰" : "💸"} ${tx.label}`); }, [store, notify]);
  const handleEditTx = useCallback((id, patch) => { store.editTransaction(id, patch); notify(`✓ ${t.saved}`); }, [store, notify, t]);
  const handleDelete = useCallback((id) => { store.deleteTransaction(id); notify("Deleted"); }, [store, notify]);
  const handleImport = useCallback((txs) => { store.importTransactions(txs); notify(`✓ ${t.importBtn} ${txs.length}`); }, [store, notify, t]);
  const handleCurrency = useCallback((code) => { store.setCurrency(code); const c = CURRENCIES.find((cur) => cur.code === code); notify(`${c?.flag} ${c?.name}`); }, [store, notify]);

  const NAV = [
    { id: "dashboard", icon: "◈", label: t.dashboard },
    { id: "transactions", icon: "⇄", label: t.transactions },
    { id: "subscriptions", icon: "↻", label: t.subscriptions },
    { id: "savings", icon: "◎", label: t.savings },
    { id: "settings", icon: "⚙", label: t.settings },
  ];

  if (state.loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, color: "var(--green)" }}>💸 SpendSmart</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading your data…</div>
      </div>
    );
  }

  if (state.isNewUser) {
    return <SetupWizard onComplete={(data) => store.completeSetup(data)} />;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>

      <div className="app-shell">
        {/* Sidebar */}
        <nav className="sidebar" style={isRTL ? { left: "auto", right: 0, borderRight: "none", borderLeft: "1px solid var(--border)" } : {}}>
          <div className="sidebar-logo">SS</div>
          {NAV.map((n) => (
            <div key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)} title={n.label}>
              <span>{n.icon}</span>
              <span className="nav-label">{n.label}</span>
              <span className="tooltip">{n.label}</span>
            </div>
          ))}
          <div className="sidebar-spacer" />
          {/* User info + logout */}
          <div style={{ padding: "0 8px", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="nav-label">
              {userEmail}
            </div>
            <div className="nav-btn" onClick={onLogout}
              style={{ color: "var(--text-muted)", fontSize: 16, width: "100%", justifyContent: "flex-start" }}>
              <span>⏻</span>
              <span className="nav-label" style={{ fontSize: 12 }}>Log out</span>
              <span className="tooltip">Log out</span>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="main" style={isRTL ? { marginLeft: 0, marginRight: 180 } : {}}>
          {page === "dashboard" && (
            <Dashboard state={state} currency={currency} t={t}
              onAdd={() => setAddModal(true)} onDelete={handleDelete}
              onCurrencyOpen={() => setShowCurrency(true)} />
          )}
          {page === "transactions" && (
            <Transactions state={state} currency={currency} t={t}
              onOpenAdd={() => setAddModal(true)}
              onEdit={(tx) => setEditTx(tx)}
              onDelete={handleDelete} onImport={handleImport} />
          )}
          {page === "subscriptions" && (
            <Subscriptions state={state} currency={currency} t={t}
              onAdd={(sub) => { store.addSubscription(sub); notify(`✓ ${sub.label}`); }}
              onEdit={(id, patch) => { store.editSubscription(id, patch); notify(`✓ ${t.saved}`); }}
              onToggle={(id) => store.toggleSubscription(id)}
              onDelete={(id) => { store.deleteSubscription(id); notify("Deleted"); }} />
          )}
          {page === "savings" && (
            <Savings state={state} currency={currency} t={t}
              onAdd={(g) => { store.addSavingsGoal(g); notify(`🎯 ${g.label}`); }}
              onUpdate={(id, delta) => { store.updateSavingsGoal(id, delta); notify(delta > 0 ? "💚 Deposited" : "Withdrawn"); }}
              onEdit={(id, patch) => { store.editSavingsGoal(id, patch); notify(`✓ ${t.saved}`); }}
              onDelete={(id) => { store.deleteSavingsGoal(id); notify("Deleted"); }}
              onUpdateSettings={(patch) => { store.updateSettings(patch); notify(`✓ ${t.saved}`); }} />
          )}
          {page === "settings" && (
            <Settings state={state} currency={currency} t={t}
              onUpdate={(patch) => { store.updateSettings(patch); notify(`✓ ${t.saved}`); }}
              onCurrencyOpen={() => setShowCurrency(true)}
              onReset={() => { store.resetData(); notify("Reset"); }} />
          )}
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="bottom-nav">
        {NAV.map((n) => (
          <div key={n.id} className={`bottom-nav-btn ${page === n.id ? "active" : ""}`}
            onClick={() => setPage(n.id)}>
            <span className="bottom-icon">{n.icon}</span>
            <span className="bottom-label">{n.label}</span>
          </div>
        ))}
      </nav>

      {(addModal || editTx) && (
        <AddTransactionModal currency={currency} t={t} editTx={editTx}
          onAdd={handleAdd} onEdit={handleEditTx}
          onClose={() => { setAddModal(false); setEditTx(null); }} />
      )}
      {showCurrency && (
        <CurrencyModal current={state.settings?.currency} onSelect={handleCurrency}
          onClose={() => setShowCurrency(false)} t={t} />
      )}
      <Toast message={toast} />
    </div>
  );
}
