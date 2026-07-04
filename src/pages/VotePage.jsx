import { useEffect, useState } from "react";
import Ticker from "../components/Ticker.jsx";

function locText(spot) {
  if (spot.outlets === "island-wide") return "Island-wide";
  if (spot.loc && spot.loc !== "TBC" && !/multiple|outlets/i.test(spot.loc)) return spot.loc;
  if (spot.outlets === "multiple") return "Multiple outlets";
  return "Singapore";
}

function flavorTag(spot) {
  const top = Object.entries(spot.tags || {}).sort((a, b) => b[1] - a[1])[0];
  if (top) return top[0];
  if (spot.halal) return "Halal";
  if (spot.vegan) return "Vegan option";
  if (spot.dairyFree) return "Dairy-free";
  if (spot.outlets === "island-wide") return "Island-wide";
  if (spot.outlets === "multiple") return "Multiple outlets";
  return "In the running";
}

export default function VotePage({ spots, ranked, weeklyWinner, pair, chosen, vote, onSkip, sessionVotes }) {
  const [result, setResult] = useState(null);
  const [barA, setBarA] = useState(50);
  const [barB, setBarB] = useState(50);

  useEffect(() => {
    if (!result) return;
    setBarA(50);
    setBarB(50);
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        setBarA(result.aPct);
        setBarB(result.bPct);
      }, 120);
    });
    return () => cancelAnimationFrame(raf);
  }, [result]);

  if (!pair || pair.length < 2) return null;
  const [spotA, spotB] = pair;

  const champ = weeklyWinner?.spots || ranked?.[0];
  const latest = [...spots].sort((a, b) => b.addedAt - a.addedAt)[0];

  const handlePick = (pickIdx) => {
    if (chosen || result) return;
    const winner = pickIdx === 0 ? spotA : spotB;
    const loserSpot = pickIdx === 0 ? spotB : spotA;
    // Placeholder community split — phase two wires this to a real vote-share query.
    let aPct = Math.floor(35 + Math.random() * 30);
    aPct = pickIdx === 0 ? Math.min(78, aPct + 12) : Math.max(22, aPct - 12);
    const bPct = 100 - aPct;
    const youWithMajority = (pickIdx === 0 && aPct >= bPct) || (pickIdx === 1 && bPct > aPct);
    setResult({ aName: spotA.name, bName: spotB.name, aPct, bPct, winnerName: winner.name, youWithMajority, pickName: winner.name });
    vote(winner, loserSpot);
  };

  const handleNext = () => setResult(null);
  const handleSkip = () => {
    setResult(null);
    onSkip();
  };

  return (
    <div className="mbba">
      <Ticker
        items={[
          champ ? `🏆 Reigning champ · ${champ.name}` : null,
          `${spots.length} spots in the running`,
          latest ? `New challenger · ${latest.name}, ${locText(latest)}` : null,
        ]}
      />
      <header className="mbba-top">
        <span className="mbba-brand">MBBA <em>the vote</em></span>
        <span className="mbba-badge">🔥 {sessionVotes} today</span>
      </header>

      <main className="mbba-stage">
        {!result ? (
          <section>
            <p className="mbba-kicker" style={{ textAlign: "center", marginTop: 14 }}>That list from Reddit</p>
            <h1 className="mbba-headline" style={{ textAlign: "center" }}>Which loaf <em>takes it?</em></h1>
            <p className="mbba-sub" style={{ textAlign: "center", marginBottom: 22 }}>Tap your winner. The city is watching.</p>

            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
              {[spotA, spotB].map((spot, idx) => (
                <button
                  key={spot.id}
                  className="mbba-card pressable"
                  disabled={!!chosen}
                  onClick={() => handlePick(idx)}
                  style={{ position: "relative", width: "100%", textAlign: "left", background: "#fff", padding: "20px 20px 18px" }}
                >
                  <span style={{ position: "absolute", top: 16, right: 16, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)" }}>Tap to vote</span>
                  <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 700, color: "var(--ink-soft)" }}>{spot.cat} · {locText(spot)}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,7.4vw,36px)", textTransform: "uppercase", lineHeight: 1.02, margin: "4px 0 10px" }}>{spot.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <span className="mbba-chip on">{spot.wins}W–{spot.losses}L</span>
                    <span className="mbba-chip">{flavorTag(spot)}</span>
                  </div>
                </button>
              ))}
              <div style={{
                position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%) rotate(-6deg)",
                zIndex: 3, background: "var(--crust)", color: "var(--yellow)", fontFamily: "var(--font-display)",
                fontSize: 20, padding: "8px 16px", borderRadius: 12, boxShadow: "3px 3px 0 rgba(35,21,5,.25)", pointerEvents: "none",
              }}>VS</div>
            </div>

            <button className="mbba-link-quiet" onClick={handleSkip}>Can't call it? Skip this one</button>
          </section>
        ) : (
          <section className="mbba-pop-in">
            <p className="mbba-kicker" style={{ textAlign: "center", marginTop: 26 }}>The people have spoken</p>
            <h2 className="mbba-headline" style={{ textAlign: "center", fontSize: "clamp(34px,9.5vw,50px)", margin: "6px 0 2px" }}>
              {result.winnerName} <em>takes it</em>
            </h2>
            <p className="mbba-sub" style={{ textAlign: "center", marginBottom: 24 }}>
              {result.youWithMajority ? "You voted with the majority" : "Bold. You went against the crowd"}
            </p>

            <div className="mbba-card" style={{ borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "stretch", height: 64 }}>
                <div className="mbba-split-fill" style={{ display: "flex", alignItems: "center", padding: "0 14px", minWidth: 64, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", width: `${barA}%`, background: "var(--yellow)", borderRight: "2.5px solid var(--crust)", transition: "width 1s cubic-bezier(.3,1,.3,1)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 22, marginRight: 8 }}>{barA}%</span>
                </div>
                <div className="mbba-split-fill" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 14px", minWidth: 64, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", width: `${barB}%`, background: "#fff", transition: "width 1s cubic-bezier(.3,1,.3,1)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 22, marginLeft: 8 }}>{barB}%</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderTop: "2.5px solid var(--crust)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", background: "var(--crumb)" }}>
                <span>{result.aName}</span><span>{result.bName}</span>
              </div>
            </div>

            <p style={{ margin: "16px auto 0", textAlign: "center", fontSize: 13, color: "var(--ink-soft)" }}>
              Your pick: <b style={{ color: "var(--crust)" }}>{result.pickName}</b> · vote counted
            </p>

            <button className="mbba-btn-primary" style={{ marginTop: 22 }} onClick={handleNext}>Next matchup →</button>
          </section>
        )}
      </main>
    </div>
  );
}
