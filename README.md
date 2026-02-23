# ClaudeXClaw — Collaboration Software

Real-time collaboration bridge between **Claude Code** and **OpenClaw (clawbot)** running on the same VPS.

When you send a task to clawbot on Telegram, clawbot can automatically reach out to Claude Code for expert assistance — and Claude Code can reach back.

```
You (Telegram)
     │
     ▼
  Clawbot  ──── ask_claude ────►  Claude Code
     ▲                                │
     └──────── response ◄─────────────┘
```

---

## How it works

| Direction | Command | Use case |
|---|---|---|
| Clawbot → Claude Code | `ask_claude "question" [session_id]` | Clawbot needs expert help |
| Claude Code → Clawbot | `ask_clawbot "message" [session_id]` | Claude Code delegates or informs |

All exchanges are logged to a **collaboration memory file** (`/root/.openclaw/collab/collaboration.jsonl`) so sessions are fully auditable and searchable.

---

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/claude-code) — installed and authenticated
- [OpenClaw](https://docs.openclaw.ai) — running on the same VPS
- Python 3
- bash

---

## Installation

```bash
git clone https://github.com/Everaldtah/ClaudexClaw-collaboration-software-
cd ClaudexClaw-collaboration-software-
bash bridge/install.sh
```

The installer:
1. Creates `/root/.openclaw/collab/` for collaboration memory
2. Installs `ask_claude` and `ask_clawbot` to `/usr/local/bin`
3. Installs the OpenClaw skill so clawbot knows how to use the bridge
4. Verifies all dependencies

---

## Usage

### From clawbot (automatic via skill)

The OpenClaw skill (`skills/claude-collab/SKILL.md`) teaches clawbot when and how to call Claude Code. Once the skill is installed and OpenClaw is restarted, clawbot will automatically collaborate when needed.

### Manual usage

**Clawbot asks Claude Code:**
```bash
RESPONSE=$(ask_claude "How do I optimise this SQL query?" "session_abc" "User is on PostgreSQL 15")
echo "$RESPONSE"
```

**Claude Code talks to clawbot:**
```bash
ask_clawbot "I've finished analysing the codebase. Here are my findings..." "session_abc"
```

---

## Collaboration Memory

Every exchange is logged to `/root/.openclaw/collab/collaboration.jsonl` in JSONL format:

```json
{"timestamp":"2026-02-23T00:30:00+00:00","session_id":"session_abc","task_id":"task_1740268200_1234","from":"clawbot","to":"claude_code","message":"How do I...","context":"..."}
{"timestamp":"2026-02-23T00:30:15+00:00","session_id":"session_abc","task_id":"task_1740268200_1234","from":"claude_code","to":"clawbot","message":"Here's how..."}
```

### Viewing sessions

```bash
# List all sessions
collab_session list

# Show full transcript of a session
collab_session show session_abc

# Tail the last 20 events
collab_session tail

# Search across all messages
collab_session search "SQL"

# Usage stats
collab_session stats

# Export a session to text
collab_session export session_abc
```

---

## File Structure

```
ClaudexClaw-collaboration-software-/
├── bridge/
│   ├── ask_claude.sh        # Clawbot → Claude Code bridge script
│   ├── ask_clawbot.sh       # Claude Code → Clawbot bridge script
│   └── install.sh           # One-command installation
├── memory/
│   └── .gitkeep             # Local collaboration.jsonl lives here (gitignored)
├── skills/
│   └── claude-collab/
│       └── SKILL.md         # OpenClaw skill — teaches clawbot to use Claude Code
└── tools/
    └── collab_session.py    # CLI tool for viewing/searching collaboration history
```

---

## Technical Notes

- **How Claude Code is called:** `claude -p "prompt" --dangerously-skip-permissions` (non-interactive mode)
- **How clawbot is called:** `openclaw agent --local --agent main --message "..." --json`
- The `--local` flag runs the OpenClaw agent embedded (no WebSocket gateway required)
- Response time: 5–90 seconds depending on model and task complexity
- Session IDs group related exchanges in the memory file

---

## Confirmed working

Communication between Claude Code and clawbot was confirmed live on the VPS:

```bash
openclaw agent --local --agent main --message "Reply with exactly: CLAUDE_CODE_TEST_OK" --json
# Response: {"payloads":[{"text":"CLAUDE_CODE_TEST_OK"}], ...}
```

Both agents run on the same VPS and can reach each other directly via shell commands.
