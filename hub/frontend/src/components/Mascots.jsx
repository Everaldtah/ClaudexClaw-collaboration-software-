// Official mascots for ClaudeXClaw Hub
// OpenClaw: the official fat, round, cute red lobster (from their favicon SVG)
// Claude Code: the official coral/orange cute Claude mascot (from Claude Code CLI)

export function OpenClawMascot({ size = 80, animate = false, status = 'idle' }) {
  const glowColor = status === 'thinking' ? '#ff6b35' : status === 'active' ? '#ff4d4d' : '#991b1b';

  return (
    <div
      className={`relative flex items-center justify-center ${animate ? 'animate-float' : ''}`}
      style={{ width: size, height: size }}
    >
      {/* Status glow ring */}
      {status !== 'idle' && (
        <>
          <div className="radar-pulse absolute inset-0 rounded-full" style={{ background: `${glowColor}30`, border: `2px solid ${glowColor}60` }} />
          <div className="radar-pulse absolute inset-0 rounded-full" style={{ background: `${glowColor}20`, border: `2px solid ${glowColor}40`, animationDelay: '0.6s' }} />
        </>
      )}

      {/* Use the official OpenClaw PNG mascot with SVG fallback */}
      <div className="relative rounded-full overflow-hidden flex items-center justify-center"
           style={{ width: size, height: size, background: 'radial-gradient(circle at 40% 35%, #ff6b4a, #8b1a1a)' }}>
        <img
          src="/openclaw-mascot.png"
          alt="OpenClaw"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        {/* SVG fallback — the official OpenClaw lobster, enhanced fat+round */}
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'none', width: '90%', height: '90%' }}
        >
          <defs>
            <radialGradient id="oc-body" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ff6b4a"/>
              <stop offset="60%" stopColor="#e02020"/>
              <stop offset="100%" stopColor="#8b1a1a"/>
            </radialGradient>
            <radialGradient id="oc-belly" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff8c6a" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Left big claw */}
          <ellipse cx="16" cy="55" rx="14" ry="11" fill="url(#oc-body)"/>
          <ellipse cx="10" cy="50" rx="8" ry="6" fill="#c01818"/>
          <ellipse cx="10" cy="62" rx="7" ry="5" fill="#c01818"/>

          {/* Right big claw */}
          <ellipse cx="104" cy="55" rx="14" ry="11" fill="url(#oc-body)"/>
          <ellipse cx="110" cy="50" rx="8" ry="6" fill="#c01818"/>
          <ellipse cx="110" cy="62" rx="7" ry="5" fill="#c01818"/>

          {/* Main round fat body */}
          <ellipse cx="60" cy="62" rx="42" ry="46" fill="url(#oc-body)"/>
          {/* Belly shine */}
          <ellipse cx="60" cy="68" rx="28" ry="32" fill="url(#oc-belly)"/>

          {/* Head bump */}
          <ellipse cx="60" cy="28" rx="30" ry="22" fill="url(#oc-body)"/>

          {/* Little legs */}
          <path d="M30 80 Q22 90 18 98" stroke="#c01818" strokeWidth="5" strokeLinecap="round"/>
          <path d="M40 88 Q34 98 32 106" stroke="#c01818" strokeWidth="5" strokeLinecap="round"/>
          <path d="M90 80 Q98 90 102 98" stroke="#c01818" strokeWidth="5" strokeLinecap="round"/>
          <path d="M80 88 Q86 98 88 106" stroke="#c01818" strokeWidth="5" strokeLinecap="round"/>

          {/* Antennae */}
          <path d="M47 14 Q38 4 30 6" stroke="#ff6b4a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M73 14 Q82 4 90 6" stroke="#ff6b4a" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="30" cy="6" r="3" fill="#ff9966"/>
          <circle cx="90" cy="6" r="3" fill="#ff9966"/>

          {/* Eyes — big cute glossy */}
          <ellipse cx="46" cy="32" rx="9" ry="9.5" fill="#0a0a16"/>
          <ellipse cx="74" cy="32" rx="9" ry="9.5" fill="#0a0a16"/>
          <circle cx="47" cy="30" r="4" fill="#00e5cc"/>
          <circle cx="75" cy="30" r="4" fill="#00e5cc"/>
          <circle cx="49" cy="28" r="1.5" fill="white" opacity="0.9"/>
          <circle cx="77" cy="28" r="1.5" fill="white" opacity="0.9"/>

          {/* Cute smile */}
          <path d="M50 46 Q60 53 70 46" stroke="#8b1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

          {/* Shell segments */}
          <path d="M25 58 Q60 52 95 58" stroke="#c01818" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
          <path d="M22 68 Q60 62 98 68" stroke="#c01818" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
          <path d="M24 78 Q60 72 96 78" stroke="#c01818" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
        </svg>
      </div>

      {/* Status dot */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-hub-dark"
        style={{ background: status === 'thinking' ? '#ff6b35' : status === 'active' ? '#69ff47' : '#475569' }}
      />
    </div>
  );
}


