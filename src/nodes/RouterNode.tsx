import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { RouterNodeData } from '../types';

export function RouterNode({ data, selected }: NodeProps) {
  const d = data as unknown as RouterNodeData;
  const branches = d.branches ?? ['Branch A', 'Branch B'];

  return (
    <div className={`bp-node bp-node--router ${selected ? 'bp-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="bp-node__header">
        <span className="bp-node__badge">ROUTER</span>
      </div>
      <div className="bp-node__label">{d.label}</div>
      {d.routingPrompt && (
        <div className="bp-node__preview">{d.routingPrompt.slice(0, 60)}{d.routingPrompt.length > 60 ? '…' : ''}</div>
      )}
      <div className="bp-node__branches">
        {branches.map((branch, i) => (
          <div key={i} className="bp-node__branch">
            <span>{branch}</span>
            <Handle
              type="source"
              position={Position.Bottom}
              id={`branch-${i}`}
              style={{ left: `${((i + 1) / (branches.length + 1)) * 100}%`, bottom: -8 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
