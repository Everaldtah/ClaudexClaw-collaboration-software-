#!/usr/bin/env python3
# =============================================================================
# collab_session.py — ClaudeXClaw Collaboration Memory Viewer
# =============================================================================
# View and manage the collaboration session history between
# Claude Code and OpenClaw (clawbot).
#
# Usage:
#   collab_session list                  List all sessions
#   collab_session show <session_id>     Show full session transcript
#   collab_session tail [n]              Show last n events (default 20)
#   collab_session stats                 Show statistics
#   collab_session search <keyword>      Search messages
#   collab_session export <session_id>   Export session as readable text
# =============================================================================

import json
import sys
import os
from pathlib import Path
from datetime import datetime
from collections import defaultdict

COLLAB_DIR = Path("/root/.openclaw/collab")
MEMORY_FILE = COLLAB_DIR / "collaboration.jsonl"

# ANSI colors
CYAN   = "\033[96m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
BOLD   = "\033[1m"
RESET  = "\033[0m"
DIM    = "\033[2m"


def load_entries():
    if not MEMORY_FILE.exists():
        return []
    entries = []
    with open(MEMORY_FILE) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return entries


def fmt_from(from_agent):
    if from_agent == "claude_code":
        return f"{CYAN}Claude Code{RESET}"
    elif from_agent == "clawbot":
        return f"{GREEN}Clawbot{RESET}"
    return f"{YELLOW}{from_agent}{RESET}"


def cmd_list(entries):
    if not entries:
        print("No collaboration history yet.")
        return

    sessions = defaultdict(lambda: {"count": 0, "first": None, "last": None, "agents": set()})
    for e in entries:
        sid = e.get("session_id", "unknown")
        s = sessions[sid]
        s["count"] += 1
        s["agents"].add(e.get("from", "?"))
        ts = e.get("timestamp", "")
        if s["first"] is None or ts < s["first"]:
            s["first"] = ts
        if s["last"] is None or ts > s["last"]:
            s["last"] = ts

    print(f"\n{BOLD}Collaboration Sessions{RESET}")
    print("═" * 80)
    print(f"{'SESSION ID':<35} {'EVENTS':<8} {'STARTED':<22} {'LAST ACTIVITY'}")
    print("─" * 80)
    for sid, info in sorted(sessions.items(), key=lambda x: x[1]["last"] or "", reverse=True):
        first = info["first"][:19].replace("T", " ") if info["first"] else "?"
        last  = info["last"][:19].replace("T", " ")  if info["last"]  else "?"
        print(f"{DIM}{sid:<35}{RESET} {info['count']:<8} {first:<22} {last}")
    print(f"\n{len(sessions)} session(s) total, {len(entries)} events")
    print(f"Memory file: {MEMORY_FILE}\n")


def cmd_show(entries, session_id):
    session_entries = [e for e in entries if e.get("session_id") == session_id]
    if not session_entries:
        print(f"Session '{session_id}' not found.")
        return

    print(f"\n{BOLD}Session: {session_id}{RESET}")
    print("═" * 80)
    for e in session_entries:
        ts = e.get("timestamp", "")[:19].replace("T", " ")
        frm = e.get("from", "?")
        to  = e.get("to", "?")
        msg = e.get("message", "")
        tid = e.get("task_id", "")

        print(f"\n{DIM}[{ts}] {fmt_from(frm)} → {fmt_from(to)}{RESET}")
        if tid:
            print(f"{DIM}Task: {tid}{RESET}")
        print(f"{msg}")
        print("─" * 40)


def cmd_tail(entries, n=20):
    if not entries:
        print("No collaboration history yet.")
        return

    tail = entries[-n:]
    print(f"\n{BOLD}Last {len(tail)} collaboration events{RESET}")
    print("═" * 80)
    for e in tail:
        ts  = e.get("timestamp", "")[:19].replace("T", " ")
        frm = e.get("from", "?")
        to  = e.get("to", "?")
        msg = e.get("message", "")
        # Truncate long messages
        preview = msg[:200] + ("..." if len(msg) > 200 else "")
        print(f"\n{DIM}[{ts}]{RESET} {fmt_from(frm)} → {fmt_from(to)}")
        print(f"  {preview}")


