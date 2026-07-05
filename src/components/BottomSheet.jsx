export default function BottomSheet({ children, onClose, ariaLabel }) {
  return (
    <>
      <div className="mbba-scrim" onClick={onClose} />
      <div className="mbba-sheet" role="dialog" aria-label={ariaLabel}>
        <div className="mbba-sheet-handle" />
        {children}
      </div>
    </>
  );
}
