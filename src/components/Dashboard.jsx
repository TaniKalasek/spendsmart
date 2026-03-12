import { useMemo } from "react";
import { fmt, formatDate, getDaysLeft, getDaysInMonth, isThisMonth, getMonthlySubCost } from "../utils/helpers";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../data/constants";

const MONTHS_SHORT = {
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  cs: ["Led","Úno","Bře","Dub","Kvě","Čvn","Čvc","Srp","Zář","Říj","Lis","Pro"],
  es: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
  fr: ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"],
  de: ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],
  pt: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
  ja: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
  zh: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
  ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
};

function getCatIcon(catId, type) {
  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === catId)?.icon || "📦";
}

export function Dashboard({ state, currency, onAdd, onDelete, onCurrencyOpen, t }) {
  const { transactions, subscriptions, savings, settings } = state;
  const sym = currency.symbol;
  const lang = settings?.language || "en";
  const daysLeft = getDaysLeft();
  const daysInMonth = getDaysInMonth();
  const daysPassed = daysInMonth - daysLeft;
  const months = MONTHS_SHORT[lang] || MONTHS_SHORT.en;

  const thisMonthTx = useMemo(() => transactions.filter((tx) => isThisMonth(tx.date)), [transactions]);

  const totalIncome = useMemo(
    () => thisMonthTx.filter((tx) => tx.type === "income").reduce((s, tx) => s + tx.amount, 0),
    [thisMonthTx]
  );
  const totalExpenses = useMemo(
    () => thisMonthTx.filter((tx) => tx.type === "expense").reduce((s, tx) => s + tx.amount, 0),
    [thisMonthTx]
  );
  const totalSubs = useMemo(
    () => subscriptions.filter((s) => s.active).reduce((sum, s) => sum + getMonthlySubCost(s), 0),
    [subscriptions]
  );

  const realBalance = totalIncome - totalExpenses - totalSubs;
  const savingsThisMonth = settings.monthlySavingsGoal || 0;
  const spendableBudget = Math.max(0, realBalance - savingsThisMonth);
  // Subtract remaining subscription costs this month from spendable before dividing
  const remainingSubsCost = totalSubs; // already monthly, still owed this month
  const trueSpendable = Math.max(0, spendableBudget - remainingSubsCost);
  const dailyBudget = daysLeft > 0 ? trueSpendable / daysLeft : 0;

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const m = d.getMonth(); const y = d.getFullYear();
      const inc = transactions.filter((tx) => {
        const td = new Date(tx.date);
        return tx.type === "income" && td.getMonth() === m && td.getFullYear() === y;
      }).reduce((s, tx) => s + tx.amount, 0);
      const exp = transactions.filter((tx) => {
        const td = new Date(tx.date);
        return tx.type === "expense" && td.getMonth() === m && td.getFullYear() === y;
      }).reduce((s, tx) => s + tx.amount, 0);
      return { label: months[m], income: inc, expenses: exp };
    });
  }, [transactions, months]);

  const maxChart = Math.max(...chartData.map((d) => Math.max(d.income, d.expenses)), 1);
  const recentTx = thisMonthTx.slice(0, 6);

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{t.goodDay}, {settings.name} 👋</div>
          <div className="page-subtitle">
            {new Date().toLocaleDateString(lang === "cs" ? "cs-CZ" : lang === "ar" ? "ar" : "en-GB", { weekday: "long", day: "numeric", month: "long" })}
            {" · "}{daysLeft} {t.daysLeft}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="curr-pill" onClick={onCurrencyOpen}>{currency.flag} {currency.code} <span style={{ opacity: 0.5, marginLeft: 2 }}>▾</span></div>
          <button className="btn btn-primary btn-sm" onClick={onAdd}>+ {t.add?.replace("+ ", "") || "Add"}</button>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="glass stat-card">
          <div className="label">{t.realBalance}</div>
          <div className="value" style={{ color: realBalance >= 0 ? "var(--green)" : "var(--red)", fontSize: 22 }}>
            {realBalance < 0 ? "−" : ""}{fmt(sym, Math.abs(realBalance))}
          </div>
          <div className="sub">{t.incomeMinusExpenses}</div>
        </div>
        <div className="glass stat-card">
          <div className="label">{t.spendable}</div>
          <div className="value" style={{ color: "var(--blue)", fontSize: 22 }}>
            {fmt(sym, spendableBudget)}
          </div>
          <div className="sub">{t.afterSavingsGoal}</div>
        </div>
        <div className="glass stat-card">
          <div className="label">{t.dailyBudget}</div>
          <div className="value" style={{ fontSize: 22 }}>{fmt(sym, dailyBudget)}</div>
          <div className="sub">{daysLeft} {t.daysRemaining}</div>
        </div>
        <div className="glass stat-card">
          <div className="label">{t.subscriptionsCost}</div>
          <div className="value" style={{ color: "var(--yellow)", fontSize: 22 }}>{fmt(sym, totalSubs)}</div>
          <div className="sub">{subscriptions.filter((s) => s.active).length} {t.activePerMonth}</div>
        </div>
      </div>

      {/* Income vs Expenses */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>{t.incomeVsExpenses}</div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--green)", display: "inline-block" }} />{t.income}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--red)", display: "inline-block" }} />{t.expenses}</span>
            </div>
          </div>
          <div className="chart-wrap">
            {chartData.map((d, i) => (
              <div key={i} className="chart-bar-group">
                <div className="chart-bar" style={{ height: `${(d.income / maxChart) * 100}%`, background: "var(--green)", opacity: 0.75 }} title={`${t.income}: ${fmt(sym, d.income)}`} />
                <div className="chart-bar" style={{ height: `${(d.expenses / maxChart) * 100}%`, background: "var(--red)", opacity: 0.75 }} title={`${t.expenses}: ${fmt(sym, d.expenses)}`} />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {chartData.map((d, i) => <div key={i} className="chart-label">{d.label}</div>)}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <div><div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{t.income}</div><div style={{ fontWeight: 700, color: "var(--green)" }}>{fmt(sym, totalIncome)}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{t.expenses}</div><div style={{ fontWeight: 700, color: "var(--red)" }}>{fmt(sym, totalExpenses)}</div></div>
            <div><div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{t.net}</div><div style={{ fontWeight: 700, color: realBalance >= 0 ? "var(--green)" : "var(--red)" }}>{realBalance < 0 ? "−" : "+"}{fmt(sym, Math.abs(realBalance))}</div></div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="glass" style={{ padding: 20, flex: 1 }}>
            <div className="section-title">{t.monthProgress}</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 5 }}>
              <span>{t.dayOf} {daysPassed} {t.of} {daysInMonth}</span>
                <span>{Math.round((daysPassed / daysInMonth) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(daysPassed / daysInMonth) * 100}%`, background: "var(--blue)" }} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 5 }}>
                <span>{t.budgetUsed}</span>
                <span>{totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0}%`, background: totalExpenses / totalIncome > 0.75 ? "var(--red)" : "var(--green)" }} />
              </div>
            </div>

          </div>

          <div className="glass" style={{ padding: 20 }}>
            <div className="section-title">{t.savingsGoals}</div>
            {savings.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>{t.noGoals}</div>
            )}
            {savings.slice(0, 2).map((g) => (
              <div key={g.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span>{g.icon} {g.label}</span>
                  <span style={{ color: "var(--text-muted)" }}>{Math.round((g.saved / g.target) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (g.saved / g.target) * 100)}%`, background: g.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>
            {t.recentTransactions}
            <span className="count">{thisMonthTx.length} {t.thisMonth}</span>
          </div>
        </div>
        {recentTx.length === 0 && (
          <div className="empty-state"><div className="empty-icon">💸</div><p>{t.noTransactionsMonth}</p></div>
        )}
        {recentTx.map((tx) => (
          <div className="tx-row" key={tx.id}>
            <div className="tx-icon">{getCatIcon(tx.category, tx.type)}</div>
            <div className="tx-info">
              <div className="tx-label">{tx.label}</div>
              <div className="tx-meta">{formatDate(tx.date)}{tx.note ? ` · ${tx.note}` : ""}</div>
            </div>
            <div className={`tx-amount ${tx.type}`}>
              {tx.type === "income" ? "+" : "−"}{fmt(sym, tx.amount)}
            </div>
            <div className="tx-del" onClick={() => onDelete(tx.id)}>✕</div>
          </div>
        ))}
      </div>
    </div>
  );
}
