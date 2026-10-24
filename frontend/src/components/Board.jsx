import { Check, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';
import { Art } from './Art';
export function Board({
  routines,
  onToggle,
  onEdit,
  onMove,
  busy,
  future = false,
  compact = false,
}) {
  return (
    <div className={`board ${compact ? 'compact' : ''}`}>
      {routines.map((r, i) => (
        <div
          key={r._id}
          className={`routine-tile ${r.color} ${r.completed ? 'complete' : ''}`}
          style={{
            '--column': Math.floor(i / 3) % 2 ? 3 - (i % 3) : (i % 3) + 1,
            '--row': Math.floor(i / 3) + 1,
            '--connector':
              i === routines.length - 1
                ? "''"
                : i % 3 === 2
                  ? "'↓'"
                  : Math.floor(i / 3) % 2
                    ? "'←'"
                    : "'→'",
            '--connector-right': i % 3 === 2 ? '50%' : Math.floor(i / 3) % 2 ? 'auto' : '-17px',
            '--connector-left': i % 3 !== 2 && Math.floor(i / 3) % 2 ? '-17px' : 'auto',
            '--connector-top': i % 3 === 2 ? 'auto' : '48%',
            '--connector-bottom': i % 3 === 2 ? '-20px' : 'auto',
          }}
        >
          <div className="tile-top">
            <span>
              {String(i + 1).padStart(2, '0')}
              {r.time && ` / ${r.time}`}
            </span>
            {onEdit && (
              <button
                className="icon-button"
                aria-label={`Edit ${r.title}`}
                onClick={() => onEdit(r)}
              >
                <MoreHorizontal size={18} />
              </button>
            )}
          </div>
          <button
            className="tile-content"
            disabled={future || busy === r._id || !onToggle}
            aria-label={`${r.completed ? 'Undo' : 'Complete'} ${r.title}`}
            aria-pressed={!!r.completed}
            onClick={() => onToggle(r)}
          >
            <strong>{r.title}</strong>
            <Art kind={r.icon} />
            <span className="tile-check">{r.completed ? <Check size={16} /> : '+'}</span>
          </button>
          {onMove && (
            <div className="tile-order">
              <button
                className="icon-button"
                disabled={i === 0 || busy === r._id}
                aria-label={`Move ${r.title} earlier`}
                onClick={() => onMove(r, 'earlier')}
              >
                <ArrowUp size={14} />
              </button>
              <button
                className="icon-button"
                disabled={i === routines.length - 1 || busy === r._id}
                aria-label={`Move ${r.title} later`}
                onClick={() => onMove(r, 'later')}
              >
                <ArrowDown size={14} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
