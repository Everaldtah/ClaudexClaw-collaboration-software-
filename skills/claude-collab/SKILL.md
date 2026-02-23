# Claude Code Collaboration Skill

Use this skill when you need to collaborate with Claude Code (your VPS co-pilot) on complex tasks.

## When to use

- The task requires deep code analysis, architecture decisions, or software engineering expertise
- You need a second opinion or want to cross-check your reasoning
- The user asks you to "work with Claude Code", "get Claude's help", or "collaborate"
- A task is too complex and would benefit from parallel reasoning
- You need help with debugging, code generation, or system design

## How to use

Claude Code is running on this same VPS and can be reached via the bridge script.

### Ask Claude Code for help

```bash
RESPONSE=$(ask_claude "Your question or task here" "$SESSION_ID" "Optional task context")
echo "$RESPONSE"
```

### Full collaboration example

```bash
# Start a collaboration session
SESSION_ID="collab_$(date +%s)"

# Ask Claude Code for help
CLAUDE_RESPONSE=$(ask_claude "The user wants to build a REST API in Python. What's the best structure for a FastAPI project with auth, database, and background tasks?" "$SESSION_ID" "User is building a SaaS product")

# Use Claude Code's response in your reply to the user
echo "I've consulted with Claude Code. Here's the recommendation: $CLAUDE_RESPONSE"
```

### Send a task to Claude Code and get the result

```bash
SESSION_ID="collab_$(date +%s)"

# Delegate a subtask
RESULT=$(ask_claude "Write a Python function that validates an email address using regex. Return just the function code." "$SESSION_ID")

# Use the result
echo "Here's the code Claude Code wrote:"
echo "$RESULT"
```

## Collaboration memory

All sessions are automatically logged to `/root/.openclaw/collab/collaboration.jsonl`.

To view past collaboration sessions:
```bash
collab_session list
collab_session show <session_id>
collab_session tail 20
collab_session search "API"
```

## Notes

- Responses from Claude Code take 5-30 seconds depending on complexity
- Each exchange is logged with timestamps for auditing
- Use the same `SESSION_ID` throughout a task to keep context grouped
- Claude Code has full tool access on the VPS (file system, bash, etc.)
- For best results, be specific about what you need — Claude Code works best with clear, concrete requests
