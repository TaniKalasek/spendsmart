import { useState, useMemo, useRef } from "react";
import { fmt, formatDate, isThisMonth, parseCSV } from "../utils/helpers";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../data/constants";
import { Modal } from "./Modal";

function getCatIcon(catId, type) {
  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === catId)?.icon || "📦";
}
function getCatLabel(catId, type, t) {
  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const cat = list.find((c) => c.id === catId);
  return cat ? (t[cat.id] || cat.label) : catId;
}

export function Transactions({ state, currency, onAdd, onEdit, onDelete, onImport, t, onOpenAdd }) {
  const sym = currency.symbol;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCSV, setShowCSV] = useState(false);
  const [csvPreview, setCsvPreview] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const filtered = useMemo(() => state.transactions
    .filter((tx) => {
      if (filter === "income" && tx.type !== "income") return false;
      if (filter === "expense" && tx.type !== "expense") return false;
      if (search && !tx.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)),
  [state.transactions, filter, search]);

  const totalIncome = useMemo(() => state.transactions.filter((t) => t.type === "income" && isThisMonth(t.date)).reduce((s, t) => s + t.amount, 0), [state.transactions]);
  const totalExpense = useMemo(() => state.transactions.filter((t) => t.type === "expense" && isThisMonth(t.date)).reduce((s, t) => s + t.amount, 0), [state.transactions]);

  const handleFile = (file) => {
    if (!file) return;
    const tryParse = (text) => setCsvPreview(parseCSV(text));
    const r16 = new FileReader();
    r16.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      if (parsed.length > 0) { setCsvPreview(parsed); }
      else { const r8 = new FileReader(); r8.onload = (e2) => tryParse(e2.target.result); r8.readAsText(file, "utf-8"); }
    };
    r16.readAsText(file, "utf-16");
  };

  const confirmImport = () => { onImport(csvPreview); setCsvPreview([]); setShowCSV(false); };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-title">{t.transactions}</div>
          <div className="page-subtitle">All your income and expenses in one place</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowCSV(true)}>📂 {t.importCSV}</button>
          <button className="btn btn-primary btn-sm" onClick={onOpenAdd}>{t.add}</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <div className="glass stat-card">
          <div className="label">{t.thisMonthIncome}</div>
          <div className="value" style={{ color: "var(--green)", fontSize: 22 }}>+{fmt(sym, totalIncome)}</div>
        </div>
        <div className="glass stat-card">
          <div className="label">{t.thisMonthExpenses}</div>
          <div className="value" style={{ color: "var(--red)", fontSize: 22 }}>−{fmt(sym, totalExpense)}</div>
        </div>
        <div className="glass stat-card">
          <div className="label">{t.netThisMonth}</div>
          <div className="value" style={{ color: totalIncome - totalExpense >= 0 ? "var(--green)" : "var(--red)", fontSize: 22 }}>
            {totalIncome - totalExpense >= 0 ? "+" : "−"}{fmt(sym, totalIncome - totalExpense)}
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: 16, marginBottom: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "income", "expense"].map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(f)}>
              {f === "all" ? t.all : f === "income" ? `💰 ${t.income}` : `💸 ${t.expenses}`}
            </button>
          ))}
        </div>
        <input style={{ flex: 1, minWidth: 160, padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontFamily: "inherit", fontSize: 13, outline: "none" }}
          placeholder={t.searchTransactions} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="glass" style={{ padding: 8 }}>
        {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">🔍</div><p>{t.noTransactions}</p></div>}
        {filtered.map((tx) => (
          <div className="tx-row" key={tx.id} onClick={() => onEdit(tx)}>
            <div className="tx-icon">{getCatIcon(tx.category, tx.type)}</div>
            <div className="tx-info">
              <div className="tx-label">{tx.label}</div>
              <div className="tx-meta">
                {formatDate(tx.date)} ·{" "}
                <span className="badge badge-muted" style={{ fontSize: 10, padding: "1px 7px" }}>{getCatLabel(tx.category, tx.type, t)}</span>
                {tx.note ? ` · ${tx.note}` : ""}
              </div>
            </div>
            <div className={`tx-amount ${tx.type}`}>{tx.type === "income" ? "+" : "−"}{fmt(sym, tx.amount)}</div>
            <div className="tx-del" onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }}>✕</div>
          </div>
        ))}
      </div>

      {showCSV && (
        <Modal onClose={() => { setShowCSV(false); setCsvPreview([]); }}>
          <div className="modal-body">
            <div className="modal-title">📂 {t.importCSVTitle}</div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>{t.importCSVDesc}</p>
            {csvPreview.length === 0 ? (
              <div className={`drop-zone ${dragging ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}>
                <div className="drop-icon">📄</div>
                <div>{t.dropCSV} <strong style={{ color: "var(--green)" }}>{t.clickToBrowse}</strong></div>
                <div style={{ fontSize: 11, marginTop: 6 }}>{t.csvSupport}</div>
                <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: "var(--green)", marginBottom: 10, fontWeight: 600 }}>✓ {csvPreview.length} {t.foundTransactions}</div>
                <div style={{ maxHeight: 240, overflowY: "auto" }}>
                  {csvPreview.slice(0, 10).map((tx, i) => (
                    <div className="tx-row" key={i} style={{ padding: "8px 10px" }}>
                      <div className="tx-info"><div className="tx-label">{tx.label}</div><div className="tx-meta">{formatDate(tx.date)}</div></div>
                      <div className={`tx-amount ${tx.type}`}>{tx.type === "income" ? "+" : "−"}{fmt(sym, tx.amount)}</div>
                    </div>
                  ))}
                  {csvPreview.length > 10 && <div style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", padding: 8 }}>+{csvPreview.length - 10} more…</div>}
                </div>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setShowCSV(false); setCsvPreview([]); }}>{t.cancel}</button>
              {csvPreview.length > 0 && <button className="btn btn-primary" onClick={confirmImport}>{t.importBtn} {csvPreview.length}</button>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
