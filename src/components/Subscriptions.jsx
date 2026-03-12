import { useState, useMemo } from "react";
import { fmt, formatDate, getMonthlySubCost } from "../utils/helpers";
import { Modal } from "./Modal";
import { SUB_CYCLES } from "../data/constants";

const COLORS = ["#e50914","#1db954","#ff0000","#0078d4","#ff6b35","#a78bfa","#fbbf24","#22d3ee","#f472b6","#34d399"];

export function Subscriptions({ state, currency, onAdd, onEdit, onToggle, onDelete, t }) {
  const sym = currency.symbol;
  const [modal, setModal] = useState(null); // null | "add" | sub-id for edit
  const [form, setForm] = useState({ label: "", amount: "", cycle: "monthly", color: COLORS[0], nextDate: new Date().toISOString().slice(0, 10) });

  const activeSubs = state.subscriptions.filter((s) => s.active);
  const totalMonthly = useMemo(() => activeSubs.reduce((sum, s) => sum + getMonthlySubCost(s), 0), [activeSubs]);
  const totalYearly = totalMonthly * 12;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setForm({ label: "", amount: "", cycle: "monthly", color: COLORS[0], nextDate: new Date().toISOString().slice(0, 10) });
    setModal("add");
  };

  const openEdit = (sub) => {
    setForm({ label: sub.label, amount: sub.amount, cycle: sub.cycle, color: sub.color, nextDate: new Date(sub.nextDate).toISOString().slice(0, 10) });
    setModal(sub.id);
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.amount || isNaN(+form.amount) || +form.amount <= 0) return;
    const data = { label: form.label.trim(), amount: parseFloat(form.amount), cycle: form.cycle, color: form.color, nextDate: new Date(form.nextDate).toISOString() };
    if (modal === "add") {
      onAdd({ ...data, category: "subscriptions", active: true });
    } else {
      onEdit(modal, data);
    }
    setModal(null);
  };

  const upcomingSubs = [...state.subscriptions].filter((s) => s.active).sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate)).slice(0, 5);
  const isEditMode = modal !== null && modal !== "add";

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title">{t.subscriptions}</div>
          <div className="page-subtitle">{t.subSubscriptions}</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>{t.addSubscription}</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="glass stat-card">
          <div className="label">{t.monthlyCost}</div>
          <div className="value" style={{ color: "var(--yellow)", fontSize: 22 }}>{fmt(sym, totalMonthly)}</div>
          <div className="sub">{activeSubs.length} {t.activeSubscriptions}</div>
        </div>
        <div className="glass stat-card">
          <div className="label">{t.yearlyCost}</div>
          <div className="value" style={{ fontSize: 22 }}>{fmt(sym, totalYearly)}</div>
          <div className="sub">{t.ifNothingChanges}</div>
        </div>
        <div className="glass stat-card">
          <div className="label">{t.pausedInactive}</div>
          <div className="value" style={{ fontSize: 22 }}>{state.subscriptions.length - activeSubs.length}</div>
          <div className="sub">{t.subscriptionsPaused}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="section-title">{t.allSubscriptions}<span className="count">{state.subscriptions.length}</span></div>
          {state.subscriptions.length === 0 && <div className="glass empty-state"><div className="empty-icon">🔄</div><p>{t.noSubscriptions}</p></div>}
          {state.subscriptions.map((sub) => (
            <div key={sub.id} className={`sub-card ${!sub.active ? "sub-inactive" : ""}`}>
              <div className="sub-dot" style={{ background: sub.color }} />
              <div className="sub-info">
                <div className="sub-name">{sub.label}</div>
                <div className="sub-meta">
                  {sub.cycle === "monthly" ? t.monthly : sub.cycle === "yearly" ? t.yearly : t.weekly}
                  {" · "}{t.nextBillingDate.split(" ")[0]}: {formatDate(sub.nextDate)}
                  {sub.cycle === "yearly" && <span style={{ marginLeft: 6 }} className="badge badge-muted">{fmt(sym, sub.amount / 12)}/mo</span>}
                </div>
              </div>
              <div className="sub-amount">{fmt(sym, sub.amount)}</div>
              <button className="btn btn-icon btn-ghost" style={{ marginLeft: 4, fontSize: 13 }} onClick={() => openEdit(sub)} title="Edit">✏️</button>
              <label className="toggle" style={{ marginLeft: 4 }}>
                <input type="checkbox" checked={sub.active} onChange={() => onToggle(sub.id)} />
                <span className="toggle-slider" />
              </label>
              <button className="btn btn-icon btn-ghost" style={{ marginLeft: 4, fontSize: 12 }} onClick={() => onDelete(sub.id)}>✕</button>
            </div>
          ))}
        </div>

        <div>
          <div className="section-title">{t.upcomingPayments}</div>
          <div className="glass" style={{ padding: 8, marginBottom: 16 }}>
            {upcomingSubs.length === 0 && <div className="empty-state"><div className="empty-icon">📅</div><p>{t.noUpcoming}</p></div>}
            {upcomingSubs.map((sub) => {
              const daysUntil = Math.ceil((new Date(sub.nextDate) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={sub.id} className="tx-row">
                  <div className="tx-icon" style={{ background: sub.color + "20", border: `1px solid ${sub.color}40` }}>
                    <div className="sub-dot" style={{ background: sub.color }} />
                  </div>
                  <div className="tx-info">
                    <div className="tx-label">{sub.label}</div>
                    <div className="tx-meta">{formatDate(sub.nextDate)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", textAlign: "right" }}>{fmt(sym, sub.amount)}</div>
                    <div style={{ fontSize: 11, color: daysUntil <= 3 ? "var(--red)" : "var(--text-muted)", textAlign: "right" }}>
                      {daysUntil <= 0 ? t.dueToday : `${t.inDays} ${daysUntil}${t.day}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="section-title">{t.costBreakdown}</div>
          <div className="glass" style={{ padding: 16 }}>
            {activeSubs.map((sub) => {
              const monthCost = getMonthlySubCost(sub);
              const pct = totalMonthly > 0 ? (monthCost / totalMonthly) * 100 : 0;
              return (
                <div key={sub.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-mid)" }}>{sub.label}</span>
                    <span style={{ color: "var(--text-muted)" }}>{fmt(sym, monthCost)}/mo · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: sub.color }} />
                  </div>
                </div>
              );
            })}
            {activeSubs.length === 0 && <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 12 }}>{t.noSubscriptions}</div>}
          </div>
        </div>
      </div>

      {modal !== null && (
        <Modal onClose={() => setModal(null)}>
          <div className="modal-body">
            <div className="modal-title">{isEditMode ? t.editSubscription : t.addSubscription}</div>
            <div className="field">
              <label>{t.serviceName}</label>
              <input autoFocus placeholder="e.g. Netflix, Spotify…" value={form.label} onChange={(e) => set("label", e.target.value)} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>{t.amount} ({sym})</label>
                <input type="number" min="0" step="0.01" placeholder="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </div>
              <div className="field">
                <label>{t.billingCycle}</label>
                <select value={form.cycle} onChange={(e) => set("cycle", e.target.value)}>
                  {SUB_CYCLES.map((c) => <option key={c.id} value={c.id}>{t[c.id] || c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>{t.nextBillingDate}</label>
              <input type="date" value={form.nextDate} onChange={(e) => set("nextDate", e.target.value)} />
            </div>
            <div className="field">
              <label>{t.color}</label>
              <div className="color-picker">
                {COLORS.map((c) => (
                  <div key={c} className={`color-dot ${form.color === c ? "active" : ""}`} style={{ background: c }} onClick={() => set("color", c)} />
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={handleSave}>{isEditMode ? t.saveChanges : `${t.addSubscription} →`}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
