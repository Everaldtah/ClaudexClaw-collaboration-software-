import { useState } from 'react';
import { useWebSocket } from './hooks/useWebSocket.js';
import VirtualOffice from './components/VirtualOffice.jsx';
import { ClaudeCodeMascot, OpenClawMascot } from './components/Mascots.jsx';

function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
         style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <span className="font-bold" style={{ color }}>{value}</span>
      <span className="text-text-dim">{label}</span>
    </div>
  );
}

function Ticker({ messages }) {
  const recent = messages.slice(-20).reverse();
  if (!recent.length) return null;

  return (
    <div className="border-t border-hub-border bg-hub-dark px-4 py-2 overflow-hidden">
      <div className="flex items-center gap-3 text-xs">
        <span className="text-accent-orange font-bold tracking-wider flex-shrink-0">LIVE ●</span>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-8 animate-marquee whitespace-nowrap" style={{ animation: 'marquee 30s linear infinite' }}>
            {[...recent, ...recent].map((m, i) => (
              <span key={i} className="flex-shrink-0">
                <span style={{ color: m.from === 'claude_code' ? '#4fc3f7' : '#69ff47' }}>
                  {m.from === 'claude_code' ? 'Claude Code' : 'OpenClaw'}
                </span>
                <span className="text-text-dim mx-1">→</span>
                <span style={{ color: m.to === 'claude_code' ? '#4fc3f7' : '#69ff47' }}>
                  {m.to === 'claude_code' ? 'Claude Code' : 'OpenClaw'}
                </span>
                <span className="text-text-dim ml-2">{m.message?.substring(0, 60)}{m.message?.length > 60 ? '…' : ''}</span>
                <span className="text-hub-border mx-4">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
      `}</style>
    </div>
  );
}

export default function App() {
  const { connected, messages, sessions, agents, stats } = useWebSocket();
  const [selectedSession, setSelectedSession] = useState(null);
  const [view, setView] = useState('office'); // office | log

  const totalMsgs    = stats.totalMessages || messages.length;
  const totalSess    = stats.totalSessions || sessions.length;
  const claudeStatus = agents.claude_code?.status || 'idle';
  const clawStatus   = agents.clawbot?.status || 'idle';
  const bothActive   = claudeStatus !== 'idle' && clawStatus !== 'idle';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#08080f' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-hub-border" style={{ background: '#0a0a14' }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <ClaudeCodeMascot size={32} status={claudeStatus} />
            <div className="text-text-dim text-sm mx-1">×</div>
            <OpenClawMascot size={32} status={clawStatus} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-wider text-text-primary">ClaudeXClaw</div>
            <div className="text-xs text-text-dim">Collaboration Hub</div>
          </div>
          {bothActive && (
            <div className="px-2 py-0.5 rounded text-xs font-bold text-hub-dark" style={{ background: '#b388ff' }}>
              COLLABORATING
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <StatPill label="messages" value={totalMsgs} color="#b388ff" />
          <StatPill label="sessions" value={totalSess} color="#4fc3f7" />
          <StatPill label="claude" value={claudeStatus.toUpperCase()} color="#4fc3f7" />
          <StatPill label="clawbot" value={clawStatus.toUpperCase()} color="#69ff47" />
        </div>

        {/* Connection + nav */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {['office', 'log'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1 rounded text-xs font-bold transition-all"
                style={view === v
                  ? { background: '#b388ff', color: '#08080f' }
                  : { background: '#111122', color: '#64748b' }
                }
              >
                {v === 'office' ? '🏢 Office' : '📋 Log'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-claw-green animate-pulse' : 'bg-red-500'}`} />
            <span className="text-text-dim">{connected ? 'live' : 'reconnecting…'}</span>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col p-4 gap-4" style={{ minHeight: 0 }}>

        {view === 'office' ? (
          <VirtualOffice
            agents={agents}
            messages={messages}
            sessions={sessions}
            selectedSession={selectedSession}
            onSelectSession={setSelectedSession}
          />
        ) : (
          /* Full message log */
          <div className="flex-1 rounded-2xl border overflow-hidden flex flex-col" style={{ background: '#0a0a18', borderColor: '#1e1e3a' }}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-hub-border">
              <div className="text-xs font-bold tracking-widest text-text-dim">FULL COLLABORATION LOG</div>
              <div className="text-xs text-text-dim">{messages.length} total messages</div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ background: '#0d0d1a' }}>
                  <tr className="text-text-dim border-b border-hub-border">
                    <th className="text-left px-4 py-2 font-normal">TIME</th>
                    <th className="text-left px-4 py-2 font-normal">FROM</th>
                    <th className="text-left px-4 py-2 font-normal">TO</th>
                    <th className="text-left px-4 py-2 font-normal">SESSION</th>
                    <th className="text-left px-4 py-2 font-normal">MESSAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {[...messages].reverse().map((m, i) => {
                    const isFromClaude = m.from === 'claude_code';
                    return (
                      <tr key={i} className="border-b border-hub-border hover:bg-hub-card transition-colors">
                        <td className="px-4 py-2 text-text-dim whitespace-nowrap">
                          {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : '—'}
                        </td>
                        <td className="px-4 py-2 font-bold whitespace-nowrap" style={{ color: isFromClaude ? '#4fc3f7' : '#69ff47' }}>
                          {isFromClaude ? 'Claude Code' : 'OpenClaw'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap" style={{ color: m.to === 'claude_code' ? '#4fc3f7' : '#69ff47' }}>
                          {m.to === 'claude_code' ? 'Claude Code' : 'OpenClaw'}
                        </td>
                        <td className="px-4 py-2 text-text-dim font-mono">
                          {m.session_id?.split('_').slice(0,2).join('_') || '—'}
                        </td>
                        <td className="px-4 py-2 text-text-primary max-w-lg truncate">
                          {m.message}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Ticker ─────────────────────────────────────────────────────── */}
      <Ticker messages={messages} />

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="px-6 py-2 border-t border-hub-border flex items-center justify-between text-xs text-text-dim" style={{ background: '#0a0a14' }}>
        <span>ClaudeXClaw Collaboration Hub · Claude Code ↔ OpenClaw</span>
        <span>WS: {connected ? '🟢 connected' : '🔴 disconnected'}</span>
      </footer>
    </div>
  );
}
