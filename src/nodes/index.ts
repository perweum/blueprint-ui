import { AgentNode } from './AgentNode';
import { CommentNode } from './CommentNode';
import { ConditionNode } from './ConditionNode';
import { FileNode } from './FileNode';
import { MemoryNode } from './MemoryNode';
import { OutputNode } from './OutputNode';
import { RouterNode } from './RouterNode';
import { ToolNode } from './ToolNode';
import { TransformNode } from './TransformNode';
import { TriggerNode } from './TriggerNode';

export const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  router: RouterNode,
  output: OutputNode,
  trigger: TriggerNode,
  condition: ConditionNode,
  transform: TransformNode,
  memory: MemoryNode,
  file: FileNode,
  comment: CommentNode,
};
