---
schema: ai/dev-task@3
jira: <JIRA-ID>
id: <JIRA-ID>/task-<n>
ac_refs: ['AC-1', 'AC-2']
updated_at: <ISO8601>
---

## Goal

Exact scope for this task. State what **is** and **is not** included.

## Pattern Lock-in (from standards)

-   Reference components/files: <paths> # copy exactly
-   Known timing/service gotchas: <from standards>
-   Standards to consult: core, api-and-mocks, crud, dev-playbook

## Vitest Checklist (tie to ac_refs)

-   Unit specs: <file(s)>.spec.ts
-   Happy paths: one test per AC in `ac_refs`
-   Obvious edges: list here
-   Mocking: MSW/light stubs as needed

## Manual Test Script (mapped to ACs)

-   To run ts files, use npx tsx

### Manual Test — AC-1 (Happy)

1. Step…
2. Step…
   **Expected:** …

### Manual Test — AC-1 (Error)

1. Step…
2. Step…
   **Expected:** …

### Regression (key flows)

-   Flow 1: steps → expected
-   Flow 2: steps → expected

## Steps (risk-first)

1. High-risk (service params, timing/grid ops)
2. Standard UI / CRUD
3. Polish (a11y, perf)

## Exit Criteria (DoD)

-   All `ac_refs` covered by **Vitest** happy-path specs (+ edges where simple)
-   Manual test checklist executed and checked off
-   `pnpm check` passes
-   No unrelated edits; dead code removed
-   Flags/rollout state per Tech Plan; screenshots (if UI visible)
