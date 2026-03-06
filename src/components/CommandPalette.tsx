import { useEffect, useRef, useState } from 'react';
import { NODE_KIND_META, type NodeKind } from '../types';
import { useStore } from '../store';

interface CommandPaletteProps {
  onClose: () => void;
}

const ALL_KINDS = Object.keys(NODE_KIND_META) as NodeKind[];

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNode } = useStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = ALL_KINDS.filter((k) => {
    const meta = NODE_KIND_META[k];
    const q = query.toLowerCase();
    return k.includes(q) || meta.label.toLowerCase().includes(q) || meta.description.toLowerCase().includes(q);
  });

  function pick(kind: NodeKind) {
    addNode(kind);
    onClose();
  }

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette__search">
          <span className="palette__search-icon">⌘</span>
          <input
            ref={inputRef}
            className="palette__input"
            placeholder="Add node... (type to filter)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filtered.length > 0) pick(filtered[0]);
            }}
          />
        </div>
        <div className="palette__list">
          {filtered.map((kind) => {
            const meta = NODE_KIND_META[kind];
            return (
              <button key={kind} className="palette__item" onClick={() => pick(kind)}>
                <span className="palette__dot" style={{ background: meta.color }} />
                <div className="palette__item-text">
                  <span className="palette__item-label">{meta.label}</span>
                  <span className="palette__item-desc">{meta.description}</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="palette__empty">No matching node types</div>
          )}
        </div>
      </div>
    </div>
  );
}
