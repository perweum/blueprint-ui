import { useEffect, useRef } from 'react';
import { useStore } from '../store';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onClose: () => void;
}

export function ContextMenu({ x, y, nodeId, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { nodes, addNode, deleteNode, selectNode, updateNodeData } = useStore();

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('click', handler);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') onClose(); });
    return () => window.removeEventListener('click', handler);
  }, [onClose]);

  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  function duplicate() {
    if (!node) return;
    addNode(node.data.kind as import('../types').NodeKind, {
      x: node.position.x + 40,
      y: node.position.y + 40,
    });
    // Copy data to the newly created node
    const { nodes: updatedNodes } = useStore.getState();
    const newNode = updatedNodes[updatedNodes.length - 1];
    if (newNode) {
      updateNodeData(newNode.id, { ...node.data });
    }
    onClose();
  }

  function remove() {
    deleteNode(nodeId);
    onClose();
  }

  function reset() {
    if (!node) return;
    const { kind } = node.data;
    const defaults: Record<string, unknown> = { kind };
    if (kind === 'agent') {
      Object.assign(defaults, { label: 'Agent', model: 'claude-sonnet-4-6', systemPrompt: '' });
    } else if (kind === 'tool') {
      Object.assign(defaults, { label: 'Tool', toolType: 'bash', config: '' });
    } else if (kind === 'comment') {
      Object.assign(defaults, { text: 'Comment', color: '#4b5563' });
    }
    updateNodeData(nodeId, defaults as Partial<import('../types').BlueprintNodeData>);
    selectNode(nodeId);
    onClose();
  }

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="context-menu__label">{String(node.data.kind).toUpperCase()}</div>
      <button className="context-menu__item" onClick={duplicate}>Duplicate</button>
      <button className="context-menu__item" onClick={reset}>Reset to defaults</button>
      <div className="context-menu__divider" />
      <button className="context-menu__item context-menu__item--danger" onClick={remove}>Delete</button>
    </div>
  );
}