export function ClaudeCodeMascot({ size = 80, animate = false, status = 'idle' }) {
  const glowColor = status === 'thinking' ? '#4fc3f7' : status === 'active' ? '#38bdf8' : '#1e3a4a';

  return (
    <div
      className={`relative flex items-center justify-center ${animate ? 'animate-float' : ''}`}
      style={{ width: size, height: size, animationDelay: '0.5s' }}
    >
      {/* Status glow ring */}
      {status !== 'idle' && (
        <>
          <div className="radar-pulse absolute inset-0 rounded-full" style={{ background: `${glowColor}30`, border: `2px solid ${glowColor}60` }} />
          <div className="radar-pulse absolute inset-0 rounded-full" style={{ background: `${glowColor}20`, border: `2px solid ${glowColor}40`, animationDelay: '0.6s' }} />
        </>
      )}

      {/* Claude Code mascot — the official coral/orange cute diamond face character */}
      <div className="relative rounded-full overflow-hidden flex items-center justify-center"
           style={{ width: size, height: size, background: 'radial-gradient(circle at 40% 30%, #1a3a5c, #0a1a2e)' }}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '88%', height: '88%' }}
        >
          <defs>
            <radialGradient id="cc-body" cx="42%" cy="32%" r="62%">
              <stop offset="0%" stopColor="#ffb380"/>
              <stop offset="40%" stopColor="#e8733a"/>
              <stop offset="100%" stopColor="#c45a2a"/>
            </radialGradient>
            <radialGradient id="cc-face" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#ffcda0"/>
              <stop offset="100%" stopColor="#f0844a"/>
            </radialGradient>
            <radialGradient id="cc-gem" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#a0d8ff"/>
              <stop offset="50%" stopColor="#4fc3f7"/>
              <stop offset="100%" stopColor="#0284c7"/>
            </radialGradient>
            <linearGradient id="cc-shine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Outer diamond/crystal shape — the Claude Code emblem on forehead */}
          <polygon
            points="60,8 72,20 60,32 48,20"
            fill="url(#cc-gem)"
            opacity="0.95"
          />
          <polygon
            points="60,11 70,20 60,29 50,20"
            fill="url(#cc-shine)"
          />

          {/* Main round cute body */}
          <ellipse cx="60" cy="72" rx="36" ry="34" fill="url(#cc-body)"/>

          {/* Cute round head */}
          <ellipse cx="60" cy="50" rx="30" ry="28" fill="url(#cc-face)"/>

          {/* Shine on head */}
          <ellipse cx="48" cy="40" rx="12" ry="8" fill="white" opacity="0.18" transform="rotate(-20 48 40)"/>

          {/* Ears — little rounded bumps */}
          <ellipse cx="32" cy="42" rx="7" ry="9" fill="#e07030"/>
          <ellipse cx="88" cy="42" rx="7" ry="9" fill="#e07030"/>
          <ellipse cx="32" cy="42" rx="4" ry="5.5" fill="#ffb07a"/>
          <ellipse cx="88" cy="42" rx="4" ry="5.5" fill="#ffb07a"/>

          {/* Eyes — large, glossy, cute */}
          <ellipse cx="47" cy="50" rx="9" ry="9.5" fill="#1a1a2e"/>
          <ellipse cx="73" cy="50" rx="9" ry="9.5" fill="#1a1a2e"/>
          {/* Iris */}
          <circle cx="47" cy="50" r="5.5" fill="#4fc3f7"/>
          <circle cx="73" cy="50" r="5.5" fill="#4fc3f7"/>
          {/* Pupil */}
          <circle cx="47" cy="50" r="3" fill="#0a0a16"/>
          <circle cx="73" cy="50" r="3" fill="#0a0a16"/>
          {/* Gloss */}
          <circle cx="49.5" cy="47.5" r="2" fill="white" opacity="0.9"/>
          <circle cx="75.5" cy="47.5" r="2" fill="white" opacity="0.9"/>
          <circle cx="44" cy="53" r="1" fill="white" opacity="0.5"/>
          <circle cx="70" cy="53" r="1" fill="white" opacity="0.5"/>

          {/* Little blush marks */}
          <ellipse cx="36" cy="57" rx="7" ry="4" fill="#ff7050" opacity="0.35"/>
          <ellipse cx="84" cy="57" rx="7" ry="4" fill="#ff7050" opacity="0.35"/>

          {/* Cute nose */}
          <ellipse cx="60" cy="60" rx="3" ry="2" fill="#c45a2a" opacity="0.6"/>

          {/* Smile */}
          <path d="M50 65 Q60 73 70 65" stroke="#9a3a18" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

          {/* Small cute arms/hands */}
          <ellipse cx="26" cy="75" rx="9" ry="7" fill="url(#cc-body)" transform="rotate(-20 26 75)"/>
          <ellipse cx="94" cy="75" rx="9" ry="7" fill="url(#cc-body)" transform="rotate(20 94 75)"/>

          {/* Little feet */}
          <ellipse cx="48" cy="104" rx="12" ry="7" fill="#c45a2a"/>
          <ellipse cx="72" cy="104" rx="12" ry="7" fill="#c45a2a"/>
          <ellipse cx="48" cy="103" rx="9" ry="5" fill="#e07030"/>
          <ellipse cx="72" cy="103" rx="9" ry="5" fill="#e07030"/>

          {/* Body shine */}
          <ellipse cx="48" cy="62" rx="10" ry="14" fill="white" opacity="0.08" transform="rotate(-15 48 62)"/>

          {/* Claude 'C' mark on chest — subtle */}
          <path
            d="M54 78 Q44 78 44 88 Q44 98 54 98 Q62 98 64 92"
            stroke="#c45a2a"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Status dot */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-hub-dark"
        style={{ background: status === 'thinking' ? '#ff6b35' : status === 'active' ? '#69ff47' : '#475569' }}
      />
    </div>
  );
}
