import { useMemo, useState } from "react";
import Ticker from "../components/Ticker.jsx";
import { CATS } from "../constants.js";

const TAG_FILTERS = ["Halal", "Vegan", "Dairy-free"];

function locText(spot) {
  if (spot.outlets === "island-wide") return "Island-wide";
  if (spot.loc && spot.loc !== "TBC" && !/multiple|outlets/i.test(spot.loc)) return spot.loc;
  if (spot.outlets === "multiple") return "Multiple outlets";
  return "Singapore";
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Placeholder movement deltas — phase two replaces this with real diffs from
// a weekly standings snapshot table. Deterministic per spot so it doesn't
// flicker between renders.
function moveFor(spot) {
  if (Date.now() - spot.addedAt < 3 * 86400000) return { type: "new" };
  const h = hashCode(String(spot.id)) % 7;
  if (h === 0) return { type: "flat" };
  return { type: h % 2 === 0 ? "up" : "down", n: (h % 3) + 1 };
}

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export default function RankingsPage({ spots, ranked, weeklyWinner }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(() => ranked.filter(s => {
    if (activeFilter === "All") return true;
    if (TAG_FILTERS.includes(activeFilter)) {
      if (activeFilter === "Halal") return s.halal;
      if (activeFilter === "Vegan") return s.vegan;
      if (activeFilter === "Dairy-free") return s.dairyFree;
    }
    return s.cat === activeFilter;
  }), [ranked, activeFilter]);

  const totalVotes = useMemo(() => spots.reduce((a, s) => a + (s.wins || 0), 0), [spots]);

  const champBase = useMemo(() => {
    const named = weeklyWinner?.spots?.name;
    if (named) return spots.find(s => s.name === named) || ranked[0];
    return ranked[0];
  }, [spots, ranked, weeklyWinner]);

  const mover = useMemo(() => {
    const moves = ranked.slice(1).map(s => ({ spot: s, move: moveFor(s) })).filter(m => m.move.type === "up");
    moves.sort((a, b) => b.move.n - a.move.n);
    return moves[0] || null;
  }, [ranked]);

  if (!ranked.length) return null;

  return (
    <div className="mbba">
      <Ticker
        items={[
          `Week ${isoWeek(new Date())} standings are live`,
          mover ? `Biggest mover · ${mover.spot.name} up ${mover.move.n}` : null,
          champBase ? `${champBase.name} defends the belt` : null,
        ]}
      />
      <header className="mbba-top">
        <span className="mbba-brand">MBBA <em>standings</em></span>
        <span className="mbba-badge plain">WK {isoWeek(new Date())}</span>
      </header>

      <main className="mbba-stage" style={{ paddingTop: 6 }}>
        <h1 className="mbba-headline">The <em>standings</em></h1>
        <p className="mbba-sub" style={{ marginBottom: 18 }}>
          Decided by <b>{totalVotes.toLocaleString()} votes</b> from people who actually eat here.
        </p>

        {champBase && (
          <div style={{ background: "var(--crust)", color: "var(--crumb)", borderRadius: 22, padding: "18px 20px", boxShadow: "4px 4px 0 rgba(35,21,5,.22)", marginBottom: 14, position: "relative", overflow: "hidden" }}>
            <span style={{ position: "absolute", right: -6, top: -10, fontSize: 64, transform: "rotate(12deg)", opacity: .9 }}>🏆</span>
            <div style={{ fontSize: 10, letterSpacing: ".24em", textTransform: "uppercase", fontWeight: 700, color: "var(--yellow)", paddingRight: 60 }}>Reigning champ</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,8vw,38px)", textTransform: "uppercase", lineHeight: 1, margin: "6px 0 8px", paddingRight: 60 }}>{champBase.name}</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,249,235,.72)" }}>
              {champBase.cat} · {locText(champBase)} · leading the board {champBase.wins}W–{champBase.losses}L.
            </div>
          </div>
        )}

        {mover && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--yellow)", border: "2.5px solid var(--crust)", borderRadius: 18, padding: "12px 16px", marginBottom: 18, boxShadow: "4px 4px 0 var(--crust)", fontSize: 13, fontWeight: 600 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 26, lineHeight: 1 }}>▲{mover.move.n}</span>
            <span><b>Biggest mover:</b> {mover.spot.name} jumped {mover.move.n} spot{mover.move.n !== 1 ? "s" : ""} this week.</span>
          </div>
        )}

        <div className="mbba-pillrow">
          {["All", ...CATS, ...TAG_FILTERS].map(c => (
            <button key={c} className={`mbba-pill${activeFilter === c ? " on" : ""}`} onClick={() => setActiveFilter(c)}>{c}</button>
          ))}
        </div>

        {filtered.map((spot, i) => {
          const rank = ranked.indexOf(spot) + 1;
          const total = spot.wins + spot.losses;
          const move = moveFor(spot);
          return (
            <div key={spot.id} className="mbba-row" style={{ cursor: "default" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, width: 44, flex: "0 0 44px", textAlign: "center", lineHeight: 1 }}>
                {rank}
                <small style={{
                  display: "inline-block", fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: ".1em", fontWeight: 700, marginTop: 2,
                  color: move.type === "up" ? "var(--win)" : move.type === "down" ? "var(--rust)" : move.type === "new" ? "var(--crust)" : "var(--down)",
                  background: move.type === "new" ? "var(--yellow)" : "transparent",
                  borderRadius: move.type === "new" ? 4 : 0,
                  padding: move.type === "new" ? "1px 4px" : 0,
                }}>
                  {move.type === "new" ? "NEW" : move.type === "flat" ? "—" : move.type === "up" ? `▲${move.n}` : `▼${move.n}`}
                </small>
              </div>
              <div className="mbba-row-info">
                <div className="mbba-row-name">{spot.name}</div>
                <div className="mbba-row-meta">{spot.cat} · {locText(spot)}</div>
              </div>
              <div style={{ flex: "0 0 auto", textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{spot.wins}W–{spot.losses}L</div>
                <div style={{ width: 64, height: 6, border: "1.5px solid var(--crust)", borderRadius: 99, marginTop: 5, overflow: "hidden", background: "var(--crumb)" }}>
                  <div style={{ display: "block", height: "100%", background: "var(--yellow)", width: total > 0 ? `${Math.round((spot.wins / total) * 100)}%` : "0%" }} />
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-soft)" }}>
            <p style={{ fontSize: 15 }}>No spots match.</p>
          </div>
        )}

        <p className="mbba-foot-note">
          Community votes only. No critics, no paid spots, no secret panels.
        </p>
      </main>
    </div>
  );
}
