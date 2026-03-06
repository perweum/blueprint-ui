import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';

export function ChatPanel() {
  const { chatMessages, isChatLoading, sendChatMessage } = useStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isChatLoading) return;
    setInput('');
    sendChatMessage(text);
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
          <div className="chat-panel__empty">
            Describe a workflow and I'll build it on the canvas.
            <br />
            <span className="chat-panel__example">
              Try: "Create a research pipeline with a web search tool feeding into a summarizer agent"
            </span>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
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
              {msg.content}
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
                  >
                    Cancel
                  </button>
                  <button
                    className="chat-msg__confirm-approve"
                    onClick={() => useStore.getState().confirmPendingCommand(msg.id)}
                    disabled={isChatLoading}
                  >
                    Approve & run
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isChatLoading && (
          <div className="chat-msg chat-msg--assistant">
            <div className="chat-msg__bubble chat-msg__bubble--loading">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-panel__input-row">
        <textarea
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
          onClick={handleSend}
          disabled={!input.trim() || isChatLoading}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
