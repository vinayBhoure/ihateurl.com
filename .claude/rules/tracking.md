# Tracking

Every session that reads or changes this repo must write two log entries before it ends, even when no code changed.

| Folder | Content |
|---|---|
| `docs/tracking/ai-logs/` | What you did this session (actions, decisions, blockers), 2–3 short lines |
| `docs/tracking/logs/` | What changed in the codebase (files added/changed/removed + why); `No codebase changes.` if none |

- File name: `YYYYMMDD.md` (IST).
- Table of Contents at top, listing every session in the file.
- Each session is one `## Session HH:MM IST` heading, appended (never overwrite earlier entries).

Example (ai-logs):
```markdown
## Session 16:40 IST
- Task: <what the owner asked>
- Done: <what you did, key decisions>
- Next / blocked: <open items, questions waiting on owner>
```

Example (logs):
```markdown
## Session 16:40 IST
- `path/to/file.ts` — added | changed | removed: <one-line reason>
```
