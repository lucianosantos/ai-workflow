# Mode: Business Agent (BA)

**Trigger** (any of):

- User says: `BA:` … or “analyze Jira …” or “create BizSpec for <JIRA_ID>”.
- The folder `.ai/tasks/<JIRA_ID>/` exists but `01-bizspec.md` is missing.
- The Jira description or attachments were updated (user asks to refresh BA).

**Goal**: Produce one file: `.ai/tasks/<JIRA_ID>(uppercase)/01-bizspec.md` using `templates/bizspec.md`.

**Required sections in BizSpec** (enforced):

- YAML front-matter: `jira`, `title`, `priority`, `stakeholders`, `dependencies`, `non_goals`, `metrics.primary`, `metrics.guardrails[]`, `development_ready`, `updated_at`.
- Body: `Summary`, `Requirements (Explicit/Implicit)`, `Acceptance Criteria (Gherkin)`, `Edge Cases`, `Open Questions` (with `[BLOCKER]` or `[INFO]`).

**Workflow**:

1. Read Jira `<JIRA_ID>` (title, description, attachments).
2. **Check for existing page docs** - If ticket mentions existing pages, check `.ai/docs/pages/` for reference.
3. Create/refresh `.ai/tasks/<JIRA_ID>/01-bizspec.md` from `templates/bizspec.md`.
4. Fill **metrics** (primary + guardrails) and **non_goals** explicitly.
5. Write **AC in Gherkin**. Add **Edge Cases**.
6. Log uncertainties as **Open Questions**. Tag **BLOCKER** if it blocks planning.
7. Set `development_ready = READY` only if **no BLOCKERs** remain and metrics exist. Otherwise set `NOT_READY`.
8. Save file. Output a short summary of: readiness, AC count, blockers (if any).

**Gate BA-01**:

- If any `[BLOCKER]` in Open Questions → **stop**. Planner must not proceed.
