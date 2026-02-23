const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 3010;
const COLLAB_FILE = process.env.COLLAB_FILE || '/root/.openclaw/collab/collaboration.jsonl';
const OPENCLAW_SESSIONS_FILE = '/root/.openclaw/agents/main/sessions/sessions.json';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// ─── In-memory state ──────────────────────────────────────────────────────────
let messages = [];
let agentStatuses = {
  claude_code: { status: 'idle', lastSeen: null, currentTask: null, messageCount: 0 },
  clawbot:     { status: 'idle', lastSeen: null, currentTask: null, messageCount: 0 },
};
let sessions = {};
let connectedClients = new Set();

// ─── Load existing messages on startup ────────────────────────────────────────
function loadMessages() {
  if (!fs.existsSync(COLLAB_FILE)) return;
  try {
    const lines = fs.readFileSync(COLLAB_FILE, 'utf8').trim().split('\n').filter(Boolean);
    messages = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    rebuildState();
    console.log(`[Hub] Loaded ${messages.length} messages from history`);
  } catch (e) {
    console.error('[Hub] Failed to load messages:', e.message);
  }
}

function rebuildState() {
  const sessMap = {};
  messages.forEach(m => {
    const sid = m.session_id || 'default';
    if (!sessMap[sid]) sessMap[sid] = { id: sid, messages: [], started: m.timestamp, last: m.timestamp };
    sessMap[sid].messages.push(m);
    sessMap[sid].last = m.timestamp;
    // Update agent counts
    if (m.from && agentStatuses[m.from]) {
      agentStatuses[m.from].messageCount++;
      agentStatuses[m.from].lastSeen = m.timestamp;
    }
  });
  sessions = sessMap;
}

// ─── Detect agent running status via processes ────────────────────────────────
function detectAgentStatuses() {
  try {
    // Read /proc cmdlines — works on Linux host and Alpine container
    let claudeActive = false;
    let clawActive   = false;
    try {
      const ps = execSync('cat /proc/*/cmdline 2>/dev/null | tr "\\0" " " | grep -E "claude.*-p|openclaw.agent" | head -5', { timeout: 2000, shell: true }).toString();
      claudeActive = ps.includes('claude') && ps.includes('-p');
      clawActive   = ps.includes('openclaw') && ps.includes('agent');
    } catch {}

    const recentMs = 15000;
    const lastCollab = messages.length ? new Date(messages[messages.length - 1].timestamp).getTime() : 0;
    const isRecent = (Date.now() - lastCollab) < recentMs;
    const lastFrom = messages[messages.length - 1]?.from;

    agentStatuses.claude_code.status = claudeActive ? 'thinking'
      : isRecent && lastFrom === 'claude_code' ? 'active' : 'idle';

    agentStatuses.clawbot.status = clawActive ? 'thinking'
      : isRecent && lastFrom === 'clawbot' ? 'active' : 'idle';
  } catch {}
}

// ─── Broadcast to all WebSocket clients ───────────────────────────────────────
function broadcast(type, data) {
  const payload = JSON.stringify({ type, data, ts: new Date().toISOString() });
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });
}

