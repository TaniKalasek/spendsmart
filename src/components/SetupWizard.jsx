import { useState } from "react";
import { LANGUAGES } from "../data/translations";
import { CURRENCIES, LANG_DEFAULT_CURRENCY } from "../data/constants";

export function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("USD");

  const handleLangSelect = (code) => {
    setLang(code);
    // Auto-suggest matching currency but let user override
    const suggested = LANG_DEFAULT_CURRENCY[code];
    if (suggested) setCurrency(suggested);
  };

  const handleFinish = () => {
    onComplete({
      name: name.trim() || "User",
      language: lang,
      currency,
    });
  };

  const canNext = step === 1 ? name.trim().length > 0 : true;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "linear-gradient(135deg, #080b14 0%, #0f1628 50%, #080b14 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      {/* Orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "#4f46e5", filter: "blur(120px)", opacity: 0.12, top: -150, left: -150 }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "#059669", filter: "blur(100px)", opacity: 0.1, bottom: -100, right: -100 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 520, animation: "fadeUp 0.5s ease both" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#34d399", letterSpacing: -1, marginBottom: 4 }}>
            💸 SpendSmart
          </div>
          <div style={{ fontSize: 13, color: "rgba(240,244,255,0.4)" }}>Personal Finance Tracker</div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: s === step ? 28 : 8, height: 8,
              borderRadius: 99,
              background: s <= step ? "#34d399" : "rgba(255,255,255,0.12)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: "36px 32px", animation: "modalUp 0.35s ease both" }}>

          {/* Step 1 — Name */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  Welcome to SpendSmart
                </div>
                <div style={{ fontSize: 14, color: "rgba(240,244,255,0.45)", lineHeight: 1.5 }}>
                  Let's set up your account in 3 quick steps.
                </div>
              </div>
              <div className="field">
                <label>What's your name?</label>
                <input
                  autoFocus
                  placeholder="Your name…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canNext && setStep(2)}
                  style={{ fontSize: 16, padding: "14px 16px" }}
                />
              </div>
              <div style={{ fontSize: 12, color: "rgba(240,244,255,0.3)", marginTop: 8, textAlign: "center" }}>
                We'll use this to personalise your experience.
              </div>
            </div>
          )}

          {/* Step 2 — Language */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🌍</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  Choose your language
                </div>
                <div style={{ fontSize: 14, color: "rgba(240,244,255,0.45)" }}>
                  You can always change this later in Settings.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                {LANGUAGES.map((l) => (
                  <div key={l.code}
                    onClick={() => handleLangSelect(l.code)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      padding: "12px 8px",
                      borderRadius: 12,
                      background: lang === l.code ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
                      border: lang === l.code ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    <span style={{ fontSize: 24 }}>{l.flag}</span>
                    <span style={{ fontSize: 11, color: lang === l.code ? "#34d399" : "rgba(240,244,255,0.6)", fontWeight: 500, textAlign: "center" }}>{l.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Currency */}
          {step === 3 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>💰</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  Choose your currency
                </div>
                <div style={{ fontSize: 14, color: "rgba(240,244,255,0.45)" }}>
                  Pick the currency you use most.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 320, overflowY: "auto" }}>
                {CURRENCIES.map((c) => (
                  <div key={c.code}
                    onClick={() => setCurrency(c.code)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 14px",
                      borderRadius: 12,
                      background: currency === c.code ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.04)",
                      border: currency === c.code ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                    <span style={{ fontSize: 20 }}>{c.flag}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: currency === c.code ? "#34d399" : "#fff" }}>{c.code}</div>
                      <div style={{ fontSize: 10, color: "rgba(240,244,255,0.4)" }}>{c.symbol} · {c.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {step > 1 && (
              <button className="btn btn-ghost" style={{ flex: "0 0 auto" }} onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                className="btn btn-primary"
                style={{ flex: 1, opacity: canNext ? 1 : 0.5 }}
                disabled={!canNext}
                onClick={() => setStep(s => s + 1)}
              >
                Next →
              </button>
            ) : (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleFinish}>
                Let's go! 🚀
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(240,244,255,0.2)" }}>
          Your data stays on your device. No account needed.
        </div>
      </div>
    </div>
  );
}
