import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { OutputNodeData } from '../types';

const DEST_ICONS: Record<string, string> = {
  telegram: '→',
  file: '▤',
  webhook: '⊕',
};

export function OutputNode({ data, selected }: NodeProps) {
  const d = data as unknown as OutputNodeData;
  const config = String(d.config || '').trim();
  const needsSetup =
    (d.destination === 'webhook' && !config) ||
    (d.destination === 'file' && !config);
  const emptyHint =
    d.destination === 'webhook' ? 'Set webhook URL — click to configure' :
    d.destination === 'file'    ? 'Set file path — click to configure' : '';
  return (
    <div className={`bp-node bp-node--output ${selected ? 'bp-node--selected' : ''}`}>
      {needsSetup && (
        <span className="bp-node__warning" title={`${emptyHint}`}>!</span>
      )}
      <Handle type="target" position={Position.Top} />
      <div className="bp-node__header">
        <span className="bp-node__badge">OUTPUT</span>
        <span className="bp-node__model">{DEST_ICONS[d.destination]} {d.destination}</span>
      </div>
      <div className="bp-node__label">{d.label}</div>
      {needsSetup && (
        <div className="bp-node__preview bp-node__preview--empty">{emptyHint}</div>
      )}
      {!needsSetup && config && (
        <div className="bp-node__preview">{config.slice(0, 50)}</div>
      )}
    </div>
  );
}
