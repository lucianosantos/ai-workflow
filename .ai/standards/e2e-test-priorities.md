````markdown
# E2E Test Priorities

## Philosophy

E2E tests should cover **critical user workflows** that:

1. Have high business impact if broken
2. Involve complex interactions (grids, filters, state)
3. Cross multiple components/features
4. Are difficult to test with unit tests

**NOT for E2E:**

- Simple form validation (unit test)
- Pure function logic (unit test)
- Internal component state
- Every edge case (save those for unit tests)

---

## Priority Template

Use this template to define your top e2e test priorities:

### [Priority N]: [Feature Name]

**File:** `cypress/e2e/feature-name.cy.ts`

**Why Critical:**

- [Business impact reason]
- [Complexity reason]
- [Past bug history, if any]

**User Flow:**

```
1. Navigate to [page]
2. Perform [action]
3. Verify [expected result]
4. Handle [edge case]
```

**Mocking Strategy:**

- Use real component + MSW to intercept API
- Mock backend response with expected data

**Test Cases:**

- Happy path: [description]
- Edge case: [description]
- Error handling: [description]
- Cancel: [description]

**Time:** ~[N] seconds

---

## Test Data Strategy

### Option 1: Real Backend with Test Data (Recommended)

- Run backend in Docker for CI
- Seed with known test data via migrations
- Stable, predictable
- Slower (~5-10 seconds overhead)

### Option 2: MSW Interceptors

- Mock all API calls with MSW
- Deterministic responses
- Fast (~0 seconds overhead)
- Maintenance cost: Keep mocks in sync

### Option 3: Hybrid

- Use real backend for reads (GET)
- Mock writes (POST/PUT/DELETE) to avoid polluting DB
- Balance of realism + speed

---

## Success Metrics

**Don't measure:**

- Number of tests (ego metric)
- Code coverage % (misleading)
- Lines of test code

**Do measure:**

- Bugs caught in CI before production
- Regressions prevented
- Developer confidence when refactoring
- Time to identify root cause when test fails

**Goal:** If a user-facing feature breaks, **an E2E test should fail**. If an E2E test fails, a **user would notice**.

---

## Maintenance Plan

- **Review quarterly:** Remove tests for deprecated features
- **Update on API changes:** Adjust mocks/expectations
- **Keep page objects DRY:** Extract common patterns
- **Run locally before MR:** `pnpm test:e2e:dev`
- **Don't skip failing tests:** Fix immediately or revert code

````
