import { useState } from "react";
import BottomSheet from "./BottomSheet.jsx";
import { ABOUT_TEXT, FAQS, DISCLAIMER } from "../constants.js";

export default function AboutSheet({ onClose }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <BottomSheet onClose={onClose} ariaLabel="About MBBA">
      <h2>About <em>MBBA</em></h2>

      <div style={{ marginTop: 16, marginBottom: 22 }}>
        {ABOUT_TEXT.map((para, i) => (
          <p
            key={i}
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: "var(--crust)",
              fontWeight: i === ABOUT_TEXT.length - 1 ? 700 : 400,
              marginBottom: i === ABOUT_TEXT.length - 1 ? 0 : 12,
              fontStyle: i === ABOUT_TEXT.length - 1 ? "italic" : "normal",
            }}
          >
            {para}
          </p>
        ))}
      </div>

      <div style={{ borderTop: "2px solid var(--crust)", paddingTop: 18 }}>
        <p className="mbba-lab" style={{ margin: "0 0 14px" }}>FAQ</p>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderTop: i === 0 ? "none" : "1.5px solid rgba(35,21,5,.15)", padding: "13px 0" }}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{ width: "100%", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 0 }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, textAlign: "left", color: "var(--crust)" }}>{faq.q}</span>
              <span style={{ fontSize: 20, color: "var(--ink-soft)", flexShrink: 0, transform: openIdx === i ? "rotate(45deg)" : "none", lineHeight: 1 }}>+</span>
            </button>
            {openIdx === i && (
              <div style={{ marginTop: 10, paddingRight: 16 }}>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7, marginBottom: faq.link ? 8 : 0 }}>{faq.a}</p>
                {faq.link && (
                  <a href={faq.link.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--crust)", fontWeight: 700 }}>
                    {faq.link.label} →
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, borderTop: "2px solid var(--crust)", paddingTop: 16 }}>
        <p className="mbba-lab" style={{ margin: "0 0 8px" }}>Disclaimer</p>
        <p style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.65 }}>{DISCLAIMER}</p>
      </div>

      <button className="mbba-btn-primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
    </BottomSheet>
  );
}
