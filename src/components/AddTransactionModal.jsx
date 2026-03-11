import { useState } from "react";
import { Modal } from "./Modal";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../data/constants";

export function AddTransactionModal({ onAdd, onEdit, onClose, currency, t, editTx }) {
  const isEdit = !!editTx;
  const [type, setType] = useState(editTx?.type || "expense");
  const [form, setForm] = useState({
    label: editTx?.label || "",
    amount: editTx?.amount || "",
    category: editTx?.category || "food",
    note: editTx?.note || "",
    date: editTx ? new Date(editTx.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
  });

  const cats = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handle = () => {
    if (!form.label.trim() || !form.amount || isNaN(+form.amount) || +form.amount <= 0) return;
    const data = {
      type, label: form.label.trim(), amount: parseFloat(form.amount),
      category: form.category, note: form.note,
      date: new Date(form.date).toISOString(),
    };
    if (isEdit) { onEdit(editTx.id, data); } else { onAdd(data); }
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="modal-body">
        <div className="modal-title">{isEdit ? t.editTransaction : t.addTransaction}</div>
        <div className="type-toggle">
          <div className={`type-opt ${type === "expense" ? "active-expense" : ""}`}
            onClick={() => { setType("expense"); set("category", "food"); }}>
            💸 {t.expense}
          </div>
          <div className={`type-opt ${type === "income" ? "active-income" : ""}`}
            onClick={() => { setType("income"); set("category", "salary"); }}>
            💰 {t.income}
          </div>
        </div>
        <div className="field">
          <label>{t.description}</label>
          <input autoFocus placeholder="…" value={form.label}
            onChange={(e) => set("label", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handle()} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>{t.amount} ({currency.symbol})</label>
            <input type="number" min="0" step="0.01" placeholder="0" value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle()} />
          </div>
          <div className="field">
            <label>{t.date}</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>{t.category}</label>
          <div className="cat-chips">
            {cats.map((c) => (
              <div key={c.id} className={`cat-chip ${form.category === c.id ? "active" : ""}`}
                onClick={() => set("category", c.id)}>
                {c.icon} {t[c.id] || c.label}
              </div>
            ))}
          </div>
        </div>
        <div className="field">
          <label>{t.note}</label>
          <input placeholder="…" value={form.note} onChange={(e) => set("note", e.target.value)} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={handle}>
            {isEdit ? t.saveChanges : (type === "income" ? t.addIncome : t.addExpense)}
          </button>
        </div>
      </div>
    </Modal>
  );
}
