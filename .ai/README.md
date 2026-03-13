# AI Agent Workflow

This repository defines a **role-based AI development system**.
AI agents (running in Cursor IDE) act as **specialized collaborators** through distinct phases, each producing structured artifacts that feed the next.

The system is **file-driven**: each agent reads the relevant `.ai/workflows/*.md` guide, consumes input artifacts, and produces structured outputs under `.ai/tasks/{JIRA}/`.

---

## Entry Points

- **Router**: `.cursorrules` - dispatches to the correct workflow based on text shortcuts
- **Auto-applied rules**: `.cursor/rules/*.mdc` - context-specific standards applied when editing matching files
- **Workflows**: `.ai/workflows/*.md` - canonical phase specs
- **Standards**: `.ai/standards/*.md` - coding, testing, API patterns

---

## Folder Structure

```text
.ai/
|-- workflows/              # Workflow definitions (what each role does)
|   |-- ba.md               # Business Analysis
|   |-- dp.md               # Dev Planner + Orchestration
|   |-- di.md               # Dev Implementer
|   |-- patch.md            # In-flight fix / refinement
|   |-- implementation-review.md  # Post-implementation review
|   |-- code-review.md      # MR/PR code review
|   |-- gitops.md           # Git operations (branch, commit, MR)
|   `-- docs-mode.md        # Documentation generator (triggers + protocol)
|
|-- standards/              # Coding and quality standards
|   |-- core.md             # Architecture, coding, quality (primary)
|   |-- tech-standards.md   # Router to context-specific standards
|   |-- api-and-mocks.md    # API integration and mock patterns
|   |-- crud.md             # CRUD operation patterns
|   |-- dev-playbook.md     # Implementation discipline
|   |-- test-playbook.md    # Testing conventions
|   |-- data-model-checklist.md  # API data model verification
|   `-- e2e-test-priorities.md   # E2E test priority list
|
|-- templates/              # Canonical templates for artifacts
|   |-- bizspec.md          # Business Analysis output
|   |-- techplan.md         # Technical Plan
|   |-- techtask.md         # Task specification
|   |-- output.md           # Implementation output (per JIRA)
|   |-- mr.md               # Merge Request description
|   |-- page-doc.md         # Page documentation
|   `-- component-doc.md    # Component documentation (per-component)
|
|-- docs/                   # Generated documentation
|   |-- pages/              # Per-page documentation
|   `-- components/         # Per-component documentation (path-based naming)
|
`-- tasks/                  # Per-JIRA artifacts (ephemeral, per branch)
    `-- PROJ-1234/
        |-- 01-bizspec.md   # BA output
        |-- 02-techplan.md  # DP output
        |-- output.md       # DI output (single file, appended per task)
        `-- task-N/
            `-- task.md     # Individual task spec
```

---

## Phase Flow

```text
BA: -> BizSpec -> PLAN: -> TechPlan + Tasks -> DO: -> Implementation + Output
                                                      |
                                              IR: -> Review findings
                                                      |
                                              PATCH: -> Fix findings
                                                      |
                                              GIT: -> MR creation
```

## Text Shortcuts

| Shortcut | Phase                 | Workflow                   |
| -------- | --------------------- | -------------------------- |
| `BA:`    | Business Analysis     | `ba.md`                    |
| `PLAN:`  | Dev Planner           | `dp.md`                    |
| `DO:`    | Dev Implementer       | `di.md`                    |
| `PATCH:` | In-flight fix         | `patch.md`                 |
| `IR:`    | Implementation Review | `implementation-review.md` |
| `CR:`    | Code Review           | `code-review.md`           |
| `GIT:`   | Git Operations        | `gitops.md`                |
| `DOCS:`  | Documentation         | `docs-mode.md`             |

---

## Model Recommendations

| Phase                | Model             | Rationale                |
| -------------------- | ----------------- | ------------------------ |
| BA, DP, IR, CR, DOCS | Claude Opus 4.6   | Deep reasoning, analysis |
| DI, GIT, PATCH       | Claude Sonnet 4.6 | Fast, pattern-following  |

## Next improvements

- How to quickly install into a new project.
- Docs regenerated on GitHub Actions.
- Kiro
- SonarQube, code complexity
- Check existing workflows