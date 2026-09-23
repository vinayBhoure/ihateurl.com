---
name: generate-plan
description: >
  Converts a requirement into a complete implementation roadmap before writing
  code. Performs project discovery, identifies reusable components, validates
  assumptions, asks clarification questions when required, creates a feature
  branch, prepares an execution plan, and only begins implementation after
  explicit approval.
  Usage: /generate-plan <task>
  Example:
    /generate-plan "Add Help & Support dashboard page with admin messaging"
---

# /generate-plan

Senior implementation planner for the project.

Converts a requirement into an executable implementation plan while protecting
existing functionality and preventing assumptions.

---

# Usage

```text
/generate-plan <task>
```

Example:

```text
/generate-plan Add Help & Support dashboard page with admin messaging
```

---

# Rules

- Never assume:
  - Requirements
  - Existing APIs
  - Database schema
  - Business logic
  - Authentication flow
  - Permissions
  - Existing workflows
  - Environment configuration
  - Expected behaviour

- Use only verified information from the codebase.
- Reuse existing architecture wherever possible.
- Do not modify unrelated functionality.
- Do not implement incomplete or ambiguous requirements.
- Ask clarification questions whenever required.
- Keep changes incremental and reversible.

---

# Phase 1 — Discovery

Before planning or coding:

1. Inspect the project structure.
2. Understand the architecture.
3. Identify reusable modules, services and utilities.
4. Review existing implementation related to the task.
5. Extract confirmed requirements.
6. Identify missing information.
7. Identify dependencies, risks and blockers.

If critical information is missing:

- Stop.
- Ask targeted clarification questions.
- Do not create implementation details.

---

# Phase 2 — Branch

Create a feature branch before implementation.

Branch format:

```text
<type>/<module>/<short-description>
```

Types:

- feature
- fix
- refactor
- chore
- docs

Examples:

```text
feature/dashboard/help-support
fix/auth/otp-login
refactor/payment/webhook-service
```

Always branch from the latest development branch.

```bash
git fetch origin
git checkout -b <branch-name> origin/staging
```

---

# Phase 3 — Planning

Convert the requirement into:

- Epics
- Features
- Tasks
- Subtasks

For every task include:

- Purpose
- Dependencies
- Risks
- Validation criteria
- Rollback considerations

Identify:

- Critical Path
- Parallel Tasks
- Blocked Tasks

Keep work small, independent and reviewable.

---

# Approval Gate (Mandatory)

After planning:

1. Present the complete implementation plan.
2. Stop.

Wait for one of:

- Approve
- Proceed
- Start implementation
- Execute the plan

Until approval:

- Planning is allowed.
- Refinement is allowed.
- No code.
- No file changes.
- No implementation.

Never transition from planning to implementation without explicit approval.

---

# Phase 4 — Implementation

For every task:

1. Explain the purpose.
2. Implement the change.
3. Validate the implementation.
4. Run relevant tests.
5. Verify acceptance criteria.
6. Commit the change.
7. Update progress.

Never continue when:

- Validation fails.
- Requirements become unclear.
- Tests fail.
- The current task is incomplete.

---

# Git Discipline

## Commit Rules

- Small atomic commits.
- One logical change per commit.
- Conventional Commits.
- Clear commit summaries.

Examples:

```text
feat(auth): add otp resend endpoint
fix(api): handle null booking response
refactor(db): extract booking repository
test(payment): add webhook integration tests
docs(readme): update deployment guide
```

---

# Testing

Every completed task must include:

## Validation

- Functional verification
- Edge-case verification
- Regression verification

## Testing

- Manual testing
- Integration testing (when applicable)
- End-to-end testing (when applicable)

## Acceptance

- Requirement satisfied
- No known regressions
- Ready for review

---

# Reporting Format

## 1. Current Understanding

### Confirmed Information

- ...

### Missing Information

- ...

### Risks

- ...

---

## 2. Clarification Questions

| Priority | Question | Why |
|----------|----------|-----|

---

## 3. Scope Breakdown

| Epic | Feature | Task | Dependencies | Status |
|------|----------|------|--------------|--------|

Status:

- Pending
- In Progress
- Blocked
- Completed

---

## 4. Execution Plan

| Order | Task | Purpose | Dependencies | Validation |
|------|------|----------|--------------|------------|

---

## 5. Git Plan

### Branch

```text
feature/<module>/<description>
```

### Planned Commits

```text
feat(...)
fix(...)
refactor(...)
test(...)
```

### Merge Strategy

- Branch → staging → validation → main

---

## 6. Testing Plan

- Manual Testing
- Integration Testing
- E2E Testing
- Regression Testing

---

# Output Principles

- Be concise.
- Prefer tables over long paragraphs.
- Maintain traceability from requirement → implementation → testing.
- Ask questions instead of guessing.
- Validate every change.
- Keep the implementation maintainable and production-ready.