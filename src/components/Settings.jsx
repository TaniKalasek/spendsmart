import { useState } from "react";
import { LANGUAGES } from "../data/translations";

export function Settings({ state, currency, onUpdate, onCurrencyOpen, onReset, t }) {
  const [form, setForm] = useState({
    name: state.settings.name || "",
    monthlySavingsGoal: state.settings.monthlySavingsGoal || 0,
    language: state.settings.language || "en",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate({ name: form.name.trim() || "User", monthlySavingsGoal: parseFloat(form.monthlySavingsGoal) || 0, language: form.language });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-in" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <div className="page-title">{t.settings}</div>
          <div className="page-subtitle">Configure your SpendSmart experience</div>
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 14 }}>
        <div className="section-title">{t.profile}</div>
        <div className="field">
          <label>{t.yourName}</label>
          <input placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 14 }}>
        <div className="section-title">{t.language}</div>
        <div className="curr-grid">
          {LANGUAGES.map((lang) => (
            <div key={lang.code} className={`curr-opt ${form.language === lang.code ? "active" : ""}`}
              onClick={() => setForm((f) => ({ ...f, language: lang.code }))}>
              <span className="curr-flag">{lang.flag}</span>
              <div>
                <div className="curr-code">{lang.name}</div>
                <div className="curr-name">{lang.code.toUpperCase()} {lang.dir === "rtl" ? "· RTL" : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 14 }}>
        <div className="section-title">{t.currency}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, color: "var(--text)" }}>{currency.flag} {currency.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{currency.code} · {currency.symbol}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onCurrencyOpen}>{t.change}</button>
        </div>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 14 }}>
        <div className="section-title">{t.budgetGoals}</div>
        <div className="field">
          <label>{t.monthlySavingsTarget} ({currency.symbol})</label>
          <input type="number" min="0" placeholder="e.g. 5000" value={form.monthlySavingsGoal}
            onChange={(e) => setForm((f) => ({ ...f, monthlySavingsGoal: e.target.value }))} />
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.savingsReserved}</p>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 14 }}>
        <div className="section-title">{t.data}</div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>{t.dataLocal}</p>
        <button className="btn btn-danger btn-sm"
          onClick={() => { if (window.confirm("Reset all data? This cannot be undone.")) onReset(); }}>
          🗑️ {t.resetAllData}
        </button>
      </div>

      <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSave}>
        {saved ? t.saved : t.saveChanges}
      </button>
    </div>
  );
}
