export function Modal({ onClose, children, maxWidth = 440 }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal glass"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}
