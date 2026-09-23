---
description: Run code-reviewer and security-reviewer on the current branch's diff against staging
---

# /review

Review the current branch's diff against `staging` using the `code-reviewer` and `security-reviewer` agents. Report only; make no edits.

## Table of Contents
1. [Before starting](#1-before-starting)
2. [Review](#2-review)
3. [Report](#3-report)

---

## 1. Before starting

1. Confirm the current branch has a diff against `origin/staging` (`git diff origin/staging...HEAD`). No diff → say so and stop.
2. Read `CLAUDE.md` and `.claude/rules/*` for context.

## 2. Review

1. Run the `code-reviewer` agent on the diff.
2. Run the `security-reviewer` agent on the diff.
3. Both agents report findings only — neither edits files.

## 3. Report

Combine both agents' findings into one list, most severe first. State plainly if nothing was found. Do not commit, push, or apply fixes — that's a separate, explicit step.
