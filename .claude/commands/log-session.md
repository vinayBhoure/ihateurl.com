---
description: Write today's tracking log entries in both docs/tracking folders
---

# /log-session

Write today's entries in `docs/tracking/ai-logs/` and `docs/tracking/logs/`, per `CLAUDE.md` §1 and `.claude/rules/tracking.md`.

## Table of Contents
1. [Steps](#1-steps)
2. [Format](#2-format)

---

## 1. Steps

1. Get today's date and time in IST: run `date +%z` first. If it prints `+0530`, the system clock is already IST — use `date` directly for `YYYYMMDD` and `HH:MM`. If it prints anything else (e.g. `+0000`), the environment has no IST timezone data — do **not** set `TZ=Asia/Kolkata` and trust the result, since that silently falls back to UTC while still claiming to be IST. Instead take the UTC time and add 5 hours 30 minutes by hand.
2. Open (or create) `docs/tracking/ai-logs/YYYYMMDD.md` and `docs/tracking/logs/YYYYMMDD.md`.
3. If the file already has entries for today, append a new `## Session HH:MM IST` heading and add it to the Table of Contents. Never overwrite earlier entries.
4. First bullet under the heading: `- Session: <name>` — this session's name (from `/rename`, or a system reminder if it was renamed this session; `unnamed` otherwise).
5. Summarize this session:
   - `ai-logs`: what you did (actions, decisions, blockers), 2–3 short lines.
   - `logs`: what changed in the codebase (files added/changed/removed + why). If nothing changed, write `No codebase changes.`

## 2. Format

See the templates in `CLAUDE.md` §1 and `.claude/rules/tracking.md`.
