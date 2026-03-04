# Mode: Dev Planner (DP)

**Trigger**:

- User says: `PLAN:` … or “create TechPlan for <JIRA_ID>”.
- BizSpec exists with `development_ready = READY`.

**Inputs**:

- BizSpec (business requirements, ACs, edge cases, metrics)
- Jira ticket (technical context: API contracts, data models, attachments, comments)

**Goal**: Produce `.ai/tasks/<JIRA_ID>(uppercase)/02-techplan.md` (use `templates/techplan.md`).

**Required content** (keep terse; IDs > prose):

- **Tech standards**: use `.ai/standards/tech-standards.md`
- **Approach (C4)**: Context/Containers/Components/Code (bullets, with IDs that map to tasks).
- **Decisions (ADR bullets)**: decision → consequence → rollback/flag.
- **Data/Contracts**: request/response examples, event names + required props.
- **Test Plan & Traceability table**: Map each BA **AC** → **test type(s)** → **location** (e.g., Playwright, contract test, unit).
- **Tasks (INVEST)**: `task-n` with DoD + risk + test refs. Don't create overly simple tasks, e.g., task to add a function or 1 simple ui component. Also, if the plan is too big (> 5 tasks), warn the user about creating smaller Jiras.
- **Risks & Mitigations**, **Rollout/Flags**.

**Workflow**:

1. Load BizSpec; **reject** if `development_ready != READY`.
2. Load Jira ticket for technical context (API endpoints, data models, attachments, comments).
3. **Check page docs** - If modifying existing pages, read `.ai/docs/pages/<page-name>.md` for patterns, architecture, and constraints.
4. Identify existing components that will be modified/reused
5. Draft TechPlan; ensure **every AC** maps to at least one test entry.
6. Create task stubs under `.ai/tasks/<JIRA_ID>/task-<n>/task.md:` (title + DoD + test checklist).
7. Save plan + tasks.

**Gate DP-01**:

- If any BA AC lacks a test mapping → **stop** (TechPlan not ready).

**Gate DP-02 (Data Model)**:

- **Trigger:** TechPlan mentions API endpoint integration AND response contains arrays/lists
- **Pattern detection (auto-trigger):**
  - Data/Contracts section shows array response: `"result": [...]`
  - OR TechPlan mentions: "endpoint", "API", "service call", "integration"
- **Validation:**
  - "Data/Contracts" section includes "Data Aggregation Logic" subsection (if applicable)
  - OR Open Questions includes `[BLOCKER]` or `[INFO]` about aggregation strategy
  - OR explicit note: "No aggregation needed - endpoint returns single object"
- **Stop condition:**
  - API returns array/list data
  - AND no aggregation logic specified
  - AND no Open Question logged about it
  - → Add `[BLOCKER] OQ-X: How should duplicate <key> values be handled? What aggregation strategy should be used?` to TechPlan and **stop**
- **Applies to:** All tasks - task size does not reduce data model rigor
