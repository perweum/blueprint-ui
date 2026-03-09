import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore, type AssistantModel, type ChatMessage as ChatMessageType } from '../store';

const MODEL_OPTIONS: { value: AssistantModel; label: string }[] = [
  { value: 'auto',                      label: 'Auto' },
  { value: 'claude-sonnet-4-6',         label: 'Sonnet' },
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku' },
  { value: 'claude-opus-4-6',           label: 'Opus' },
];

// ── Message renderer ─────────────────────────────────────────────────────────

// Split text into readable prose and raw JSON blobs (which get collapsed)
function splitJsonBlobs(text: string): Array<{ kind: 'text' | 'json'; content: string }> {
  const result: Array<{ kind: 'text' | 'json'; content: string }> = [];
  // Detect runs of raw JSON-like content: long segments containing "op": or multiple "key": patterns
  const jsonBlobRe = /(\{[^{}]{0,30}"op"\s*:[^}]{0,200}\}(?:\s*,\s*\{[^{}]{0,30}"op"[^}]{0,200}\})*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = jsonBlobRe.exec(text)) !== null) {
    if (m.index > last) result.push({ kind: 'text', content: text.slice(last, m.index) });
    result.push({ kind: 'json', content: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) result.push({ kind: 'text', content: text.slice(last) });
  return result.length ? result : [{ kind: 'text', content: text }];
}

function JsonBlob({ content }: { content: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="chat-json-blob">
      <button className="chat-json-blob__toggle" onClick={() => setOpen(o => !o)}>
        {open ? '▾' : '▸'} Technical details
      </button>
      {open && <pre className="chat-json-blob__pre">{content}</pre>}
    </div>
  );
}

function renderMessage(text: string): React.ReactNode {
  const segments: React.ReactNode[] = [];
  let key = 0;
  let lastIndex = 0;

  // Split on fenced code blocks ```...```
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
  let m: RegExpExecArray | null;

  while ((m = codeBlockRe.exec(text)) !== null) {
    if (m.index > lastIndex) {
      const prose = text.slice(lastIndex, m.index);
      for (const part of splitJsonBlobs(prose)) {
        if (part.kind === 'json') {
          segments.push(<JsonBlob key={key++} content={part.content} />);
        } else {
          segments.push(<span key={key++}>{renderLines(part.content, key)}</span>);
          key += 100;
        }
      }
    }
    const lang = m[1] || 'bash';
    const code = m[2].trim();
    segments.push(
      <div key={key++} className="chat-code-block">
        <div className="chat-code-block__header">
          <span className="chat-code-block__lang">{lang}</span>
          <button
            className="chat-code-block__copy"
            onClick={() => navigator.clipboard.writeText(code)}
          >
            Copy
          </button>
        </div>
        <pre className="chat-code-block__pre">{code}</pre>
      </div>
    );
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < text.length) {
    const prose = text.slice(lastIndex);
    for (const part of splitJsonBlobs(prose)) {
      if (part.kind === 'json') {
        segments.push(<JsonBlob key={key++} content={part.content} />);
      } else {
        segments.push(<span key={key++}>{renderLines(part.content, key)}</span>);
        key += 100;
      }
    }
  }

  return <>{segments}</>;
}

function renderLines(text: string, baseKey: number): React.ReactNode[] {
  return text.split('\n').map((line, i) => {
    const isNumbered = /^\d+\.\s/.test(line);
    const isBullet   = /^[•\-\*]\s/.test(line) || /^\s+[•\-\*]\s/.test(line);
    const isHeader   = line.endsWith(':') && line.length < 80 && !line.startsWith(' ');

    return (
      <span
        key={baseKey + i}
        className={
          isNumbered ? 'chat-line chat-line--step' :
          isBullet   ? 'chat-line chat-line--bullet' :
          isHeader   ? 'chat-line chat-line--header' :
          'chat-line'
        }
      >
        {renderInline(line)}
        {'\n'}
      </span>
    );
  });
}

function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let last = 0, k = 0, m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[0].startsWith('**')) {
      out.push(<strong key={k++}>{m[2]}</strong>);
    } else {
      out.push(<code key={k++} className="chat-inline-code">{m[3]}</code>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ── Welcome screen ───────────────────────────────────────────────────────────

const EXAMPLES = [
  'Build a morning briefing bot',
  'Set up a Telegram channel',
  'Create a GitHub PR reviewer',
  'Add weather to my bot',
];

function WelcomeScreen({ onExample }: { onExample: (text: string) => void }) {
  return (
    <div className="chat-welcome">
      <div className="chat-welcome__logo">
        <span className="chat-welcome__mark">◈</span>
        <div className="chat-welcome__name">Claw Studio</div>
        <div className="chat-welcome__tagline">Visual AI Agent Builder</div>
      </div>

      <div className="chat-welcome__section">
        <div className="chat-welcome__section-label">I can help you</div>
        <ul className="chat-welcome__features">
          <li><span className="chat-welcome__dot" style={{ background: 'var(--accent-agent)' }} />Design agent pipelines on the canvas</li>
          <li><span className="chat-welcome__dot" style={{ background: '#2ca5e0' }} />Set up channels — Telegram, Slack, WhatsApp</li>
          <li><span className="chat-welcome__dot" style={{ background: 'var(--accent-tool)' }} />Install integrations and tools</li>
          <li><span className="chat-welcome__dot" style={{ background: 'var(--accent-output)' }} />Deploy and manage your bots</li>
        </ul>
      </div>

      <div className="chat-welcome__section">
        <div className="chat-welcome__section-label">Try asking</div>
        <div className="chat-welcome__examples">
          {EXAMPLES.map((ex) => (
            <button key={ex} className="chat-welcome__chip" onClick={() => onExample(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Memoized message row ─────────────────────────────────────────────────────

const ChatMessage = React.memo(function ChatMessage({
  msg, isChatLoading,
}: { msg: ChatMessageType; isChatLoading: boolean }) {
  const renderedContent = useMemo(() => renderMessage(msg.content), [msg.content]);
  return (
    <div className={`chat-msg chat-msg--${msg.role}`}>
      {msg.commandLog && msg.commandLog.length > 0 && (
        <div className="chat-msg__cmd-log">
          {msg.commandLog.map((entry, i) => (
            <div key={i} className={`cmd-entry cmd-entry--${entry.ok ? 'ok' : 'err'}`}>
              <div className="cmd-entry__header">
                <span className="cmd-entry__status">{entry.ok ? '✓' : '✗'}</span>
                <code className="cmd-entry__cmd">{entry.cmd}</code>
              </div>
              {entry.output && entry.output !== '(no output)' && (
                <pre className="cmd-entry__output">{entry.output}</pre>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="chat-msg__bubble">
        {msg.role === 'assistant' ? renderedContent : msg.content}
        {msg.opsApplied !== undefined && msg.opsApplied > 0 && (
          <div className="chat-msg__ops">
            ✦ Applied {msg.opsApplied} canvas operation{msg.opsApplied !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      {msg.pendingCommand && (
        <div className="chat-msg__confirm">
          <div className="chat-msg__confirm-label">Command requires approval:</div>
          <code className="chat-msg__confirm-cmd">{msg.pendingCommand.cmd}</code>
          <div className="chat-msg__confirm-actions">
            <button
              className="chat-msg__confirm-cancel"
              onClick={() => useStore.getState().cancelPendingCommand(msg.id)}
            >Cancel</button>
            <button
              className="chat-msg__confirm-approve"
              onClick={() => useStore.getState().confirmPendingCommand(msg.id)}
              disabled={isChatLoading}
            >Approve & run</button>
          </div>
        </div>
      )}
      {msg.options && msg.options.length > 0 && (
        <div className="chat-msg__options">
          {msg.options.map((opt) => (
            <button
              key={opt}
              className="chat-msg__option-btn"
              onClick={() => useStore.getState().sendChatMessage(opt)}
              disabled={isChatLoading}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ── Main component ───────────────────────────────────────────────────────────

interface ChatPanelProps {
  prefill?: string | null;
  onPrefillUsed?: () => void;
}

export function ChatPanel({ prefill, onPrefillUsed }: ChatPanelProps) {
  const chatMessages = useStore(s => s.chatMessages);
  const isChatLoading = useStore(s => s.isChatLoading);
  const chatLoadingCmd = useStore(s => s.chatLoadingCmd);
  const assistantModel = useStore(s => s.assistantModel);
  const { sendChatMessage, setAssistantModel } = useStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  useEffect(() => {
    if (prefill) {
      setInput(prefill);
      onPrefillUsed?.();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [prefill]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = (text = input) => {
    const t = text.trim();
    if (!t || isChatLoading) return;
    setInput('');
    sendChatMessage(t);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <span className="chat-panel__title">◈ Assistant</span>
        <select
          className="chat-panel__model-select"
          value={assistantModel}
          onChange={(e) => setAssistantModel(e.target.value as AssistantModel)}
          title="AI model for the assistant"
        >
          {MODEL_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {chatMessages.length > 0 && (
          <button
            className="chat-panel__clear"
            onClick={() => useStore.setState({ chatMessages: [] })}
          >
            Clear
          </button>
        )}
      </div>

      <div className="chat-panel__messages">
        {chatMessages.length === 0 && (
          <WelcomeScreen onExample={(ex) => handleSend(ex)} />
        )}

        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} isChatLoading={isChatLoading} />
        ))}

        {isChatLoading && (
          <div className="chat-msg chat-msg--assistant">
            <div className="chat-msg__bubble chat-msg__bubble--loading">
              {chatLoadingCmd ? (
                <span className="chat-msg__running-cmd">⚙ {chatLoadingCmd}…</span>
              ) : (
                <><span className="dot" /><span className="dot" /><span className="dot" /></>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-panel__input-row">
        <textarea
          ref={inputRef}
          className="chat-panel__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe a workflow or ask a question…"
          rows={2}
          disabled={isChatLoading}
        />
        <button
          className="chat-panel__send"
          onClick={() => handleSend()}
          disabled={!input.trim() || isChatLoading}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
