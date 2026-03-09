import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { TriggerEntry, TriggerNodeData, TriggerType } from '../types';

const ICONS: Record<string, string> = { message: '◉', schedule: '◷', webhook: '⊕', manual: '▶' };

function needsConfig(type: TriggerType, config: string): boolean {
  return (type === 'schedule' || type === 'webhook') && !config.trim();
}

function triggerSummary(type: TriggerType, config: string): string {
  if (type === 'schedule') return config.trim() || '— set a schedule';
  if (type === 'message') return config.trim() ? `"${config.trim()}"` : 'all messages';
  if (type === 'webhook') return config.trim() || '— set a path';
  return 'manual';
}

export function TriggerNode({ data, selected }: NodeProps) {
  const d = data as unknown as TriggerNodeData;
  const additional: TriggerEntry[] = (d.additionalTriggers ?? []);
  const hasSetupIssue = needsConfig(d.triggerType, d.config) ||
    additional.some(t => needsConfig(t.triggerType, t.config));

  return (
    <div className={`bp-node bp-node--trigger ${selected ? 'bp-node--selected' : ''}`}>
      {hasSetupIssue && (
        <span className="bp-node__warning" title="This trigger needs configuration — click to set it up">!</span>
      )}
      <div className="bp-node__header">
        <span className="bp-node__badge">TRIGGER</span>
        <span className="bp-node__model">{ICONS[d.triggerType]} {d.triggerType}{additional.length > 0 ? ` +${additional.length}` : ''}</span>
      </div>
      <div className="bp-node__label">{d.label}</div>
      <div className="bp-node__preview">{triggerSummary(d.triggerType, d.config)}</div>
      {additional.map((t, i) => (
        <div key={i} className="bp-node__preview bp-node__preview--secondary">
          {ICONS[t.triggerType]} {triggerSummary(t.triggerType, t.config)}
        </div>
      ))}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
