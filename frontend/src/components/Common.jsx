import { useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { Art } from './Art';
import { displayDate, shiftDate } from '../services/api';
export function Button({ children, className = '', ...props }) {
  return (
    <button className={`button ${className}`} {...props}>
      {children}
    </button>
  );
}
export function Empty({ title = 'A fresh start.', children, onAdd }) {
  return (
    <div className="empty">
      <Art kind="plant" />
      <h3>{title}</h3>
      <p>{children}</p>
      {onAdd && (
        <Button className="yellow" onClick={onAdd}>
          <Plus size={18} />
          Add your first one
        </Button>
      )}
    </div>
  );
}
export function ErrorBox({ error, retry }) {
  return (
    error && (
      <div className="error" role="alert">
        {error}
        {retry && <button onClick={retry}>Try again</button>}
      </div>
    )
  );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef(),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const node = ref.current;
    (node.querySelector('input,textarea,select') || node.querySelector('button'))?.focus();
    function keys(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      }
      if (e.key === 'Tab') {
        const list = [
          ...node.querySelectorAll(
            'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]',
          ),
        ];
        const first = list[0],
          last = list.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    node.addEventListener('keydown', keys);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      node.removeEventListener('keydown', keys);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="overlay">
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <header>
          <h2 id="dialog-title">{title}</h2>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function MonthPicker({ month, setMonth }) {
  return (
    <div className="month-picker">
      <button
        className="icon-button"
        aria-label="Previous month"
        onClick={() => setMonth(shiftDate(month + '-01', -1).slice(0, 7))}
      >
        <ArrowLeft size={18} />
      </button>
      <strong>{displayDate(month + '-01', { month: 'long', year: 'numeric' })}</strong>
      <button
        className="icon-button"
        aria-label="Next month"
        onClick={() => {
          const d = new Date(month + '-01T12:00:00');
          d.setMonth(d.getMonth() + 1);
          setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }}
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
