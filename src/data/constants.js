export const CURRENCIES = [
  // Major world currencies
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
  // European
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty", flag: "🇵🇱" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", flag: "🇧🇬" },
  // Americas
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", flag: "🇲🇽" },
  // Asia / Middle East
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  // Eastern Europe
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", flag: "🇺🇦" },
];

// Suggested default currency per language
export const LANG_DEFAULT_CURRENCY = {
  en: "USD", es: "MXN", fr: "EUR", de: "EUR",
  pt: "BRL", ja: "JPY", zh: "CNY", ar: "AED", cs: "CZK",
};

export const EXPENSE_CATEGORIES = [
  { id: "food", label: "Food", icon: "🍽️" },
  { id: "transport", label: "Transport", icon: "🚌" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "bills", label: "Bills", icon: "📄" },
  { id: "health", label: "Health", icon: "💊" },
  { id: "entertainment", label: "Fun", icon: "🎉" },
  { id: "subscriptions", label: "Subscriptions", icon: "🔄" },
  { id: "other", label: "Other", icon: "📦" },
];

export const INCOME_CATEGORIES = [
  { id: "salary", label: "Salary", icon: "💼" },
  { id: "client", label: "Client", icon: "🤝" },
  { id: "freelance", label: "Freelance", icon: "💻" },
  { id: "other", label: "Other", icon: "💰" },
];

export const SUB_CYCLES = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
  { id: "weekly", label: "Weekly" },
];

// Empty state for new users — no sample data
export const INITIAL_STATE = {
  currency: "USD",
  transactions: [],
  subscriptions: [],
  savings: [],
  settings: {
    name: "",
    monthlySavingsGoal: 0,
    language: "en",
  },
  isNewUser: true,
};
