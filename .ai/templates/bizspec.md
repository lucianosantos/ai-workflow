---
schema: ai/ba@1
jira: <JIRA-ID>
developmentReady: <NOT_READY|NEEDS_ANALYSIS|READY>
non_goals: [<out-of-scope>]
metrics:
  primary: "<e.g., +X% completion>"
  guardrails: ["<e.g., error rate ≤ Y%>", "<CLS unchanged>"]
updatedAt: { now:<ISO8601> }
---

## Summary

<short description of the issue>

## Data Model & Assumptions

> **Note:** Fill this section if the ticket involves API integration. Reference `.ai/standards/data-model-checklist.md` for guidance.

**API Endpoint(s):** <endpoint name(s), e.g., `get_items`>

**Data Granularity:** <What level does the API return data? e.g., "Row per detail item" vs "Row per entity">

**One-to-Many Relationships:** <Any 1:N relationships? e.g., "One parent → many children">

**Duplicate Keys Expected:** <Can the same ID/key appear multiple times? e.g., "Yes - entity_id repeats per detail type">

**Aggregation/Deduplication Needed:** <Yes/No. If yes, briefly describe strategy or add to Open Questions>

## Explicit Requirements

- ...

## Implicit Requirements

- ...

## Acceptance Criteria (Gherkin)

- AC-1:
  Scenario: ...
  Given ...
  When ...
  Then ...

## Edge Cases

- ...

## Open Questions

- OQ-1: ...
- OQ-2: ...
