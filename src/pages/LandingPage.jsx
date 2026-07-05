import { useEffect, useMemo, useRef } from "react";
import Ticker from "../components/Ticker.jsx";
import { CATS, REDDIT_THREAD_URL } from "../constants.js";

function locText(spot) {
  if (spot.outlets === "island-wide") return "Island-wide";
  if (spot.loc && spot.loc !== "TBC" && !/multiple|outlets/i.test(spot.loc)) return spot.loc;
  if (spot.outlets === "multiple") return "Multiple outlets";
  return "Singapore";
}

export default function LandingPage({ spots, ranked, weeklyWinner, onEnter }) {
  const rootRef = useRef(null);
  const tapeRef = useRef(null);

  const champ = useMemo(() => {
    const named = weeklyWinner?.spots?.name;
    const base = (named && spots.find(s => s.name === named)) || ranked[0];
    if (!base) return null;
    return { ...base, rank: ranked.indexOf(base) + 1 };
  }, [spots, ranked, weeklyWinner]);

  const latest = useMemo(() => [...spots].sort((a, b) => b.addedAt - a.addedAt)[0], [spots]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = h.scrollHeight > h.clientHeight ? (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 : 0;
      if (tapeRef.current) tapeRef.current.style.width = pct + "%";
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  // Re-scans on every render so cards that mount later (the champ card waits
  // on live data) still get observed, not just the ones present at first paint.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = root.querySelectorAll(".landing-reveal:not(.in-view)");

    if (!targets.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach(el => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
      });
    }, { threshold: .16, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(el => io.observe(el));

    return () => io.disconnect();
  });

  return (
    <div className="mbba landing load" ref={rootRef}>
      <div className="landing-tape" aria-hidden="true"><i ref={tapeRef} /></div>

      <Ticker
        items={[
          champ ? `🏆 ${champ.name} defends the belt` : null,
          `${spots.length} spots in the running`,
          latest ? `New challenger · ${latest.name}` : null,
        ]}
      />

      <header className="landing-hero">
        <div className="landing-vs" aria-hidden="true">VS</div>
        <a className="landing-stub" href={REDDIT_THREAD_URL} target="_blank" rel="noopener noreferrer">Est. from a Reddit thread ↗</a>
        <p className="mbba-kicker landing-hero-kicker">Singapore's banana bread, put to a vote</p>
        <h1 className="landing-thesis">
          <span className="landing-line"><span>THE BEST LOAF</span></span>
          <span className="landing-line"><span>IN THE COUNTRY</span></span>
          <span className="landing-line"><span><em>gets decided</em> HERE</span></span>
        </h1>
        <p className="landing-hero-sub">One Reddit thread turned into a running tally of every bakery, café, and home kitchen selling banana bread in Singapore. No critics. No paid rankings. No secret panels. Just votes.</p>
        <button className="landing-btn landing-btn-primary" onClick={onEnter}>Enter the vote →</button>
      </header>

      <div className="landing-stripwrap">
        <div className="landing-strip">
          <div className="landing-stat"><b>{spots.length}</b><span>Spots in the running</span></div>
          <div className="landing-stat"><b>{CATS.length}</b><span>Categories, home baker to hotel</span></div>
          <div className="landing-stat"><b>Sun 12pm</b><span>Banana Bread of the Week, crowned</span></div>
        </div>
      </div>

      <section className="landing-section">
        <div className="landing-shell">
          <p className="mbba-kicker landing-reveal">How it actually works</p>
          <h2 className="landing-section-head landing-reveal">Tale of the tape.</h2>
          <p className="landing-section-sub landing-reveal">Three rounds, that's the whole game.</p>
          <div className="landing-rounds">
            <div className="landing-round-card landing-reveal">
              <p className="landing-round-tag">Round</p>
              <p className="landing-round-num">01</p>
              <h3>The matchup</h3>
              <p className="landing-round-body">Two spots step in: name, category, hood, and record. Win-loss, not star ratings. You tap a winner and the city sees the split.</p>
            </div>
            <div className="landing-round-card landing-reveal">
              <p className="landing-round-tag">Round</p>
              <p className="landing-round-num">02</p>
              <h3>The standings</h3>
              <p className="landing-round-body">Every vote updates the board on the spot. Rank, movement, and a reigning champ who has to defend the belt every single week.</p>
            </div>
            <div className="landing-round-card landing-reveal">
              <p className="landing-round-tag">Round</p>
              <p className="landing-round-num">03</p>
              <h3>The challengers</h3>
              <p className="landing-round-body">Know a spot we missed? Put them in the running in under a minute. They enter next week's card as a new challenger.</p>
            </div>
          </div>
        </div>
      </section>

      {champ && (
        <section className="landing-section">
          <div className="landing-shell">
            <div className="landing-champ landing-reveal">
              <span className="landing-belt" aria-hidden="true">🏆</span>
              <p className="mbba-kicker landing-champ-kicker">Reigning champ</p>
              <h3>{champ.name}</h3>
              <p className="landing-champ-body">{champ.cat} · {locText(champ)}. Leading the board on record alone. No sponsorship, no placement fee, same rules as a home kitchen with one oven.</p>
              <div className="landing-champ-stats">
                <div><div className="n">{champ.wins}–{champ.losses}</div><div className="l">Season record</div></div>
                <div><div className="n">#{champ.rank}</div><div className="l">Current rank</div></div>
                <div><div className="n">{spots.length}</div><div className="l">Spots contesting it</div></div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="landing-section landing-closer">
        <div className="landing-shell">
          <p className="mbba-kicker landing-reveal">Ready to call it?</p>
          <h2 className="landing-section-head landing-reveal">Pick a side. <em>The board updates instantly.</em></h2>
          <p className="landing-section-sub landing-reveal">No account, no download. Just tap a winner.</p>
          <button className="landing-btn landing-btn-dark landing-reveal" onClick={onEnter}>Start voting →</button>
        </div>
      </section>

      <footer className="landing-footer">
        <p>Community votes only. No critics, no paid spots, no secret panels.</p>
        <p>Make Banana Bread Again, an initiative by That Banana Bread Company.</p>
      </footer>
    </div>
  );
}
