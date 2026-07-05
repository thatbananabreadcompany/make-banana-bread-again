export default function Ticker({ items }) {
  const line = items.filter(Boolean);
  if (!line.length) return null;
  const doubled = [...line, ...line];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i}>
            {item}
            <span className="dot"> ●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
