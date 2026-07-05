import BottomSheet from "./BottomSheet.jsx";
import { CONTACT } from "../constants.js";

const FEEDBACK_TYPES = ["General feedback", "Suggest a spot", "Report an issue", "Partnership enquiry", "Other"];

export default function FeedbackSheet({
  fbName, setFbName, fbEmail, setFbEmail, fbType, setFbType, fbMsg, setFbMsg,
  fbSending, fbDone, setFbDone, fbErr, submitFeedback, onClose,
}) {
  return (
    <BottomSheet onClose={onClose} ariaLabel="Feedback">
      <h2>Send <em>feedback</em></h2>

      {fbDone ? (
        <div style={{ textAlign: "center", padding: "20px 4px 4px" }}>
          <p style={{ fontSize: 34, marginBottom: 8 }}>🍌</p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 24, textTransform: "uppercase" }}>Message sent.</p>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "10px 0 20px", lineHeight: 1.6 }}>
            Thanks for taking the time. We'll get back to you if needed at{" "}
            <b style={{ color: "var(--crust)" }}>{fbEmail || "the email you provided"}</b>.
          </p>
          <button className="mbba-btn-secondary" onClick={() => setFbDone(false)}>Send another</button>
        </div>
      ) : (
        <>
          <p className="mbba-sp">
            Got a suggestion, spotted an issue, or want to say something? We read every message. Reach us directly at{" "}
            <a href={`mailto:${CONTACT}`} style={{ color: "var(--crust)", fontWeight: 700 }}>{CONTACT}</a> or use the form below.
          </p>

          <div className="mbba-lab">Type</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 4 }}>
            {FEEDBACK_TYPES.map(t => (
              <button key={t} className={`mbba-pill${fbType === t ? " on" : ""}`} onClick={() => setFbType(t)}>{t}</button>
            ))}
          </div>

          <div className="mbba-lab">Name · optional</div>
          <input className="mbba-inp" value={fbName} onChange={e => setFbName(e.target.value)} placeholder="Your name" />

          <div className="mbba-lab">Email · optional, only if you want a reply</div>
          <input className="mbba-inp" type="email" value={fbEmail} onChange={e => setFbEmail(e.target.value)} placeholder="your@email.com" />

          <div className="mbba-lab">Message</div>
          <textarea
            className="mbba-inp"
            value={fbMsg}
            onChange={e => setFbMsg(e.target.value)}
            placeholder="Tell us anything…"
            rows={5}
            style={{ resize: "vertical", minHeight: 110, lineHeight: 1.6 }}
          />

          {fbErr && <p style={{ fontSize: 13, color: "var(--rust)", fontWeight: 700, marginTop: 12 }}>{fbErr}</p>}

          <button className="mbba-btn-primary" style={{ marginTop: 20 }} disabled={fbSending} onClick={submitFeedback}>
            {fbSending ? "Sending…" : "Send message"}
          </button>
          <p className="mbba-fine">We respond to partnership enquiries and legitimate issues. Not everything will get a reply but everything gets read.</p>
        </>
      )}
    </BottomSheet>
  );
}
