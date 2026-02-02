---
name: speckit-08-implement
description: Execute implementation plan by processing all tasks in tasks.md
---

# Spec-Kit Implement

Execute the implementation plan by processing and executing all tasks defined in tasks.md.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Constitution Loading (REQUIRED)

Before ANY action, load and internalize the project constitution:

1. Read constitution:
   ```bash
   cat .specify/memory/constitution.md 2>/dev/null || echo "NO_CONSTITUTION"
   ```

2. If file doesn't exist:
   ```
   ERROR: Project constitution not found at .specify/memory/constitution.md

   Cannot proceed without constitution.
   Run: /speckit-00-constitution
   ```

3. Parse all principles, constraints, and governance rules.

4. **Extract Enforcement Rules**: Find all MUST, MUST NOT, SHALL, REQUIRED, NON-NEGOTIABLE statements. These rules are checked BEFORE EVERY FILE WRITE.

5. **Hard Gate Declaration**:
   ```
   CONSTITUTION ENFORCEMENT GATE ACTIVE
   Extracted: X enforcement rules
   Mode: STRICT - violations HALT implementation
   ```

## Prerequisites Check

1. Run prerequisites check:
   ```bash
   .tessl/tiles/tessl-labs/spec-kit/skills/speckit-01-specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks
   ```

2. Parse JSON for `FEATURE_DIR` and `AVAILABLE_DOCS`.

3. If error or missing `tasks.md`:
   ```
   ERROR: tasks.md not found in feature directory.
   Run: /speckit-06-tasks
   ```

## Pre-Implementation Validation

**BEFORE any implementation, perform complete validation sweep:**

### Artifact Completeness Check

| Artifact | Required | Check |
|----------|----------|-------|
| constitution.md | YES | Has principles section |
| spec.md | YES | Has Requirements + Success Criteria |
| plan.md | YES | Has Technical Context defined |
| tasks.md | YES | Has at least one task |
| checklists/*.md | YES | At least one checklist |

### Cross-Artifact Consistency

1. **Spec → Tasks**: Every FR-XXX should have corresponding task(s)
2. **Plan → Tasks**: Tech stack should match task file paths
3. **Constitution → Plan**: Verify no constitution violations

### Readiness Score

Report: Artifacts complete, Spec coverage %, Plan alignment, Constitution compliance, Checklist status, Dependencies valid. Output READY or BLOCKED.

## Checklist Gating (CRITICAL)

1. Read each checklist file in `FEATURE_DIR/checklists/`
2. Count: Incomplete (`- [ ]`) vs Complete (`- [x]`)
3. **PASS**: All checklists 100% → proceed
4. **FAIL**: Ask user to proceed or halt

## Execution Flow

### 1. Load Implementation Context

- **REQUIRED**: `tasks.md`, `plan.md`
- **IF EXISTS**: `data-model.md`, `contracts/`, `research.md`, `quickstart.md`, `tests/test-specs.md`

### 2. TDD Support Check

If `tests/test-specs.md` exists:
- Verify assertion integrity using `.tessl/tiles/tessl-labs/spec-kit/skills/speckit-01-specify/scripts/bash/testify-tdd.sh comprehensive-check`
- **BLOCKED** if assertions were tampered → halt with remediation steps
- Display circular verification warning: fix code to pass tests, don't modify assertions

If TDD is **mandatory** in constitution but test-specs.md missing → ERROR

### 3. Tessl Integration

If Tessl installed, use tiles for library documentation. See `references/tessl-integration.md` for detailed patterns.

**Key rule**: Before implementing code using a tile's library, query `mcp__tessl__query_library_docs`.

### 4. Project Setup

Create/verify ignore files based on tech stack. See `references/ignore-patterns.md` for patterns by technology.

### 5. Parse and Execute Tasks

Extract from tasks.md:
- Task phases, dependencies, parallel markers [P]
- Execute phase-by-phase, respecting dependencies
- Parallel tasks [P] can run together

**Execution rules**:
- Query Tessl tiles before implementing library code
- Tests before code if TDD
- Mark completed tasks as `[x]`

### 6. Output Validation (REQUIRED)

Before writing ANY file:
1. Review against EACH constitutional principle
2. If violation: STOP, explain, suggest alternative
3. If compliant: proceed

### 7. Progress Tracking

- Report after each task
- Halt on non-parallel task failure
- Mark completed tasks `[x]` in tasks.md

### 8. Completion

- Verify all tasks completed
- Validate features match spec
- Confirm tests pass
- Report Tessl tile usage if applicable

## Error Handling

| Condition | Response |
|-----------|----------|
| Tasks file missing | STOP: Run /speckit-06-tasks |
| Plan file missing | STOP: Run /speckit-03-plan |
| Constitution violation | STOP, explain, suggest alternative |
| Checklist incomplete | Ask user, STOP if declined |
| Task fails | Report error, halt sequential |

## Next Steps

```
Implementation complete! Next steps:
- Run tests to verify functionality
- Commit and push changes
- /speckit-09-taskstoissues - (Optional) Export tasks to GitHub Issues
```
