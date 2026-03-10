/**
 * Shared schema for Blueprint AI operations.
 * Imported by both the Vite server plugin (Node.js) and the React app (browser).
 */
import { z } from 'zod';

export const AddNodeOp = z.object({
  op: z.literal('addNode'),
  tempId: z.string().describe('Temporary ID used to reference this node in connect ops'),
  kind: z.enum(['agent', 'tool', 'router', 'output', 'trigger', 'condition', 'transform', 'memory', 'file', 'comment', 'swimlane']),
  label: z.string(),
  // agent
  model: z.enum(['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001']).optional(),
  systemPrompt: z.string().optional(),
  // tool
  toolType: z.enum(['bash', 'search', 'mcp']).optional(),
  config: z.string().optional(),
  // router
  routingPrompt: z.string().optional(),
  branches: z.array(z.string()).optional(),
  // output
  destination: z.enum(['telegram', 'file', 'webhook', 'agent_handoff']).optional(),
  targetFolder: z.string().optional(),
  handoffMessage: z.string().optional(),
  // trigger
  triggerType: z.enum(['message', 'schedule', 'webhook', 'manual']).optional(),
  // condition
  conditionType: z.enum(['contains', 'regex', 'equals', 'always_true']).optional(),
  value: z.string().optional(),
  // transform
  transformType: z.enum(['template', 'truncate', 'json_wrap', 'extract']).optional(),
  // memory
  operation: z.enum(['read', 'write', 'both']).optional(),
  scope: z.enum(['group', 'global']).optional(),
  key: z.string().optional(),
  // file
  path: z.string().optional(),
  permissions: z.enum(['read', 'readwrite']).optional(),
  // comment
  text: z.string().optional(),
  color: z.string().optional(),
  // swimlane
  groupFolder: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  // position
  x: z.number(),
  y: z.number(),
});

export const ConnectOp = z.object({
  op: z.literal('connect'),
  from: z.string().describe('tempId or existing node ID'),
  to: z.string().describe('tempId or existing node ID'),
  handle: z.string().optional().describe('Source handle for router/condition branches, e.g. "branch-0", "true", "false"'),
});

export const ClearOp = z.object({ op: z.literal('clear') });

export const UpdateNodeOp = z.object({
  op: z.literal('updateNode'),
  id: z.string().describe('Existing node ID to update'),
  data: z.record(z.unknown()),
});

export const DeleteNodeOp = z.object({
  op: z.literal('deleteNode'),
  id: z.string(),
});

export const Operation = z.discriminatedUnion('op', [
  ClearOp,
  AddNodeOp,
  ConnectOp,
  UpdateNodeOp,
  DeleteNodeOp,
]);

export const BlueprintResponse = z.object({
  message: z.string().describe('Conversational response shown in the chat'),
  operations: z.array(Operation).describe('Canvas operations to apply. Empty array if no changes needed.'),
});

export type Operation = z.infer<typeof Operation>;
export type BlueprintResponse = z.infer<typeof BlueprintResponse>;
