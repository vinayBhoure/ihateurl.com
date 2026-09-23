# Tracking

Every session that reads or changes this repo must write two log entries before it ends, even when no code changed.

| Folder | Content |
|---|---|
| `docs/tracking/ai-logs/` | What you did this session (actions, decisions, blockers), 2–3 short lines |
| `docs/tracking/logs/` | What changed in the codebase (files added/changed/removed + why); `No codebase changes.` if none |

- File name: `YYYYMMDD.md` (IST). Get the time from `date`; only trust a `TZ=` override if `date +%z` actually shows `+0530` — some environments lack timezone data and silently return UTC mislabeled as IST.
- Table of Contents at top, listing every session in the file.
- Each session is one `## Session HH:MM IST` heading, appended (never overwrite earlier entries).
- First bullet under every heading: `- Session: <name>` (the Claude Code session name from `/rename`, or `unnamed`). Multiple sessions can touch this repo the same day — the name is what tells them apart.

Example (ai-logs):
```markdown
## Session 16:40 IST
- Session: <session name, or "unnamed">
- Task: <what the owner asked>
- Done: <what you did, key decisions>
- Next / blocked: <open items, questions waiting on owner>
```

Example (logs):
```markdown
## Session 16:40 IST
- Session: <session name, or "unnamed">
- `path/to/file.ts` — added | changed | removed: <one-line reason>
```
