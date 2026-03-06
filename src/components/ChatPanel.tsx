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
            <div className="chat-msg__bubble">
              {msg.content}
              {msg.opsApplied !== undefined && msg.opsApplied > 0 && (
                <div className="chat-msg__ops">
                  ✦ Applied {msg.opsApplied} canvas operation{msg.opsApplied !== 1 ? 's' : ''}
                </div>
              )}
            </div>
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
