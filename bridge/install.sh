#!/usr/bin/env bash
# =============================================================================
# install.sh — ClaudeXClaw Installation Script
# =============================================================================
# Sets up the collaboration bridge on your VPS:
#   - Creates collaboration memory directory
#   - Installs bridge scripts to /usr/local/bin
#   - Installs the OpenClaw skill for clawbot
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
COLLAB_DIR="/root/.openclaw/collab"
SKILL_SRC="$REPO_DIR/skills/claude-collab"
SKILL_DEST="/root/.openclaw/workspace/skills/claude-collab"
BIN_DIR="/usr/local/bin"

echo "╔══════════════════════════════════════════════╗"
echo "║     ClaudeXClaw Collaboration Bridge          ║"
echo "║     Claude Code ↔ OpenClaw (clawbot)          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. Create collaboration memory directory ──────────────────────────────────
echo "→ Creating collaboration memory directory: $COLLAB_DIR"
mkdir -p "$COLLAB_DIR"

# ── 2. Make bridge scripts executable ────────────────────────────────────────
echo "→ Setting permissions on bridge scripts..."
chmod +x "$SCRIPT_DIR/ask_claude.sh"
chmod +x "$SCRIPT_DIR/ask_clawbot.sh"

# ── 3. Install scripts to PATH ────────────────────────────────────────────────
echo "→ Installing bridge commands to $BIN_DIR..."
ln -sf "$SCRIPT_DIR/ask_claude.sh"    "$BIN_DIR/ask_claude"
ln -sf "$SCRIPT_DIR/ask_clawbot.sh"   "$BIN_DIR/ask_clawbot"
ln -sf "$REPO_DIR/tools/collab_session.py" "$BIN_DIR/collab_session"
chmod +x "$REPO_DIR/tools/collab_session.py"

# ── 4. Install OpenClaw skill ─────────────────────────────────────────────────
if [[ -d "/root/.openclaw/workspace/skills" ]]; then
    echo "→ Installing OpenClaw skill: claude-collab..."
    mkdir -p "$SKILL_DEST"
    cp -r "$SKILL_SRC/." "$SKILL_DEST/"
    echo "  ✓ Skill installed to $SKILL_DEST"
else
    echo "  ⚠ OpenClaw workspace not found. Skill not installed."
    echo "    Manually copy skills/claude-collab/ to your OpenClaw skills directory."
fi

# ── 5. Verify dependencies ────────────────────────────────────────────────────
echo ""
echo "→ Checking dependencies..."
MISSING=0

check_cmd() {
    if command -v "$1" &>/dev/null; then
        echo "  ✓ $1"
    else
        echo "  ✗ $1 NOT FOUND — $2"
        MISSING=$((MISSING + 1))
    fi
}

check_cmd "claude"    "Install Claude Code CLI: https://docs.anthropic.com/claude-code"
check_cmd "openclaw"  "Install OpenClaw: https://docs.openclaw.ai"
check_cmd "python3"   "Install Python 3"
check_cmd "jq"        "Install jq: apt install jq"

echo ""
if [[ $MISSING -gt 0 ]]; then
    echo "⚠  $MISSING missing dependencies. Please install them before using the bridge."
else
    echo "✓ All dependencies found."
fi

# ── 6. Print usage ────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════"
echo "INSTALLATION COMPLETE"
echo "══════════════════════════════════════════════════"
echo ""
echo "Commands available:"
echo ""
echo "  From clawbot (in SKILL.md or scripts):"
echo "    ask_claude \"<question or task>\" [session_id] [context]"
echo ""
echo "  From Claude Code:"
echo "    ask_clawbot \"<message>\" [session_id]"
echo ""
echo "  View collaboration history:"
echo "    collab_session list"
echo "    collab_session show <session_id>"
echo "    collab_session tail"
echo ""
echo "  Memory file: $COLLAB_DIR/collaboration.jsonl"
echo ""
echo "  Next step: Restart OpenClaw so it picks up the new skill:"
echo "    openclaw gateway restart"
echo ""
