// Symbols longer than 1 char (Kč, Ft, лв, etc.) get a space for readability
function sep(symbol) { return symbol.length > 1 ? " " : ""; }

export function fmt(symbol, n, compact = false) {
  if (compact && Math.abs(n) >= 1000) {
    return `${symbol}${sep(symbol)}${(Math.abs(n) / 1000).toFixed(1)}k`;
  }
  return `${symbol}${sep(symbol)}${Math.abs(n).toLocaleString("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function fmtFull(symbol, n) {
  return `${symbol}${sep(symbol)}${Math.abs(n).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatMonth(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function getDaysLeft() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.getDate() - now.getDate();
}

export function getDaysInMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function isThisMonth(iso) {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// Parse a quoted CSV line into columns, handling commas inside quotes
function parseCSVLine(line) {
  const cols = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cols.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cols.push(current.trim());
  return cols;
}

// Parse amount string from Czech bank format: "1 400,00" or "-1 400,00"
// Handles non-breaking spaces (\xa0) and comma as decimal separator
function parseAmount(raw) {
  if (!raw) return null;
  // Remove non-breaking spaces, regular spaces, then replace comma decimal with dot
  const cleaned = raw.replace(/\xa0/g, "").replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num) || num === 0) return null;
  return num;
}

// Parse date in DD.MM.YYYY (Czech) or YYYY-MM-DD or MM/DD/YYYY
function parseDate(str) {
  if (!str) return null;
  // DD.MM.YYYY — Czech bank format
  const czMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (czMatch) {
    return new Date(`${czMatch[3]}-${czMatch[2].padStart(2,"0")}-${czMatch[1].padStart(2,"0")}`);
  }
  // Fallback
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// Auto-detect category from Czech bank category or merchant name
function guessCategory(bankCat, label) {
  const cat = (bankCat + " " + label).toLowerCase();
  if (cat.includes("potrav") || cat.includes("food") || cat.includes("restaur") || cat.includes("kavárna") || cat.includes("coffee")) return "food";
  if (cat.includes("doprav") || cat.includes("mhd") || cat.includes("vlak") || cat.includes("bus") || cat.includes("cd.cz") || cat.includes("pohon")) return "transport";
  if (cat.includes("zdraví") || cat.includes("lékárna") || cat.includes("health") || cat.includes("doktor")) return "health";
  if (cat.includes("netflix") || cat.includes("spotify") || cat.includes("youtube") || cat.includes("google") || cat.includes("zábava")) return "entertainment";
  if (cat.includes("nájem") || cat.includes("elektři") || cat.includes("plyn") || cat.includes("internet") || cat.includes("telefon")) return "bills";
  if (cat.includes("oblečen") || cat.includes("shopping") || cat.includes("zboží")) return "shopping";
  if (cat.includes("příjm") || cat.includes("mzda") || cat.includes("salary")) return "salary";
  return "other";
}

export function parseCSV(text) {
  // Strip UTF-16 BOM if present
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

  // Map Czech Česká spořitelna / Komerční banka column names to indices
  const colMap = {
    date: ["datum zaúčtování", "datum", "date", "dátum", "datum pohybu"],
    label: ["název protiúčtu", "popis", "description", "protiúčet", "název", "zpráva příjemci"],
    amount: ["částka", "amount", "čiastka", "objem"],
    category: ["kategorie", "category", "typ transakce"],
  };

  function findCol(names) {
    for (const name of names) {
      const idx = headers.findIndex((h) => h.includes(name));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  const dateIdx = findCol(colMap.date);
  const labelIdx = findCol(colMap.label);
  const amountIdx = findCol(colMap.amount);
  const catIdx = findCol(colMap.category);

  // If we can't find key columns, fall back to positional guessing
  const useFallback = dateIdx === -1 || amountIdx === -1;

  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 2) continue;

    let dateStr, labelStr, amountRaw, bankCat;

    if (useFallback) {
      // Positional: col0=date, col1=label, find amount anywhere
      dateStr = cols[0];
      labelStr = cols[1] || "Imported";
      amountRaw = cols.find((c) => /^-?[\d\s\xa0]+[,.]?\d*$/.test(c.replace(/\xa0/g, " ")));
    } else {
      dateStr = cols[dateIdx] || "";
      labelStr = cols[labelIdx] || cols[3] || "Imported";
      amountRaw = cols[amountIdx] || "";
      bankCat = catIdx !== -1 ? (cols[catIdx] || "") : "";
    }

    const date = parseDate(dateStr);
    if (!date) continue;

    const amount = parseAmount(amountRaw);
    if (amount === null) continue;

    const isExpense = amount < 0;
    const category = guessCategory(bankCat || "", labelStr);

    results.push({
      id: Date.now() + i,
      type: isExpense ? "expense" : "income",
      label: labelStr.replace(/"/g, "").trim().slice(0, 50),
      amount: Math.abs(amount),
      date: date.toISOString(),
      category: isExpense ? (category === "salary" ? "other" : category) : (category === "salary" ? "salary" : "other"),
      note: bankCat ? bankCat.trim() : "CSV import",
    });
  }

  return results;
}

export function getMonthlySubCost(sub) {
  if (sub.cycle === "yearly") return sub.amount / 12;
  if (sub.cycle === "weekly") return sub.amount * 4.33;
  return sub.amount;
}
