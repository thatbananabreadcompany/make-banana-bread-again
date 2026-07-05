const TABS = [
  { key: "vote", label: "Vote" },
  { key: "rankings", label: "Rankings" },
  { key: "spots", label: "Spots" },
];

export default function BottomNav({ section, onSelect, onOpenFeedback, onOpenAbout }) {
  return (
    <div className="mbba-navbar">
      <div className="mbba-navlinks">
        <button className="mbba-foot-link" onClick={onOpenFeedback}>Feedback</button>
        <button className="mbba-foot-link" onClick={onOpenAbout}>About</button>
      </div>
      <nav className="mbba-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`mbba-tab${section === t.key ? " active" : ""}`}
            onClick={() => onSelect(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
