# Dev Playbook (Implementation Discipline)

> Scope: **Implementer** phase only. Planning lives in `02-techplan.md`.  
> Goal: ship safely by copying proven patterns, testing the happy paths with **Vitest**, and documenting manual checks mapped to ACs.

---

## 1) Pattern Lock-in (copy, don’t improvise)
- Find the closest **reference** component/service and **copy its structure exactly** (files, names, lifecycle, error handling).
- Prefer **one proven pattern** across the codebase over multiple variations.
- Do not introduce new architecture in a task; if a deviation is required, propose it in an ADR via the Tech Plan first.

**Reference checklist**
- [ ] Same folder structure and file naming
- [ ] Same state management approach
- [ ] Same error/timing handling strategy
- [ ] Same API layer conventions (request builders, DTOs)

---

## 2) Risk-First Order of Work
1) **High-risk** first: service parameters, API behavior, async/timing, complex grid/list lifecycles.
2) **Standard UI/CRUD** next: forms, table wiring, pagination, validation.
3) **Polish** last: a11y improvements, perf tweaks, refactors.

---

## 3) Vitest (unit) — minimal rules
- Co-locate tests: `*.spec.ts` next to the unit under test.
- Use **AC IDs** to name suites when possible: `describe('AC-1: ...')`.
- Keep tests **fast and focused** on the unit (no e2e/contract yet).
- Mock network via **MSW** (or light stubs) only as needed.
- At least **one unit test per AC happy path**, plus obvious edge cases.

**Example**
```ts
import { describe, it, expect } from 'vitest'
import { buildPayload } from './checkout'

describe('AC-1: guest checkout on mobile', () => {
  it('builds payload with current reactive values', () => {
    const payload = buildPayload({ group: 'A' })
    expect(payload.group).toBe('A')
  })
})
```

**Commands**
- Run once: `pnpm test`
- Watch mode: `pnpm test --watch`
- Type + lint bundle (if defined): `pnpm check`

---

## 4) Manual test script (per task)
Document steps **inside the Task file**, mapped to BizSpec ACs.

**Template**
```md
### Manual Test — AC-1 (Happy)
1) Step…
2) Step…
**Expected:** …

### Manual Test — AC-1 (Error)
1) Step…
2) Step…
**Expected:** …

### Regression (key flows)
- Flow 1: steps → expected
- Flow 2: steps → expected
```

---

## 5) Success criteria (Definition of Done)
- Reference pattern followed exactly; **no ad-hoc architecture**.
- **Vitest** specs cover each **AC happy path** (+ easy edges).
- Manual test checklist executed and **checked off in the Task**.
- No unrelated edits; dead code removed; `pnpm check` passes.
- Feature flags/rollout state as per Tech Plan; screenshots for visible UI.

---

## 6) Common failures to avoid
- Inventing a new pattern when a reference exists.
- “Assumption coding” (implementing without answered blockers).
- Drive-by refactors mixed into feature commits.
- Silent drift from BizSpec/Tech Plan.
- Merging without executing the manual test checklist.
- Ignoring error/timing paths in data-heavy components.

---

## 7) When to pause and escalate
- A **BLOCKER** from BizSpec affects your task → stop, comment on the Task, and tag the owner.
- A required reference pattern doesn’t exist → ask for one or propose a small RFC.
- A test requires external services you can’t mock trivially → note limitation, add a TODO for future contract/e2e, and keep unit scope.

---
