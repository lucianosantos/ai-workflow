---
schema: ai/ba@2
jira: <TICKET-ID>
title: "<Ticket title>"
priority: <Critical|High|Medium|Low>
stakeholders: ["<role or name>"]
dependencies: ["<TICKET-ID or description>"]
developmentReady: <NOT_READY|NEEDS_ANALYSIS|READY>
non_goals: ["<out-of-scope item>"]
metrics:
  primary: "<measurable outcome>"
  guardrails: ["<risk guardrail>", "<quality guardrail>"]
updatedAt: <ISO8601>
---

## Summary

<short description of the problem or change>

## Data Model And Assumptions

> Fill this section for API or data-heavy work. Reference `.ai/standards/data-model-checklist.md`.

**API Endpoint(s):** <endpoint name(s), e.g. `get_entity_attributes`>

**Data Granularity:** <e.g. "one row per detail record" vs "one row per entity">

**One-To-Many Relationships:** <e.g. "one entity -> many detail records">

**Duplicate Keys Expected:** <e.g. "yes - entity_id may repeat per detail_type">

**Aggregation/Deduplication Needed:** <yes/no and brief note>

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

- [BLOCKER] OQ-1: ...
- [INFO] OQ-2: ...