// ─── Watch collaboration file for new entries ─────────────────────────────────
let fileSize = 0;
function watchCollabFile() {
  if (!fs.existsSync(path.dirname(COLLAB_FILE))) {
    fs.mkdirSync(path.dirname(COLLAB_FILE), { recursive: true });
  }

  const watcher = chokidar.watch(COLLAB_FILE, {
    persistent: true,
    usePolling: true,
    interval: 500,
    ignoreInitial: true,
  });

  watcher.on('change', () => {
    try {
      const stat = fs.statSync(COLLAB_FILE);
      if (stat.size <= fileSize) return;

      const fd = fs.openSync(COLLAB_FILE, 'r');
      const buf = Buffer.alloc(stat.size - fileSize);
      fs.readSync(fd, buf, 0, buf.length, fileSize);
      fs.closeSync(fd);
      fileSize = stat.size;

      const newLines = buf.toString('utf8').trim().split('\n').filter(Boolean);
      newLines.forEach(line => {
        try {
          const entry = JSON.parse(line);
          messages.push(entry);

          const sid = entry.session_id || 'default';
          if (!sessions[sid]) sessions[sid] = { id: sid, messages: [], started: entry.timestamp, last: entry.timestamp };
          sessions[sid].messages.push(entry);
          sessions[sid].last = entry.timestamp;

          if (entry.from && agentStatuses[entry.from]) {
            agentStatuses[entry.from].messageCount++;
            agentStatuses[entry.from].lastSeen = entry.timestamp;
            agentStatuses[entry.from].currentTask = entry.message?.substring(0, 80) || null;
          }

          broadcast('message', entry);
          broadcast('sessions', Object.values(sessions).map(s => ({ ...s, messages: undefined, count: s.messages.length })));
          broadcast('agents', agentStatuses);

          console.log(`[Hub] New message: ${entry.from} → ${entry.to} (session: ${sid})`);
        } catch {}
      });
    } catch (e) {
      console.error('[Hub] Watch error:', e.message);
    }
  });

  watcher.on('add', () => {
    fileSize = fs.existsSync(COLLAB_FILE) ? fs.statSync(COLLAB_FILE).size : 0;
  });

  if (fs.existsSync(COLLAB_FILE)) {
    fileSize = fs.statSync(COLLAB_FILE).size;
  }

  console.log(`[Hub] Watching: ${COLLAB_FILE}`);
}

// ─── WebSocket connections ─────────────────────────────────────────────────────
wss.on('connection', (ws, req) => {
  connectedClients.add(ws);
  console.log(`[Hub] Client connected (${connectedClients.size} total)`);

  detectAgentStatuses();

  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      messages: messages.slice(-200),
      sessions: Object.values(sessions).map(s => ({ ...s, messages: undefined, count: s.messages.length })),
      agents: agentStatuses,
      stats: {
        totalMessages: messages.length,
        totalSessions: Object.keys(sessions).length,
      }
    }
  }));

  ws.on('close', () => {
    connectedClients.delete(ws);
    console.log(`[Hub] Client disconnected (${connectedClients.size} total)`);
  });

  ws.on('error', () => connectedClients.delete(ws));
});

// ─── REST API ─────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true, uptime: process.uptime() }));

app.get('/api/messages', (req, res) => {
  const { session, limit = 100, offset = 0 } = req.query;
  let result = session ? (sessions[session]?.messages || []) : messages;
  res.json(result.slice(-Number(limit)));
});

app.get('/api/sessions', (_, res) => {
  res.json(Object.values(sessions).map(s => ({
    id: s.id,
    started: s.started,
    last: s.last,
    count: s.messages.length,
  })).sort((a, b) => (b.last || '').localeCompare(a.last || '')));
});

app.get('/api/sessions/:id', (req, res) => {
  const s = sessions[req.params.id];
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

app.get('/api/agents', (_, res) => {
  detectAgentStatuses();
  res.json(agentStatuses);
});

app.get('/api/stats', (_, res) => {
  res.json({
    totalMessages: messages.length,
    totalSessions: Object.keys(sessions).length,
    agents: agentStatuses,
    collabFile: COLLAB_FILE,
    uptime: process.uptime(),
  });
});

// SPA fallback
app.get('*', (_, res) => {
  const indexPath = path.join(__dirname, 'frontend/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Frontend not built yet');
  }
});

// ─── Status broadcast interval ────────────────────────────────────────────────
setInterval(() => {
  if (connectedClients.size > 0) {
    detectAgentStatuses();
    broadcast('agents', agentStatuses);
  }
}, 5000);

// ─── Boot ─────────────────────────────────────────────────────────────────────
loadMessages();
watchCollabFile();

server.listen(PORT, () => {
  console.log(`[Hub] ClaudeXClaw Collaboration Hub running on :${PORT}`);
  console.log(`[Hub] WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`[Hub] Clients: ${connectedClients.size}`);
});
