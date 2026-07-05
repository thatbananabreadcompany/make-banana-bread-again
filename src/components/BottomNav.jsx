const TABS = [
  { key: "vote", label: "Vote" },
  { key: "rankings", label: "Rankings" },
  { key: "spots", label: "Spots" },
];

export default function BottomNav({ section, onSelect }) {
  return (
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
  );
}
