import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { AgentNodeData } from '../types';

const MODEL_LABELS: Record<string, string> = {
  'claude-sonnet-4-6': 'Sonnet',
  'claude-haiku-4-5-20251001': 'Haiku',
  'claude-opus-4-6': 'Opus',
};

export function AgentNode({ data, selected }: NodeProps) {
  const d = data as unknown as AgentNodeData;
  const needsSetup = !d.systemPrompt || d.systemPrompt.trim().length < 10;
  return (
    <div className={`bp-node bp-node--agent ${selected ? 'bp-node--selected' : ''}`}>
      {needsSetup && (
        <span className="bp-node__warning" title="This node needs a system prompt — click to configure">!</span>
      )}
      <Handle type="target" position={Position.Top} />
      <div className="bp-node__header">
        <span className="bp-node__badge">AGENT</span>
        <span className="bp-node__model">{MODEL_LABELS[d.model] ?? d.model}</span>
      </div>
      <div className="bp-node__label">{d.label}</div>
      {d.systemPrompt && (
        <div className="bp-node__preview">{d.systemPrompt.slice(0, 60)}{d.systemPrompt.length > 60 ? '…' : ''}</div>
      )}
      {!d.systemPrompt && (
        <div className="bp-node__preview bp-node__preview--empty">Click to add instructions…</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
