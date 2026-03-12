import { useState } from "react";
import { fmt, fmtFull } from "../utils/helpers";
import { Modal } from "./Modal";

const GOAL_ICONS = ["🛡️","✈️","🏠","🚗","💻","🎓","💍","🌴","🎯","💰","🏖️","🎁"];
const GOAL_COLORS = ["#34d399","#06b6d4","#a78bfa","#fbbf24","#f472b6","#60a5fa","#f87171","#fb923c"];

const BLANK_FORM = { label: "", target: "", saved: "", icon: "🎯", color: GOAL_COLORS[0] };

export function Savings({ state, currency, onAdd, onUpdate, onEdit, onDelete, onUpdateSettings, t }) {
  const sym = currency.symbol;
  const [modal, setModal] = useState(null);
  const [depositModal, setDepositModal] = useState(null);
  const [depositForm, setDepositForm] = useState({ amount: "", type: "add" });
  const [form, setForm] = useState(BLANK_FORM);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(state.settings?.monthlySavingsGoal || 0);

  const totalSaved = state.savings.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.savings.reduce((s, g) => s + g.target, 0);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(BLANK_FORM); setModal("add"); };
  const openEdit = (goal) => {
    setForm({ label: goal.label, target: goal.target, saved: goal.saved, icon: goal.icon, color: goal.color });
    setModal(goal.id);
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.target || isNaN(+form.target) || +form.target <= 0) return;
    const data = { label: form.label.trim(), target: parseFloat(form.target), icon: form.icon, color: form.color };
    if (modal === "add") {
      onAdd({ ...data, saved: parseFloat(form.saved) || 0 });
    } else {
      onEdit(modal, data);
    }
    setModal(null);
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositForm.amount);
    if (!amount || isNaN(amount) || amount <= 0) return;
    onUpdate(depositModal, depositForm.type === "add" ? amount : -amount);
    setDepositForm({ amount: "", type: "add" });
    setDepositModal(null);
  };

  const isEditMode = modal !== null && modal !== "add";
  const selectedGoal = state.savings.find((g) => g.id === depositModal);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title">{t.savingsGoals}</div>
          <div className="page-subtitle">{t.subSavings}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>{t.newGoal}</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="glass stat-card">
          <div className="label">{t.totalSaved}</div>
          <div className="value" style={{ color: "var(--green)", fontSize: 22 }}>{fmt(sym, totalSaved)}</div>
          <div className="sub">{t.acrossGoals} {state.savings.length} {t.goals}</div>
        </div>
        <div className="glass stat-card">
          <div className="label">{t.totalTarget}</div>
          <div className="value" style={{ fontSize: 22 }}>{fmt(sym, totalTarget)}</div>
          <div className="sub">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% {t.reached}</div>
        </div>
        <div className="glass stat-card" style={{ cursor: "pointer" }} onClick={() => { setGoalInput(state.settings?.monthlySavingsGoal || 0); setEditingGoal(true); }}>
          <div className="label">{t.monthlyGoal}</div>
          {editingGoal ? (
            <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 4 }}>
              <input
                autoFocus
                type="number"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid var(--border-focus)", borderRadius: 8, padding: "4px 8px", color: "var(--text)", fontSize: 16, fontFamily: "Syne, sans-serif", fontWeight: 700, outline: "none" }}
                onKeyDown={e => {
                  if (e.key === "Enter") { onUpdateSettings({ monthlySavingsGoal: parseFloat(goalInput) || 0 }); setEditingGoal(false); }
                  if (e.key === "Escape") setEditingGoal(false);
                }}
              />
              <button className="btn btn-primary btn-sm" onClick={() => { onUpdateSettings({ monthlySavingsGoal: parseFloat(goalInput) || 0 }); setEditingGoal(false); }} style={{ padding: "4px 10px", fontSize: 12 }}>✓</button>
            </div>
          ) : (
            <>
              <div className="value" style={{ color: "var(--purple)", fontSize: 22 }}>{fmt(sym, state.settings?.monthlySavingsGoal || 0)}</div>
              <div className="sub" style={{ color: "var(--purple)", opacity: 0.6, fontSize: 11 }}>✏️ {t.editMonthlyGoal}</div>
            </>
          )}
        </div>
      </div>

      {totalTarget > 0 && (
        <div className="glass" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <div className="section-title" style={{ margin: 0 }}>{t.overallProgress}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{fmt(sym, totalSaved)} of {fmt(sym, totalTarget)}</div>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, (totalSaved / totalTarget) * 100)}%`, background: "linear-gradient(90deg, var(--green), var(--cyan))" }} />
          </div>
        </div>
      )}

      {state.savings.length === 0 && (
        <div className="glass empty-state" style={{ padding: 50 }}>
          <div className="empty-icon">🎯</div>
          <p>{t.noGoals}</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>{t.createFirst}</button>
        </div>
      )}

      <div className="grid-2">
        {state.savings.map((goal) => {
          const pct = Math.min(100, (goal.saved / goal.target) * 100);
          const remaining = goal.target - goal.saved;
          return (
            <div key={goal.id} className="glass savings-card">
              <div className="savings-header">
                <div className="savings-icon">{goal.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="savings-label">{goal.label}</div>
                  <div className="savings-target">{t.targetAmount}: {fmt(sym, goal.target)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="badge" style={{ background: `${goal.color}18`, color: goal.color, border: `1px solid ${goal.color}35` }}>
                    {pct.toFixed(0)}%
                  </div>
                  <button className="btn btn-icon btn-ghost" style={{ fontSize: 13 }} onClick={() => openEdit(goal)} title="Edit">✏️</button>
                </div>
              </div>
              <div className="savings-nums">
                <div className="savings-saved" style={{ color: goal.color }}>{fmtFull(sym, goal.saved)}</div>
                <div className="savings-pct">{remaining > 0 ? `${fmt(sym, remaining)} ${t.toGo}` : t.goalReached}</div>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: goal.color }} />
              </div>
              <div className="savings-actions">
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setDepositModal(goal.id); setDepositForm({ amount: "", type: "add" }); }}>{t.deposit}</button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setDepositModal(goal.id); setDepositForm({ amount: "", type: "withdraw" }); }}>{t.withdraw}</button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(goal.id)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit goal modal */}
      {modal !== null && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-body">
            <div className="modal-title">{isEditMode ? t.editGoal : t.newGoal}</div>
            <div className="field">
              <label>{t.goalName}</label>
              <input autoFocus placeholder="e.g. Thailand Trip, Emergency Fund…" value={form.label} onChange={(e) => set("label", e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>{t.targetAmount} ({sym})</label>
                <input type="number" min="0" placeholder="0" value={form.target} onChange={(e) => set("target", e.target.value)} />
              </div>
              {!isEditMode && (
                <div className="field">
                  <label>{t.alreadySaved} ({sym})</label>
                  <input type="number" min="0" placeholder="0" value={form.saved} onChange={(e) => set("saved", e.target.value)} />
                </div>
              )}
            </div>
            <div className="field">
              <label>{t.icon}</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GOAL_ICONS.map((ic) => (
                  <div key={ic} onClick={() => set("icon", ic)} style={{ fontSize: 22, cursor: "pointer", padding: 4, borderRadius: 8, background: form.icon === ic ? "rgba(52,211,153,0.15)" : "transparent", border: form.icon === ic ? "1px solid rgba(52,211,153,0.4)" : "1px solid transparent" }}>{ic}</div>
                ))}
              </div>
            </div>
            <div className="field">
              <label>{t.color}</label>
              <div className="color-picker">
                {GOAL_COLORS.map((c) => (
                  <div key={c} className={`color-dot ${form.color === c ? "active" : ""}`} style={{ background: c }} onClick={() => set("color", c)} />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={handleSave}>{isEditMode ? t.saveChanges : t.createGoal}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deposit / Withdraw modal */}
      {depositModal && selectedGoal && (
        <Modal onClose={() => setDepositModal(null)}>
          <div className="modal-body">
            <div className="modal-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span>{selectedGoal.icon}</span> {selectedGoal.label}
            </div>
            <div className="type-toggle" style={{ marginBottom: 16 }}>
              <div className={`type-opt ${depositForm.type === "add" ? "active-income" : ""}`} onClick={() => setDepositForm((f) => ({ ...f, type: "add" }))}>{t.deposit}</div>
              <div className={`type-opt ${depositForm.type === "withdraw" ? "active-expense" : ""}`} onClick={() => setDepositForm((f) => ({ ...f, type: "withdraw" }))}>{t.withdraw}</div>
            </div>
            <div className="field">
              <label>{t.amount} ({sym})</label>
              <input autoFocus type="number" min="0" placeholder="0" value={depositForm.amount}
                onChange={(e) => setDepositForm((f) => ({ ...f, amount: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleDeposit()} />
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
              {t.currentBalance}: <strong style={{ color: selectedGoal.color }}>{fmtFull(sym, selectedGoal.saved)}</strong> / {fmt(sym, selectedGoal.target)}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDepositModal(null)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={handleDeposit}>{t.confirm}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
