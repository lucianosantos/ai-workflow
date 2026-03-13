# Testing Standards

## Scope & Focus

- **Test YOUR business logic**, not framework/library behavior
- **Skip:** Column existence checks, component registration, mocked helper function internals, framework state tracking (unless you own the logic)
- **Focus:** Value transformations, business rules (valueSetter logic, computed properties), edge cases in YOUR code
- **If you can't test without real dependencies** -> skip the test or mark as integration test (don't test mocked behavior)

## Test Naming

- Use **plain English** describing the behavior being tested
- BAD: `"AC-1: Column definition includes sort_order"`
- GOOD: `"should accept valid value within max+1 range and return true"`
- **No AC/EC IDs in test descriptions** - those map to task DoD checklists, not test file names
- Describe **what** is tested, not **which requirement** it satisfies

## Validation Separation

- **Component-level validation** (for example, shared input/editor min/max or fraction digits):
  - Trust the component - don't duplicate validation in valueSetter
  - Don't test param existence if the component is already mocked
- **Business-level validation** (for example, auto-correction, dynamic max calculation):
  - Own it - implement it in your code
  - Test it - cover happy paths and edges
- **Rule:** If validation can be expressed as a component param -> use the param. Only add custom logic for business rules the component doesn't support.

## Mocking Strategy

- Use `/src/test-utils/mocks/` for reusable mocks when the repo already has them
- **Helper function mocks** should be **pass-through** when possible: `vi.fn((params) => params || {})`
- **Never test mocked behavior** - if you mock it, you're testing your mock, not the code
- **Mock shared UI dependencies** via the repository's common mock module. Do not create ad-hoc inline mocks if a centralized mock already exists.

## Coverage Target

- **~1-3 tests per AC**: Happy path + 1-2 edges if complex
- **Cover:** Happy paths (one per AC), critical edge cases (null, boundary values, type coercion), business logic branches
- **Add comments** in test file if skipping obvious cases that are intentionally handled by a trusted shared component

## General Best Practices

- **Test failures must be addressed**: Never proceed with implementation if tests fail - either fix the test, mock dependencies, or document blockers. Never proceed with failing tests.
- **Vitest specs**: Co-locate with implementation files (e.g., `Component.vue` -> `Component.spec.ts`)
- **Vue component testing**: When testing components with conditional computed properties, ensure all dependencies are properly configured
- **Literal expectations**: Use literal values in assertions, not computed values. `expect(result).toBe("2025-10-30")` NOT `expect(result).toBe(formatISO(date))`.

---

## Edge Cases & Environment Variations

### Test Coverage Philosophy

**Not enough:** 1 happy path test per AC
**Better:** Happy path + documented obvious edges
**Best:** Happy path + edge cases + environment variations

### Date/Time Testing (REQUIRED for any date handling)

**When to use:** Any code that:

- Calls `parseISO()`, `new Date()`, `formatISO()`, or date-fns functions
- Stores/displays dates or timestamps
- Calculates date ranges or offsets

**Test pattern for DATE-ONLY fields:**

```typescript
describe("Date handling (timezone-sensitive)", () => {
  const originalTZ = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTZ;
  });

  it.each([
    ["America/New_York", "UTC-5", "2025-10-30"],
    ["America/Sao_Paulo", "UTC-3", "2025-10-30"],
    ["Europe/London", "UTC+0", "2025-10-30"],
    ["Asia/Tokyo", "UTC+9", "2025-10-30"],
    ["Australia/Sydney", "UTC+10", "2025-10-30"],
  ])("preserves date %s in %s timezone", (timezone, _offset, expectedDate) => {
    process.env.TZ = timezone;
    vi.setSystemTime(new Date());

    const result = parseDateField("2025-10-30T00:00:00Z");

    expect(formatAsISODate(result)).toBe(expectedDate);
  });

  it("handles date-only strings without timezone conversion", () => {
    process.env.TZ = "America/Sao_Paulo";

    const result = parseDateField("2025-10-30");

    expect(formatAsISODate(result)).toBe("2025-10-30");
  });
});
```

**Red flags that require timezone tests:**

- Using `parseISO()` on date-only fields -> Risk: timezone conversion
- Using `new Date(isoString)` -> Risk: UTC interpretation
- Displaying dates without normalizing timezone -> Risk: date shifts

**Safe patterns for DATE-ONLY fields:**

```typescript
// GOOD: Parse as local date (no timezone conversion)
const dateStr = "2025-10-30T00:00:00Z".split("T")[0];
const [year, month, day] = dateStr.split("-").map(Number);
const localDate = new Date(year, month - 1, day);

// BAD: Parses as UTC, converts to local (causes date shifts)
const utcDate = parseISO("2025-10-30T00:00:00Z");
```

### Edge Case Checklist

**If code handles dates/times:**

- [ ] Test multiple timezones (UTC-5, UTC+0, UTC+10) - use `process.env.TZ`
- [ ] Test ISO format variations (`"YYYY-MM-DD"` vs `"YYYY-MM-DDTHH:mm:ssZ"`)
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

### Anti-Patterns to Avoid

#### Computed expected values (masks bugs)

```typescript
// BAD: Expected value is computed using same logic that might be broken
it("formats date correctly", () => {
  const inputDate = new Date("2025-10-30T00:00:00Z");
  const result = formatDate(inputDate);
  expect(result).toBe(formatISO(inputDate, { representation: "date" }));
});
```

#### Better: Literal expected values

```typescript
it("formats date correctly", () => {
  const inputDate = new Date("2025-10-30T00:00:00Z");
  const result = formatDate(inputDate);
  expect(result).toBe("2025-10-30");
});
```

#### Insufficient edge case coverage

```typescript
// BAD: Only tests happy path
it("calculates total", () => {
  expect(calculateTotal([1, 2, 3])).toBe(6);
});
```

#### Better: Test edges too

```typescript
it("calculates total for valid numbers", () => {
  expect(calculateTotal([1, 2, 3])).toBe(6);
});

it("handles empty array", () => {
  expect(calculateTotal([])).toBe(0);
});

it("handles array with nulls", () => {
  expect(calculateTotal([1, null, 3])).toBe(4);
});
```

#### Timezone-blind date tests

```typescript
// BAD: Only tests in UTC (default test environment)
it("parses snapshot date", () => {
  const result = parseSnapshotDate("2025-10-30T00:00:00Z");
  expect(result).toBe("2025-10-30");
});
```

#### Better: Test multiple timezones

```typescript
it.each([
  ["America/Sao_Paulo", "2025-10-30"],
  ["Asia/Tokyo", "2025-10-30"],
])("parses date correctly in %s timezone", (tz, expected) => {
  process.env.TZ = tz;
  const result = parseSnapshotDate("2025-10-30T00:00:00Z");
  expect(result).toBe(expected);
});
```
