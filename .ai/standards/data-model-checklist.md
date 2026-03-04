````markdown
# Data Model Checklist for API Integrations

> **Purpose:** Prevent data model misunderstanding bugs by asking the right questions before integrating any API endpoint.

---

## When to Use This Checklist

Use this checklist when:

- Integrating a new API endpoint
- Building maps/dictionaries from API responses
- Working with list/array data that needs to be grouped or aggregated
- Any ticket involves data transformation from backend to frontend

---

## API Integration Questions

Before writing code, answer these questions in your **BizSpec** or **TechPlan**:

### 1. Data Granularity

- **What level of detail does this endpoint return?**
  - Row-level (e.g., one row per transaction, per item, per detail record)
  - Entity-level (e.g., one row per user, per account, per resource)
  - Aggregated (e.g., summary data, totals, grouped results)

### 2. One-to-Many Relationships

- **Are there any 1:N relationships in the data?**
  - Can a single entity appear multiple times in the response?
  - Example: One parent entity → multiple child records → one row per child

### 3. Duplicate Keys

- **Can the same ID/key appear in multiple rows?**
  - If yes, what makes each row unique? (composite key?)
  - Example: `entity_id` appears in multiple rows (one per `detail_type`)

### 4. Aggregation Needs

- **Do you need to aggregate/deduplicate this data?**
  - Are you building a Map/Dictionary where keys must be unique?
  - If multiple rows have the same key, which value should "win"?

### 5. Null/Missing Values

- **Can key fields be null or missing?**
  - How should nulls be handled in aggregation?
  - Example: Prefer non-null values when merging rows

---

## Common Pitfalls

### Pitfall 1: Assuming 1:1 When It's 1:N

**Symptom:** Map building code blindly overwrites values

```typescript
// ❌ WRONG: Last row wins (overwrites previous values)
const map = new Map<string, number>();
for (const item of data) {
  map.set(item.key, item.value); // Overwrites if key already exists!
}
```

**Solution:** Define aggregation strategy

```typescript
// ✅ CORRECT: Prefer non-null values
const map = new Map<string, number>();
for (const item of data) {
  const existing = map.get(item.key);
  if (existing === undefined || (existing === null && item.value !== null)) {
    map.set(item.key, item.value);
  }
}
```

### Pitfall 2: Test Data Doesn't Match Reality

**Symptom:** Tests use simplified 1:1 data, missing duplicate key scenarios

```typescript
// ❌ WRONG: Test helper creates ONE row per entity
const createItem = (code: string, sort: number) => ({
  entity_id: code,
  detail_type: "DEFAULT",
  sort_order: sort,
});
```

**Solution:** Create realistic test data

```typescript
// ✅ CORRECT: Test with multiple detail types per entity
const mockData = [
  { entity_id: "ENT-001", detail_type: "TYPE_A", sort_order: 10 },
  { entity_id: "ENT-001", detail_type: "TYPE_B", sort_order: null }, // ← Duplicate!
];
```

### Pitfall 3: Missing Edge Cases in Tests

**Symptom:** Only happy path tested, no boundary conditions

**Missing scenarios:**

- Duplicate keys with conflicting non-null values
- All rows for a key have null values
- Empty arrays, single-item arrays
- Partial data (some expected fields missing)

---

## Aggregation Strategies

When multiple rows exist for the same key, choose a strategy:

| Strategy              | When to Use                                 | Example                                              |
| --------------------- | ------------------------------------------- | ---------------------------------------------------- |
| **First-wins**        | Rows are pre-sorted, first is authoritative | Use first timestamp, ignore later updates            |
| **Last-wins**         | Most recent data is correct                 | Overwrite with latest value                          |
| **Prefer-non-null**   | Sparse data, nulls are "no data"            | Use first non-null value encountered                 |
| **Merge**             | Combine data from multiple rows             | Aggregate arrays, sum numbers, union sets            |
| **Error-on-conflict** | Duplicates are a bug                        | Throw error if non-null values differ                |
| **Max/Min**           | Numeric data, need extreme value            | Use highest/lowest value                             |

**Document your strategy in the TechPlan!**

---

## Test Data Requirements

### Realistic Mock Data Must Include:

1. **Duplicate keys** (if API allows)

   - Same ID with different detail rows
   - Test aggregation logic

2. **Mixed null/non-null values**

   - Some rows have data, others don't
   - Test null handling

3. **Edge counts**

   - Empty arrays `[]`
   - Single-item arrays `[{...}]`
   - Large arrays (50+ items if performance matters)

4. **Boundary values**

   - Empty strings `""`
   - Zero `0` vs `null`
   - Negative numbers
   - Very long strings

5. **Multi-tier relationships** (if applicable)
   - Parent → Children → Grandchildren
   - Test cascade effects

---

## Case Study Template

When a data model bug is found, document it here:

**Bug:** [Description of what broke]

**Root Cause:**

- Data model misunderstanding: treated X as 1:1 when it's 1:N
- No aggregation logic: simple `map.set()` overwrote previous values
- Test data: all tests used simplified data, never revealing the bug

**Fix Applied:**

- [Aggregation strategy chosen]
- [Tests added to cover the scenario]

````
