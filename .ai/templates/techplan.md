---
schema: ai/techplan@2
jira: <JIRA-ID>
updatedAt: <ISO8601>
---

## Impact Analysis (planned)

- Direct: ...
- Shared: ...
- Cross-feature: ...

## Tasks (INVEST, short)

- <JIRA>-1: <title> (AC-1) → files, routes
- <JIRA>-2: <title> (AC-2) → files, routes

## Risks / Dependencies

- ...

## Edge Cases & Environment Variations

> **Red flags requiring edge case analysis:** Any use of `parseISO()`, `new Date()`, date formatting, array aggregation, or data deduplication.

**Date/Time Edge Cases** (REQUIRED for any date handling):

- [ ] **Timezone handling**: Document behavior in UTC-5, UTC+8, etc.
  - Test strategy: Set `process.env.TZ` in tests or use timezone-aware utilities
  - Expected: Does code need to preserve dates regardless of timezone? If YES → use local date parsing
- [ ] **Date-only vs DateTime**: Is this a date-only field that should ignore time/timezone?
  - If DATE-ONLY → Use local date parsing (e.g., `new Date(year, month, day)`)
  - If DATETIME → Document expected timezone behavior explicitly
- [ ] **ISO string format variations**: Test both `"2025-10-30"` and `"2025-10-30T00:00:00Z"`
- [ ] **DST boundaries**: If applicable, test daylight saving time transitions

**Example:**

```
Edge-Timezone-1: User in UTC-3 loads record with date "2025-10-30T00:00:00Z"
  Expected: record_date = "2025-10-30" (not "2025-10-29")
  Test: Set TZ=America/Sao_Paulo in test environment
  Priority: HIGH
```

**Data Structure Edge Cases** (for API integrations):

- [ ] Duplicate IDs/keys with conflicting values
- [ ] One-to-many relationships with mixed null/non-null values
- [ ] Empty arrays vs single-item arrays vs large datasets
- [ ] Null/undefined handling for required vs optional fields

## Validation Plan

- Local tests + `pnpm check`
- Routes to test: [/..., /resource-management?...]

## API Docs

- Specify relevant API docs here if needed

### Data/Contracts

> **Note:** For endpoints returning arrays/lists, specify aggregation logic below.

**Request/Response Examples:**

```json
// Request
{ "method": "...", "params": {...} }

// Response
{ "result": [...] }
```

**Date/Time Semantics** (REQUIRED if any date/time fields present):

For each date/time field, specify:

- **Field name:** `<field_name>`
- **Semantic type:** DATE-ONLY | DATETIME | TIMESTAMP
- **Timezone handling:** TIMEZONE-AGNOSTIC | TIMEZONE-AWARE (specify which timezone)
- **Format(s):** e.g., "ISO 8601 string", "Date object", "YYYY-MM-DD"
- **Parsing strategy:** How to parse without timezone corruption (e.g., "Extract date components, create local Date")
- **Rationale:** Why this semantic type? (e.g., "Historical dates should be consistent regardless of user timezone")

Example:

```
- Field name: record_date
- Semantic type: DATE-ONLY
- Timezone handling: TIMEZONE-AGNOSTIC (date should be same in all timezones)
- Format(s): ISO string ("2025-10-30T00:00:00Z") or Date object
- Parsing strategy: Extract date portion only, parse as local date: new Date(year, month-1, day)
- Rationale: Record dates represent "as of" dates that should display consistently regardless of user location
```

**Data Aggregation Logic** (if applicable):

- **Deduplication Required:** <Yes/No>
- **Aggregation Strategy:** <first-wins / last-wins / prefer-non-null / merge / error-on-conflict>
- **Duplicate Key Handling:**
  - Key field(s): <e.g., `entity_id`>
  - Scenario: <e.g., "Same entity with multiple detail types, mixed values">
  - Resolution: <e.g., "Use first non-null value">
- **Edge Case - Conflicting Values:** <How to handle if same key has different non-null values?>
