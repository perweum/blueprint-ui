import { useCallback, useEffect, useRef, useState } from 'react';

interface StatusTask {
  id: string;
  label: string;
  schedule: string;
  nextRun: string | null;
  lastRun: string | null;
  lastStatus: string | null;
  lastResult: string | null;
}

interface StatusGroup {
  folder: string;
  name: string;
  jid: string;
  triggerType: 'message' | 'scheduled' | 'none';
  outputJid: string | null;
  tasks: StatusTask[];
  warnings: string[];
}

interface StatusPanelProps {
  onClose: () => void;
}

function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);
  const weekEnd = new Date(todayStart.getTime() + 7 * 86400000);

  const hhmm = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  if (date >= todayStart && date < tomorrowStart) {
    return `today ${hhmm}`;
  }
  if (date >= tomorrowStart && date < new Date(tomorrowStart.getTime() + 86400000)) {
    return `tomorrow ${hhmm}`;
  }
  if (date >= tomorrowStart && date < weekEnd) {
    const day = date.toLocaleDateString('en-GB', { weekday: 'short' });
    return `${day} ${hhmm}`;
  }
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

function TriggerBadge({ type }: { type: StatusGroup['triggerType'] }) {
  if (type === 'message') {
    return <span className="status-badge status-badge--message">📨 Message</span>;
  }
  if (type === 'scheduled') {
    return <span className="status-badge status-badge--scheduled">🕐 Scheduled</span>;
  }
  return <span className="status-badge status-badge--none">○ No trigger</span>;
}

function GroupCard({ group }: { group: StatusGroup }) {
  const [runState, setRunState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  function toggleTask(id: string) {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleRunNow() {
    setRunState('running');
    try {
      const res = await fetch(`/api/groups/${group.folder}/run`, { method: 'POST' });
      if (res.ok) {
        setRunState('done');
      } else {
        setRunState('error');
      }
    } catch {
      setRunState('error');
    }
    setTimeout(() => setRunState('idle'), 3000);
  }

  const runLabel =
    runState === 'running' ? 'Running…' :
    runState === 'done' ? '✓ Triggered' :
    runState === 'error' ? '✕ Failed' :
    '▶ Run now';

  return (
    <div className="status-group">
      <div className="status-group__name">{group.name || group.folder}</div>
      <div className="status-group__meta">
        <TriggerBadge type={group.triggerType} />
        <span className="status-group__folder">{group.folder}</span>
        {group.outputJid && (
          <span className="status-group__output">→ {group.outputJid}</span>
        )}
      </div>

      {(group.tasks ?? []).map((task) => {
        const expanded = expandedTasks.has(task.id);
        return (
          <div key={task.id} className="status-task">
            <div className="status-task__schedule">{task.schedule}</div>
            <div className="status-task__times">
              <span title="Next run">⏭ {formatRelativeTime(task.nextRun)}</span>
              {task.lastRun && (
                <span
                  className={`status-task__last-status ${task.lastStatus === 'success' ? 'status-task__last-status--ok' : task.lastStatus === 'error' ? 'status-task__last-status--err' : ''}`}
                  title="Last run"
                >
                  {task.lastStatus === 'success' ? '✓' : task.lastStatus === 'error' ? '✕' : '○'}{' '}
                  {formatRelativeTime(task.lastRun)}
                </span>
              )}
              {task.lastResult && (
                <button
                  className="status-task__expand-btn"
                  onClick={() => toggleTask(task.id)}
                  title={expanded ? 'Hide result' : 'Show last result'}
                >
                  {expanded ? '▲' : '▼'}
                </button>
              )}
            </div>
            <div className="status-task__label">{task.label}</div>
            {expanded && task.lastResult && (
              <div className="status-task__result">{task.lastResult}</div>
            )}
          </div>
        );
      })}

      {(group.warnings ?? []).map((w, i) => (
        <div key={i} className="status-warn">⚠ {w}</div>
      ))}

      {(group.tasks ?? []).length > 0 && (
        <button
          className={`status-run-btn ${runState !== 'idle' ? `status-run-btn--${runState}` : ''}`}
          disabled={runState === 'running'}
          onClick={handleRunNow}
        >
          {runLabel}
        </button>
      )}
    </div>
  );
}

export function StatusPanel({ onClose }: StatusPanelProps) {
  const [groups, setGroups] = useState<StatusGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { groups: StatusGroup[] };
      setGroups(data.groups);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
    intervalRef.current = setInterval(() => void fetchStatus(), 20000);
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [fetchStatus]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="status-panel" onClick={onClose}>
      <div className="status-panel__modal" onClick={(e) => e.stopPropagation()}>
        <div className="status-panel__header">
          <span className="status-panel__title">◉ System Status</span>
          <div className="status-panel__header-actions">
            {lastRefresh && (
              <span className="status-panel__refresh-time">
                Updated {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              className="status-panel__refresh-btn"
              onClick={() => void fetchStatus()}
              title="Refresh now"
            >
              ↺ Refresh
            </button>
            <button className="status-panel__close-btn" onClick={onClose} title="Close">✕</button>
          </div>
        </div>

        <div className="status-panel__body">
          {loading && <div className="status-panel__loading">Loading…</div>}
          {error && <div className="status-panel__error">Error: {error}</div>}
          {!loading && !error && groups.length === 0 && (
            <div className="status-panel__empty">No registered groups found.</div>
          )}
          {!loading && groups.length > 0 && (
            <div className="status-panel__grid">
              {groups.map((g) => (
                <GroupCard key={g.folder} group={g} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
