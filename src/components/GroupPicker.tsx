import { useEffect, useState } from 'react';
import { useStore, type GroupInfo } from '../store';

interface GroupPickerProps {
  onClose: () => void;
}

export function GroupPicker({ onClose }: GroupPickerProps) {
  const { currentGroupFolder, openGroup, closeGroup } = useStore();
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/groups')
      .then((r) => r.json())
      .then((d) => setGroups(d.groups ?? []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  function pick(folder: string) {
    openGroup(folder);
    onClose();
  }

  function handleClose() {
    closeGroup();
    onClose();
  }

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette group-picker" onClick={(e) => e.stopPropagation()}>
        <div className="palette__search" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Open Group</span>
          {currentGroupFolder && (
            <button className="group-picker__close-btn" onClick={handleClose}>
              Close current
            </button>
          )}
        </div>

        <div className="palette__list">
          {loading && (
            <div className="palette__empty">Loading groups…</div>
          )}
          {error && (
            <div className="palette__empty" style={{ color: 'var(--danger)' }}>
              Error: {error}
            </div>
          )}
          {!loading && !error && groups.length === 0 && (
            <div className="palette__empty">No groups found in nanoclaw/groups/</div>
          )}
          {groups.map((g) => (
            <button
              key={g.folder}
              className={`palette__item group-picker__item ${g.folder === currentGroupFolder ? 'group-picker__item--active' : ''}`}
              onClick={() => pick(g.folder)}
            >
              <span className="palette__dot" style={{ background: g.folder === currentGroupFolder ? 'var(--accent-agent)' : 'var(--text-muted)' }} />
              <div className="palette__item-text">
                <span className="palette__item-label">{g.folder}</span>
                <span className="palette__item-desc">
                  {g.hasClaude ? 'CLAUDE.md' : 'no CLAUDE.md'}
                  {g.hasBlueprint ? ' · blueprint saved' : ' · no blueprint yet'}
                </span>
              </div>
              {g.folder === currentGroupFolder && (
                <span className="group-picker__current-badge">current</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
