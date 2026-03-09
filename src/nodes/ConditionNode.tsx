import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ConditionNodeData } from '../types';

export function ConditionNode({ data, selected }: NodeProps) {
  const d = data as unknown as ConditionNodeData;
  const needsValue = d.conditionType !== 'always_true' && !String(d.value || '').trim();
  return (
    <div className={`bp-node bp-node--condition ${selected ? 'bp-node--selected' : ''}`}>
      {needsValue && (
        <span className="bp-node__warning" title="Set a value to match against — click to configure">!</span>
      )}
      <Handle type="target" position={Position.Top} />
      <div className="bp-node__header">
        <span className="bp-node__badge">CONDITION</span>
        <span className="bp-node__model">◆</span>
      </div>
      <div className="bp-node__label">{d.label}</div>
      {!needsValue && d.value && (
        <div className="bp-node__preview">{d.conditionType}: "{d.value.slice(0, 40)}"</div>
      )}
      {d.conditionType === 'always_true' && (
        <div className="bp-node__preview">always passes through</div>
      )}
      <div className="bp-node__branches" style={{ marginTop: 8, paddingBottom: 10 }}>
        <div className="bp-node__branch" style={{ color: '#86efac' }}>True
          <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%', bottom: -8 }} />
        </div>
        <div className="bp-node__branch" style={{ color: '#fca5a5' }}>False
          <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%', bottom: -8 }} />
        </div>
      </div>
    </div>
  );
}
