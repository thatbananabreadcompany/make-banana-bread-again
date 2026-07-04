import { useMemo, useState } from "react";
import Ticker from "../components/Ticker.jsx";
import BottomSheet from "../components/BottomSheet.jsx";
import { CATS } from "../constants.js";

const TAG_FILTERS = ["Halal", "Vegan", "Dairy-free"];

function hoodOf(spot) {
  if (spot.outlets === "island-wide") return "Island-wide";
  if (spot.outlets === "multiple" && (!spot.loc || /multiple|outlets/i.test(spot.loc))) return "Multiple outlets";
  return spot.loc && spot.loc !== "TBC" ? spot.loc : "Various";
}

function dietTags(spot) {
  const tags = [];
  if (spot.halal) tags.push("Halal");
  if (spot.muslimOwned) tags.push("Muslim-owned");
  if (spot.noPorkLard) tags.push("No pork, no lard");
  if (spot.vegan) tags.push("Vegan");
  if (spot.dairyFree) tags.push("Dairy-free");
  return tags;
}

export default function SpotsPage({
  spots, ranked,
  nName, setNName, handleNName, dupWarn,
  nLoc, setNLoc, nUrl, setNUrl, nCat, setNCat, nOut, setNOut,
  nHalal, setNHalal, nMuslim, setNMuslim, nNoPorkLard, setNNoPorkLard,
  nVegan, setNVegan, nDairy, setNDairy, nHidden, setNHidden,
  nSG, setNSG, formErr, submitSpot,
  onOpenAbout, onOpenFeedback,
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return spots.filter(s => {
      if (activeFilter !== "All") {
        const tagMatch = activeFilter === "Halal" ? s.halal : activeFilter === "Vegan" ? s.vegan : activeFilter === "Dairy-free" ? s.dairyFree : s.cat === activeFilter;
        if (!tagMatch) return false;
      }
      if (q && !s.name.toLowerCase().includes(q) && !hoodOf(s).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [spots, activeFilter, search]);

  const groups = useMemo(() => {
    const g = {};
    filtered.forEach(s => { (g[hoodOf(s)] ||= []).push(s); });
    return Object.keys(g).sort().map(hood => ({ hood, items: g[hood] }));
  }, [filtered]);

  const latest = useMemo(() => [...spots].sort((a, b) => b.addedAt - a.addedAt)[0], [spots]);

  const openAddWithName = (name) => {
    if (name) handleNName(name);
    setAddOpen(true);
  };

  return (
    <div className="mbba">
      <Ticker
        items={[
          `${spots.length} spots and counting`,
          latest ? `Latest addition · ${latest.name}, ${hoodOf(latest)}` : null,
          "Know a spot we missed? Add it in 30 seconds",
        ]}
      />
      <header className="mbba-top">
        <span className="mbba-brand">MBBA <em>the spots</em></span>
        <span className="mbba-badge plain">{spots.length} SPOTS</span>
      </header>

      <main className="mbba-stage" style={{ paddingTop: 6, paddingBottom: 150 }}>
        <h1 className="mbba-headline">Every <em>loaf</em> in the city</h1>
        <p className="mbba-sub" style={{ marginBottom: 16 }}>Every spot here is in the running. Grouped by hood so you can plan the pilgrimage.</p>

        <input className="mbba-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search a name or a hood…" />

        <div className="mbba-pillrow">
          {["All", ...CATS, ...TAG_FILTERS].map(c => (
            <button key={c} className={`mbba-pill${activeFilter === c ? " on" : ""}`} onClick={() => setActiveFilter(c)}>{c}</button>
          ))}
        </div>

        {groups.length === 0 ? (
          <div className="mbba-empty">
            <h3>Nothing yet</h3>
            <p>No spot matches that. Which means you might know one we don't.</p>
            <button className="mbba-btn-secondary" onClick={() => openAddWithName(search)}>Nominate it</button>
          </div>
        ) : (
          groups.map(({ hood, items }) => (
            <div key={hood}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, letterSpacing: ".06em", textTransform: "uppercase", margin: "18px 2px 8px", display: "flex", alignItems: "center", gap: 10 }}>
                📍 {hood}
                <span style={{ flex: 1, height: 2, background: "var(--crust)", opacity: .15, borderRadius: 2 }} />
              </div>
              {items.map(spot => {
                const rank = ranked.indexOf(spot) + 1;
                const isNew = Date.now() - spot.addedAt < 3 * 86400000;
                return (
                  <div key={spot.id} className="mbba-row">
                    <div className="mbba-row-info">
                      <div className="mbba-row-name">{spot.name}</div>
                      <div className="mbba-row-meta">{spot.cat}</div>
                      <div className="mbba-row-badges">
                        <span className="mbba-b rank">#{rank} this week</span>
                        {isNew && <span className="mbba-b">NEW</span>}
                        {dietTags(spot).map(t => <span key={t} className="mbba-b">{t}</span>)}
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, flex: "0 0 auto", color: "var(--ink-soft)" }}>→</div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        <div className="mbba-footer-links">
          <button className="mbba-foot-link" onClick={onOpenFeedback}>Feedback</button>
          <button className="mbba-foot-link" onClick={onOpenAbout}>About</button>
        </div>
      </main>

      <button className="mbba-fab" onClick={() => openAddWithName()}>+ Add a spot</button>

      {addOpen && (
        <BottomSheet onClose={() => setAddOpen(false)} ariaLabel="Add a spot">
          <h2>Nominate <em>a spot</em></h2>
          <p className="mbba-sp">Know somewhere doing great banana bread? Put them in the running. Live immediately, in next week's vote card.</p>

          <div className="mbba-lab">Name</div>
          <input className="mbba-inp" value={nName} onChange={e => handleNName(e.target.value)} placeholder="e.g. Plain Vanilla" />
          {dupWarn && (
            <p style={{ marginTop: 8, fontSize: 12.5, color: "var(--rust)" }}>
              Might already be listed: <b>{dupWarn.name}</b> ({dupWarn.loc}). Is this a different place?
            </p>
          )}

          <div className="mbba-lab">Hood</div>
          <input className="mbba-inp" value={nLoc} onChange={e => setNLoc(e.target.value)} placeholder="e.g. Joo Chiat" />

          <div className="mbba-lab">Instagram or website · optional</div>
          <input className="mbba-inp" value={nUrl} onChange={e => setNUrl(e.target.value)} placeholder="instagram.com/yourbrand" />

          <div className="mbba-lab">What are they</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {CATS.map(c => (
              <button key={c} className={`mbba-pill${nCat === c ? " on" : ""}`} onClick={() => setNCat(c)}>{c}</button>
            ))}
          </div>

          <div className="mbba-lab">Outlets</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {[["single", "Single location"], ["multiple", "Multiple outlets"], ["island-wide", "Island-wide"]].map(([v, l]) => (
              <button key={v} className={`mbba-pill${nOut === v ? " on" : ""}`} onClick={() => setNOut(v)}>{l}</button>
            ))}
          </div>

          <div className="mbba-lab">Tags · optional</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {[
              ["Halal", nHalal, setNHalal],
              ["Muslim-owned", nMuslim, setNMuslim],
              ["No pork, no lard", nNoPorkLard, setNNoPorkLard],
              ["Vegan", nVegan, setNVegan],
              ["Dairy-free", nDairy, setNDairy],
            ].map(([label, val, setter]) => (
              <button key={label} className={`mbba-pill${val ? " on" : ""}`} onClick={() => setter(v => !v)}>{label}</button>
            ))}
          </div>

          <div className="mbba-lab">Location</div>
          <button className={`mbba-pill${nSG ? " on" : ""}`} onClick={() => setNSG(v => !v)}>
            {nSG ? "✓ " : ""}This business is in Singapore
          </button>

          {formErr && <p style={{ fontSize: 13, color: "var(--rust)", fontWeight: 700, marginTop: 14 }}>{formErr}</p>}

          <button className="mbba-btn-primary" style={{ marginTop: 20 }} onClick={submitSpot}>Put them in the running</button>
          <p className="mbba-fine">By submitting you confirm this is a real business selling banana bread or cake in Singapore.</p>
        </BottomSheet>
      )}
    </div>
  );
}
