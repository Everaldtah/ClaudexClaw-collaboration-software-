#!/usr/bin/env bash
# =============================================================================
# ask_claude.sh — ClaudeXClaw Bridge: Clawbot → Claude Code
# =============================================================================
# Called by OpenClaw (clawbot) when it needs Claude Code's help on a task.
# Logs the full exchange to the collaboration memory file.
#
# Usage:
#   ask_claude.sh "<question_or_task>" [session_id] [task_context]
#
# Output:
#   Claude Code's response (plain text, stdout)
# =============================================================================

set -euo pipefail

QUESTION="${1:-}"
SESSION_ID="${2:-session_$(date +%s)}"
TASK_CONTEXT="${3:-}"

COLLAB_DIR="/root/.openclaw/collab"
MEMORY_FILE="$COLLAB_DIR/collaboration.jsonl"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -z "$QUESTION" ]]; then
    echo "Usage: ask_claude.sh \"<question>\" [session_id] [task_context]" >&2
    exit 1
fi

mkdir -p "$COLLAB_DIR"

TIMESTAMP=$(date -Iseconds)
TASK_ID="task_$(date +%s)_$$"

# ── Log the incoming request from clawbot ────────────────────────────────────
python3 -c "
import json, sys
entry = {
    'timestamp': '$TIMESTAMP',
    'session_id': '$SESSION_ID',
    'task_id': '$TASK_ID',
    'from': 'clawbot',
    'to': 'claude_code',
    'message': sys.argv[1],
    'context': sys.argv[2]
}
with open('$MEMORY_FILE', 'a') as f:
    f.write(json.dumps(entry) + '\n')
" "$QUESTION" "$TASK_CONTEXT"

# ── Build context from recent collaboration history ───────────────────────────
RECENT_HISTORY=""
if [[ -f "$MEMORY_FILE" ]]; then
    RECENT_HISTORY=$(python3 -c "
import json
entries = []
try:
    with open('$MEMORY_FILE') as f:
        lines = f.readlines()
    for line in lines[-20:]:
        try:
            e = json.loads(line.strip())
            entries.append(f\"[{e['timestamp']}] {e['from']} → {e['to']}: {e['message'][:150]}\")
        except:
            pass
except:
    pass
print('\n'.join(entries[-10:]))
" 2>/dev/null || echo "")
fi

# ── Build the full prompt for Claude Code ─────────────────────────────────────
FULL_PROMPT="You are Claude Code, running on a VPS and collaborating in real-time with OpenClaw (clawbot) — an AI agent that handles tasks sent by the user via Telegram.

COLLABORATION CONTEXT:
- Session ID: $SESSION_ID
- Task ID: $TASK_ID
- Your role: expert assistant / co-pilot for clawbot
- Clawbot's role: orchestrator that talks to the user on Telegram

RECENT COLLABORATION HISTORY:
$RECENT_HISTORY

CLAWBOT'S REQUEST:
$QUESTION

ADDITIONAL TASK CONTEXT:
$TASK_CONTEXT

Respond clearly and directly. Your response will be used by clawbot to complete the task — be precise, actionable, and concise."

# ── Call Claude Code non-interactively ───────────────────────────────────────
# Unset CLAUDECODE so this works even when called from within a Claude Code session
RESPONSE=$(env -u CLAUDECODE claude -p "$FULL_PROMPT" --dangerously-skip-permissions 2>/dev/null)

# ── Log Claude Code's response ───────────────────────────────────────────────
RESP_TIMESTAMP=$(date -Iseconds)
python3 -c "
import json, sys
entry = {
    'timestamp': '$RESP_TIMESTAMP',
    'session_id': '$SESSION_ID',
    'task_id': '$TASK_ID',
    'from': 'claude_code',
    'to': 'clawbot',
    'message': sys.argv[1]
}
with open('$MEMORY_FILE', 'a') as f:
    f.write(json.dumps(entry) + '\n')
" "$RESPONSE"

echo "$RESPONSE"
