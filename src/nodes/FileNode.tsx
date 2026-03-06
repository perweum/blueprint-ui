import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FileNodeData } from '../types';

export function FileNode({ data, selected }: NodeProps) {
  const d = data as unknown as FileNodeData;
  return (
    <div className={`bp-node bp-node--file ${selected ? 'bp-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="bp-node__header">
        <span className="bp-node__badge">FILE</span>
        <span className="bp-node__model">{d.permissions === 'readwrite' ? '✏️' : '📖'} {d.permissions}</span>
      </div>
      <div className="bp-node__label">{d.label}</div>
      {d.path && <div className="bp-node__preview">{d.path}</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
