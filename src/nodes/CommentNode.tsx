import type { NodeProps } from '@xyflow/react';
import type { CommentNodeData } from '../types';

export function CommentNode({ data, selected }: NodeProps) {
  const d = data as unknown as CommentNodeData;
  return (
    <div
      className={`bp-node bp-node--comment ${selected ? 'bp-node--selected' : ''}`}
      style={{ borderColor: d.color, minWidth: 160 }}
    >
      <div className="bp-node__comment-text">{d.text || 'Double-click to edit'}</div>
    </div>
  );
}
