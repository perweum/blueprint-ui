import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { MemoryNodeData } from '../types';

export function MemoryNode({ data, selected }: NodeProps) {
  const d = data as unknown as MemoryNodeData;
  return (
    <div className={`bp-node bp-node--memory ${selected ? 'bp-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="bp-node__header">
        <span className="bp-node__badge">MEMORY</span>
        <span className="bp-node__model">🧠 {d.operation}</span>
      </div>
      <div className="bp-node__label">{d.label}</div>
      <div className="bp-node__preview">{d.scope} scope{d.key ? ` · ${d.key}` : ''}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
