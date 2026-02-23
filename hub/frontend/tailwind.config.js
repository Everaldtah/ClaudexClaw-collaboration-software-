/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'hub-black':   '#08080f',
        'hub-dark':    '#0d0d1a',
        'hub-card':    '#111122',
        'hub-border':  '#1e1e3a',
        'claude-blue': '#4fc3f7',
        'claude-dim':  '#1a3a4a',
        'claw-green':  '#69ff47',
        'claw-dim':    '#0d2a08',
        'accent-orange':'#ff6b35',
        'accent-purple':'#b388ff',
        'text-primary': '#e2e8f0',
        'text-dim':    '#64748b',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'glow-blue': 'glowBlue 2s ease-in-out infinite alternate',
        'glow-green': 'glowGreen 2s ease-in-out infinite alternate',
        'message-in': 'messageIn 0.4s ease-out',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        scan: { '0%': { top: '0%' }, '100%': { top: '100%' } },
        glowBlue: { from: { boxShadow: '0 0 8px #4fc3f7' }, to: { boxShadow: '0 0 20px #4fc3f7, 0 0 40px #4fc3f780' } },
        glowGreen: { from: { boxShadow: '0 0 8px #69ff47' }, to: { boxShadow: '0 0 20px #69ff47, 0 0 40px #69ff4780' } },
        messageIn: { from: { opacity: 0, transform: 'translateY(12px) scale(0.97)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
      }
    }
  },
  plugins: []
};
