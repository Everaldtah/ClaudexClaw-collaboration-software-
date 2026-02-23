import { useEffect, useRef, useState } from 'react';

function MessageBubble({ msg, index }) {
  const isFromClaude = msg.from === 'claude_code';
  const accent  = isFromClaude ? '#4fc3f7' : '#69ff47';
  const dimBg   = isFromClaude ? '#071520' : '#061508';
  const align   = isFromClaude ? 'items-start' : 'items-end';
  const time    = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
  const label   = isFromClaude ? 'Claude Code' : 'OpenClaw';
  const taskId  = msg.task_id || '';

  return (
    <div
      className={`flex flex-col ${align} gap-1 animate-[messageIn_0.35s_ease-out]`}
      style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
    >
      <div className="flex items-center gap-2 px-1">
        <div className="text-xs font-bold tracking-wider" style={{ color: accent }}>{label}</div>
        <div className="text-xs text-text-dim">{time}</div>
        {taskId && <div className="text-xs text-text-dim opacity-50">#{taskId.split('_').pop()}</div>}
      </div>
      <div
        className="max-w-xs rounded-2xl px-4 py-3 text-xs leading-relaxed text-text-primary"
        style={{ background: dimBg, border: `1px solid ${accent}25`, borderRadius: isFromClaude ? '4px 16px 16px 16px' : '16px 4px 16px 16px', wordBreak: 'break-word' }}
      >
        {msg.message}
      </div>
    </div>
  );
}

export default function CollabChannel({ messages = [], sessionId = null }) {
  const bottomRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const displayed = sessionId
    ? messages.filter(m => m.session_id === sessionId)
    : messages.slice(-60);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayed.length, autoScroll]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setAutoScroll(nearBottom);
  };

  // Flow lines between agents when there's a recent message
  const lastMsg = messages[messages.length - 1];
  const isFlowing = lastMsg && (Date.now() - new Date(lastMsg.timestamp).getTime()) < 8000;
  const flowDir = lastMsg?.from === 'claude_code' ? 'right' : 'left';

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-hub-border">
        <div className="text-xs font-bold tracking-widest text-accent-purple">COLLABORATION CHANNEL</div>
        <div className="flex items-center gap-1.5 text-xs text-text-dim">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
          {displayed.length} messages
        </div>
      </div>

      {/* Flow indicator */}
      {isFlowing && (
        <div className="relative h-6 overflow-hidden flex items-center mx-4 my-1">
          <div
            className={`absolute h-0.5 w-1/3 rounded-full ${flowDir === 'right' ? 'flow-right' : 'flow-left'}`}
            style={{ background: flowDir === 'right' ? 'linear-gradient(90deg, #4fc3f7, transparent)' : 'linear-gradient(270deg, #69ff47, transparent)' }}
          />
          <div className="w-full h-px bg-hub-border" />
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3"
        onScroll={handleScroll}
        style={{ minHeight: 0 }}
      >
        {displayed.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-dim text-xs gap-3">
            <div className="text-4xl opacity-30">💬</div>
            <div className="text-center">
              <div className="font-bold mb-1">No messages yet</div>
              <div>Collaboration messages will appear here in real-time</div>
            </div>
          </div>
        ) : (
          displayed.map((msg, i) => (
            <MessageBubble key={`${msg.task_id}-${i}`} msg={msg} index={i} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Auto-scroll button */}
      {!autoScroll && (
        <button
          onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: '#b388ff', color: '#08080f' }}
        >
          ↓ Latest
        </button>
      )}
    </div>
  );
}
