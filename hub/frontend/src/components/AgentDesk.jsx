import { ClaudeCodeMascot, OpenClawMascot } from './Mascots.jsx';

const STATUS_LABEL = {
  idle:       { text: 'STANDBY',     color: '#475569' },
  thinking:   { text: 'THINKING...', color: '#ff6b35' },
  active:     { text: 'ACTIVE',      color: '#69ff47' },
  collaborating: { text: 'COLLABORATING', color: '#b388ff' },
};

export default function AgentDesk({ agent = 'claude_code', data = {}, messageCount = 0 }) {
  const isClaude = agent === 'claude_code';
  const accent   = isClaude ? '#4fc3f7' : '#69ff47';
  const dimBg    = isClaude ? '#070f16' : '#060f05';
  const status   = data.status || 'idle';
  const sl       = STATUS_LABEL[status] || STATUS_LABEL.idle;

  const label       = isClaude ? 'CLAUDE CODE' : 'OPENCLAW';
  const subtitle    = isClaude ? 'Claude Sonnet 4.6 · Anthropic' : 'OpenClaw 2026.2 · GLM-5 / Kimi';
  const lastSeen    = data.lastSeen ? new Date(data.lastSeen).toLocaleTimeString() : '—';
  const currentTask = data.currentTask ? data.currentTask.substring(0, 70) + (data.currentTask.length > 70 ? '…' : '') : null;

  return (
    <div
      className="relative flex flex-col items-center gap-3 rounded-2xl p-5 border"
      style={{ background: dimBg, borderColor: `${accent}30`, minWidth: 220 }}
    >
      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-8 h-8 rounded-tl-2xl overflow-hidden">
        <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accent}40, transparent)` }}/>
      </div>
      <div className="absolute top-0 right-0 w-8 h-8 rounded-tr-2xl overflow-hidden">
        <div className="w-full h-full" style={{ background: `linear-gradient(225deg, ${accent}40, transparent)` }}/>
      </div>

      {/* Mascot */}
      {isClaude
        ? <ClaudeCodeMascot size={90} animate={status !== 'idle'} status={status} />
        : <OpenClawMascot   size={90} animate={status !== 'idle'} status={status} />
      }

      {/* Name */}
      <div className="text-center">
        <div className="font-bold text-sm tracking-widest" style={{ color: accent }}>{label}</div>
        <div className="text-xs text-text-dim mt-0.5">{subtitle}</div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
           style={{ background: `${sl.color}18`, border: `1px solid ${sl.color}50`, color: sl.color }}>
        <div className={`w-1.5 h-1.5 rounded-full ${status !== 'idle' ? 'animate-pulse' : ''}`}
             style={{ background: sl.color }} />
        {sl.text}
      </div>

      {/* Stats */}
      <div className="w-full grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg p-2" style={{ background: `${accent}10` }}>
          <div className="text-lg font-bold" style={{ color: accent }}>{messageCount}</div>
          <div className="text-xs text-text-dim">messages</div>
        </div>
        <div className="rounded-lg p-2" style={{ background: `${accent}10` }}>
          <div className="text-xs font-bold" style={{ color: accent }}>{lastSeen}</div>
          <div className="text-xs text-text-dim">last active</div>
        </div>
      </div>

      {/* Current task */}
      {currentTask && (
        <div className="w-full rounded-lg p-2.5 text-xs" style={{ background: '#0a0a16', border: `1px solid ${accent}20` }}>
          <div className="text-text-dim text-xs mb-1 uppercase tracking-wider">current task</div>
          <div className="text-text-primary leading-relaxed">{currentTask}</div>
        </div>
      )}

      {/* Thinking animation */}
      {status === 'thinking' && (
        <div className="flex gap-1 items-center">
          <div className="w-1.5 h-1.5 rounded-full dot-bounce" style={{ background: accent }} />
          <div className="w-1.5 h-1.5 rounded-full dot-bounce" style={{ background: accent }} />
          <div className="w-1.5 h-1.5 rounded-full dot-bounce" style={{ background: accent }} />
        </div>
      )}
    </div>
  );
}
