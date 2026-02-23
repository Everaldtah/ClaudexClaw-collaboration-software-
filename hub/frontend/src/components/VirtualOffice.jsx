import AgentDesk from './AgentDesk.jsx';
import CollabChannel from './CollabChannel.jsx';

export default function VirtualOffice({ agents, messages, sessions, selectedSession, onSelectSession }) {
  const claudeData  = agents?.claude_code || {};
  const clawData    = agents?.clawbot || {};
  const claudeMsgs  = messages.filter(m => m.from === 'claude_code' || m.to === 'claude_code').length;
  const clawMsgs    = messages.filter(m => m.from === 'clawbot' || m.to === 'clawbot').length;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Office floor */}
      <div className="flex gap-4 items-start">

        {/* Claude Code desk */}
        <AgentDesk agent="claude_code" data={claudeData} messageCount={claudeMsgs} />

        {/* Central collaboration channel */}
        <div
          className="flex-1 rounded-2xl border overflow-hidden"
          style={{ background: '#0a0a18', borderColor: '#b388ff30', minHeight: 400 }}
        >
          <CollabChannel messages={messages} sessionId={selectedSession} />
        </div>

        {/* OpenClaw desk */}
        <AgentDesk agent="clawbot" data={clawData} messageCount={clawMsgs} />
      </div>

      {/* Session strip */}
      {sessions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold tracking-widest text-text-dim px-1">SESSIONS</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => onSelectSession(null)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
              style={!selectedSession
                ? { background: '#b388ff20', borderColor: '#b388ff', color: '#b388ff' }
                : { background: 'transparent', borderColor: '#1e1e3a', color: '#64748b' }
              }
            >
              All
            </button>
            {sessions.slice(0, 10).map(s => (
              <button
                key={s.id}
                onClick={() => onSelectSession(s.id === selectedSession ? null : s.id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-all"
                style={s.id === selectedSession
                  ? { background: '#b388ff20', borderColor: '#b388ff', color: '#b388ff' }
                  : { background: '#0d0d1a', borderColor: '#1e1e3a', color: '#64748b' }
                }
              >
                <span className="font-bold">{s.count}</span>
                <span className="ml-1 opacity-60">{s.id?.split('_').slice(0,2).join('_') || s.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
