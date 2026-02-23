#!/usr/bin/env bash
# =============================================================================
# ask_clawbot.sh — ClaudeXClaw Bridge: Claude Code → Clawbot
# =============================================================================
# Called by Claude Code to send a message to OpenClaw (clawbot).
# Uses `openclaw agent --local` to inject the message into clawbot's session.
# Logs the full exchange to the collaboration memory file.
#
# Usage:
#   ask_clawbot.sh "<message>" [session_id]
#
# Output:
#   Clawbot's response (plain text, stdout)
# =============================================================================

set -euo pipefail

MESSAGE="${1:-}"
SESSION_ID="${2:-session_$(date +%s)}"

COLLAB_DIR="/root/.openclaw/collab"
MEMORY_FILE="$COLLAB_DIR/collaboration.jsonl"

if [[ -z "$MESSAGE" ]]; then
    echo "Usage: ask_clawbot.sh \"<message>\" [session_id]" >&2
    exit 1
fi

mkdir -p "$COLLAB_DIR"

TIMESTAMP=$(date -Iseconds)
TASK_ID="task_$(date +%s)_$$"

# ── Log the outgoing message from Claude Code ────────────────────────────────
python3 -c "
import json, sys
entry = {
    'timestamp': '$TIMESTAMP',
    'session_id': '$SESSION_ID',
    'task_id': '$TASK_ID',
    'from': 'claude_code',
    'to': 'clawbot',
    'message': sys.argv[1]
}
with open('$MEMORY_FILE', 'a') as f:
    f.write(json.dumps(entry) + '\n')
" "$MESSAGE"

# ── Send to clawbot via openclaw agent (local embedded mode) ─────────────────
RAW_RESPONSE=$(openclaw agent --local --agent main --message "$MESSAGE" --json 2>/dev/null)

# ── Extract text payload ──────────────────────────────────────────────────────
RESPONSE=$(python3 -c "
import json, sys
try:
    d = json.loads(sys.stdin.read())
    payloads = d.get('payloads', [])
    if payloads:
        print(payloads[0].get('text', '').strip())
    else:
        print('[No response payload]')
except Exception as e:
    print(f'[Parse error: {e}]')
" <<< "$RAW_RESPONSE" 2>/dev/null || echo "[Failed to get response]")

# ── Log clawbot's response ───────────────────────────────────────────────────
RESP_TIMESTAMP=$(date -Iseconds)
python3 -c "
import json, sys
entry = {
    'timestamp': '$RESP_TIMESTAMP',
    'session_id': '$SESSION_ID',
    'task_id': '$TASK_ID',
    'from': 'clawbot',
    'to': 'claude_code',
    'message': sys.argv[1]
}
with open('$MEMORY_FILE', 'a') as f:
    f.write(json.dumps(entry) + '\n')
" "$RESPONSE"

echo "$RESPONSE"
