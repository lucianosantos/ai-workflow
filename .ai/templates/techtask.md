---
schema: ai/dev-task@3
jira: <JIRA-ID>
id: <JIRA-ID>/task-<n>
ac_refs: ["AC-1", "AC-2"]
updated_at: <ISO8601>
---

## Goal

Exact scope for this task. State what **is** and **is not** included.

## Pattern Lock-in (from standards)

- Reference components/files: <paths> # copy exactly
- Known timing/service gotchas: <from standards>
- Standards to consult: core, api-and-mocks, crud, dev-playbook

## Vitest Checklist (tie to ac_refs)

> **Comprehensive test guidance:** See `.ai/standards/test-playbook.md` for patterns and edge case checklists.

- **Unit specs:** <file(s)>.spec.ts
- **Happy paths:** One test per AC in `ac_refs` (minimum required)
- **Edge cases:** Document and test (use checklist below)
  - [ ] Null/undefined handling for each input parameter
  - [ ] Empty collections (arrays, objects)
  - [ ] Boundary values (0, -1, max values, empty strings)
  - [ ] Timezone variations (if date/time involved) - See test-playbook.md for pattern
  - [ ] Data format variations (string vs object, ISO formats)
  - [ ] Reactive state changes (if composables/computed)
- **Data structure edges** (if integrating APIs):
  - [ ] Duplicate IDs/keys with conflicting values
  - [ ] One-to-many relationships (e.g., parent → multiple children)
  - [ ] Mixed null/non-null values for same entity
  - [ ] Empty arrays, single-item arrays
- **Mocking:** MSW/light stubs as needed

### Quick Edge Case Guide

**If code handles dates/times:**

- [ ] Test multiple timezones (UTC-5, UTC+0, UTC+10) - use `process.env.TZ`
- [ ] Test ISO format variations ("YYYY-MM-DD" vs "YYYY-MM-DDTHH:mm:ssZ")
- [ ] Verify DATE-ONLY fields don't shift due to timezone conversion

**If code processes arrays/collections:**

- [ ] Empty array
- [ ] Single-item array
- [ ] Array with all null values
- [ ] Array with mixed null/non-null values
- [ ] Duplicate keys with conflicting values

**If code uses composables/reactivity:**

- [ ] Test initial state
- [ ] Test state changes trigger expected updates (use `nextTick()`)
- [ ] Test cleanup on unmount (if applicable)

## Manual Test Script (mapped to ACs)

- To run ts files, use npx tsx

### Manual Test — AC-1 (Happy)

1. Step…
2. Step…
   **Expected:** …

### Manual Test — AC-1 (Error)

1. Step…
2. Step…
   **Expected:** …

### Regression (key flows)

- Flow 1: steps → expected
- Flow 2: steps → expected

## Steps (risk-first)

1. High-risk (service params, timing/grid ops)
2. Standard UI / CRUD
3. Polish (a11y, perf)

## Exit Criteria (DoD)

- All `ac_refs` covered by **Vitest** happy-path specs (+ edges where simple)
- Manual test checklist executed and checked off
- `pnpm check` passes
- No unrelated edits; dead code removed
- Flags/rollout state per Tech Plan; screenshots (if UI visible)
