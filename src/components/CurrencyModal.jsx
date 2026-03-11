import { useState } from "react";
import { Modal } from "./Modal";
import { CURRENCIES } from "../data/constants";

export function CurrencyModal({ current, onSelect, onClose, t }) {
  const [search, setSearch] = useState("");
  const filtered = CURRENCIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal onClose={onClose} maxWidth={500}>
      <div className="modal-body">
        <div className="modal-title">{t?.currency || "Choose Currency"}</div>
        <input
          autoFocus
          placeholder="Search currency…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text)", fontFamily: "inherit", fontSize: 14, outline: "none", marginBottom: 12 }}
        />
        <div className="curr-grid" style={{ maxHeight: 380 }}>
          {filtered.map((c) => (
            <div key={c.code} className={`curr-opt ${current === c.code ? "active" : ""}`}
              onClick={() => { onSelect(c.code); onClose(); }}>
              <span className="curr-flag">{c.flag}</span>
              <div>
                <div className="curr-code">{c.code} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>{c.symbol}</span></div>
                <div className="curr-name">{c.name}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 20, color: "var(--text-muted)", fontSize: 13 }}>No currencies found.</div>}
        </div>
        <div className="modal-footer" style={{ marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose}>{t?.cancel || "Cancel"}</button>
        </div>
      </div>
    </Modal>
  );
}