def cmd_stats(entries):
    if not entries:
        print("No collaboration history yet.")
        return

    total = len(entries)
    sessions = len(set(e.get("session_id", "?") for e in entries))
    by_direction = defaultdict(int)
    for e in entries:
        key = f"{e.get('from','?')} → {e.get('to','?')}"
        by_direction[key] += 1

    # Average message length
    avg_len = sum(len(e.get("message", "")) for e in entries) / total if total else 0

    print(f"\n{BOLD}Collaboration Statistics{RESET}")
    print("═" * 40)
    print(f"  Total events:      {total}")
    print(f"  Sessions:          {sessions}")
    print(f"  Avg message len:   {avg_len:.0f} chars")
    print(f"\n  Events by direction:")
    for direction, count in sorted(by_direction.items()):
        print(f"    {direction}: {count}")

    # Time range
    timestamps = [e.get("timestamp", "") for e in entries if e.get("timestamp")]
    if timestamps:
        first = min(timestamps)[:19].replace("T", " ")
        last  = max(timestamps)[:19].replace("T", " ")
        print(f"\n  First event:  {first}")
        print(f"  Last event:   {last}")
    print()


def cmd_search(entries, keyword):
    keyword = keyword.lower()
    results = [e for e in entries if keyword in e.get("message", "").lower()]
    if not results:
        print(f"No results for '{keyword}'")
        return

    print(f"\n{BOLD}Search results for '{keyword}' ({len(results)} found){RESET}")
    print("═" * 80)
    for e in results:
        ts  = e.get("timestamp", "")[:19].replace("T", " ")
        frm = e.get("from", "?")
        to  = e.get("to", "?")
        msg = e.get("message", "")
        # Highlight keyword
        highlighted = msg.replace(keyword, f"{YELLOW}{keyword}{RESET}").replace(keyword.upper(), f"{YELLOW}{keyword.upper()}{RESET}")
        preview = highlighted[:300] + ("..." if len(msg) > 300 else "")
        print(f"\n{DIM}[{ts}]{RESET} {fmt_from(frm)} → {fmt_from(to)}")
        print(f"  Session: {e.get('session_id','?')}")
        print(f"  {preview}")


def cmd_export(entries, session_id):
    session_entries = [e for e in entries if e.get("session_id") == session_id]
    if not session_entries:
        print(f"Session '{session_id}' not found.")
        return

    lines = [
        f"ClaudeXClaw Collaboration Session Export",
        f"Session ID: {session_id}",
        f"Exported: {datetime.now().isoformat()}",
        "=" * 60,
        ""
    ]
    for e in session_entries:
        ts  = e.get("timestamp", "")[:19].replace("T", " ")
        frm = e.get("from", "?").replace("_", " ").title()
        to  = e.get("to", "?").replace("_", " ").title()
        msg = e.get("message", "")
        lines.append(f"[{ts}] {frm} → {to}")
        lines.append(msg)
        lines.append("-" * 40)
        lines.append("")

    output = "\n".join(lines)
    out_file = COLLAB_DIR / f"export_{session_id[:20]}.txt"
    out_file.write_text(output)
    print(output)
    print(f"\nExported to: {out_file}")


def usage():
    print(f"""
{BOLD}collab_session — ClaudeXClaw Memory Viewer{RESET}

Usage:
  collab_session list                   List all collaboration sessions
  collab_session show <session_id>      Show full session transcript
  collab_session tail [n]               Show last n events (default 20)
  collab_session stats                  Show usage statistics
  collab_session search <keyword>       Search across all messages
  collab_session export <session_id>    Export session to text file

Memory file: {MEMORY_FILE}
""")


def main():
    args = sys.argv[1:]
    cmd = args[0] if args else "list"

    entries = load_entries()

    if cmd == "list":
        cmd_list(entries)
    elif cmd == "show" and len(args) > 1:
        cmd_show(entries, args[1])
    elif cmd == "tail":
        n = int(args[1]) if len(args) > 1 else 20
        cmd_tail(entries, n)
    elif cmd == "stats":
        cmd_stats(entries)
    elif cmd == "search" and len(args) > 1:
        cmd_search(entries, " ".join(args[1:]))
    elif cmd == "export" and len(args) > 1:
        cmd_export(entries, args[1])
    else:
        usage()


if __name__ == "__main__":
    main()
