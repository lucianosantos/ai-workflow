# AI Workflow

A file-driven system that turns AI agents into **structured collaborators** - from Jira analysis to PR creation. Instead of one-shot prompts, you get specialized roles with guardrails, templates, and traceability.

The idea: you copy `.ai/`, `.cursor/`, and `.gitlab/` into your project, adapt the standards to your codebase, and you have an AI workflow that actually follows your patterns.

---

## What this is

A set of markdown files that tell AI agents **how to work**:

- **Business Analyst** - reads Jira, writes acceptance criteria (Gherkin), flags blockers.
- **Dev Planner / Orchestrator** - produces a tech plan with tasks, risks, test mapping, and data contracts. In v3, when you're using Cursor, it can also orchestrate `DO -> IR -> PATCH`.
- **Dev Implementer** - implements tasks following reference patterns, writes tests, documents output.
- **Implementation Reviewer** - reviews code against BizSpec and TechPlan before PR.
- **Patch mode** - applies approved fixes during the same ticket flow.
- **Code Reviewer** - reviews PRs against standards and ACs.
- **Git Ops** - assembles PR from task outputs, handles branch/commit/push with confirmation gates.
- **Docs Generator** - documents existing pages/features by reading actual code.

Each role has a workflow file (`.ai/workflows/`), uses templates (`.ai/templates/`), and follows standards (`.ai/standards/`). Artifacts land in `.ai/tasks/<JIRA-ID>/`.

---

## How it works

```text
Jira ticket
  -> BA: writes 01-bizspec.md (ACs, edge cases, open questions)
  -> Planner: writes 02-techplan.md (approach, tasks, test plan)
  -> Planner: if approved, can orchestrate DO -> IR -> PATCH in Cursor
  -> Implementer: implements task-N, writes tests, updates output.md
  -> Implementation Reviewer: reviews against BizSpec, TechPlan, and ticket
  -> Patch: applies approved fixes
  -> Git Ops: compiles output into PR with previews + confirmation
```

One artifact per phase. No duplication. If something is unclear, it goes into **Open Questions** - tagged `[BLOCKER]` if it blocks the next phase.

### v3 note: DP became the orchestrator

In v2, the planner stopped at the TechPlan. In v3, when you're using Cursor, `PLAN:` can continue as the workflow manager: run `DO:` task by task, trigger `IR:`, apply approved `PATCH:` fixes, and hand off to `GIT:` only when the implementation is actually ready.

---

## Cursor-based v3

v3 is designed around **Cursor**.

- `.cursor/rules/*.mdc` contains **Cursor project rules** scoped by file patterns.
- `.cursorrules` is still present as a root router, but this is the legacy Cursor format.
- The `.cursor/rules/` files are where v3 gets file-type-specific auto-context like code, service, and test guidance. In Cursor, these rules apply to Agent and Inline Edit / Cmd-K, not Tab autocomplete.

In this repo, the `.cursor` folder is not decorative. It is part of the v3 design.

---

## Project structure

```text
.ai/
├── workflows/        # What each role does (BA, Planner, Implementer, Git, Review, Patch, Docs)
├── standards/        # Code standards, testing, API/mock conventions, CRUD patterns
├── templates/        # Templates for BizSpec, TechPlan, tasks, output, MR, page docs
├── tasks/            # Per-Jira artifacts (created per branch, ephemeral)
└── docs/             # Page and shared component documentation

.cursor/
└── rules/            # Cursor project rules (.mdc), auto-attached by file context

.gitlab/
├── CODEOWNERS
└── merge_request_templates/

mcp/                  # Custom MCP servers (Jira, GitLab, UI component library)
```

---

## Getting started

1. **Copy** `.ai/`, `.cursor/`, and `.gitlab/` into your project root.
2. **Adapt standards** - update `.ai/standards/core.md` with your tech stack, component library, and patterns.
3. **Set up MCP servers** (optional) - see `mcp/README.md` for Jira, GitLab, and UI lib integration.
4. **Configure your editor** - `.cursorrules` handles phase routing and `.cursor/rules/*.mdc` adds file-type context in Cursor.

### Shortcuts

| Shortcut | What it does |
|---|---|
| `BA: <JIRA-ID>` | Run Business Analysis |
| `PLAN: <JIRA-ID>` | Create Tech Plan and optionally orchestrate implementation in Cursor |
| `DO: <JIRA-ID> task<n>` | Implement a task |
| `PATCH: <JIRA-ID>` | Apply approved fixes for the active ticket |
| `IR: <JIRA-ID>` | Review implementation |
| `GIT: <JIRA-ID>` | Git operations (branch, commit, PR) |
| `DOCS: <page-name>` | Document a page |

---

## Prompting

We don't "chat," we **give jobs**. Clear role, inputs, constraints, expected outputs.

- **Role**: be explicit - _"You are a senior engineer working with [your stack] in this repo."_
- **Inputs**: point to Jira, relevant file paths, tiny excerpts. Not the whole repo.
- **Constraints**: code style, folder structure, naming, scope.
- **Output**: which files to change, which docs to update, which tests to add.
- **If unclear**: ask questions first. Don't assume.

### Code standards notes

- **Dead code removal**: clean up the agent's own scaffolding from iterations. Leave the codebase clean.
- **Avoid narrative comments** - agents love `// Declaring bank balance`. Prefer comments that explain **why**, not **what**.

---

## Context engineering

The model isn't magic - **context is the multiplier**. Good context = smaller prompts, better answers, fewer mistakes.

- **Pin standards per role**: BA mode -> `tech-standards.md`. Implementer -> `dev-playbook.md` + `api-and-mocks.md`.
- **Use Cursor rules intentionally**: `.cursorrules` routes phases, while `.cursor/rules/*.mdc` can auto-attach code, service, and test guidance.
- **New chat per task**: long chats make agents drift. Fresh chat, minimal context pack (Jira, BizSpec snippet, relevant standards).
- **IDs over walls of text**: reference by path/ID. The agent can open files via tools.
- **Keep context current**: don't rely on week-old memory.

Rule of thumb: if a human would skim it in 60 seconds, the agent should too. Trim the rest.

---

## MCP

MCP gives the agent **precise access** to the things it needs - Jira issues, Git/MRs, code files, internal docs.

**How the flow uses it:**

1. **BA** -> Jira MCP reads the issue, writes acceptance bullets + open questions.
2. **Planner** -> Context7 MCP (library docs) + UI lib MCP (component API) -> produces TechPlan with examples and tasks.
3. **Implementer** -> same MCPs to mirror patterns and use the right APIs.
4. **Git Ops** -> Git MCP assembles the PR from task outputs, creates MR with assignees/reviewers.

Fewer hallucinations, more grounded work. The agent touches exact sources instead of guessing.

---

## Guardrails

The rules that define what the agent can do, when it must ask, and how it should behave when things are unclear.

- **Default-deny** tools: reads are easy; writes require confirmation.
- **Scope guard**: touch only files/modules in the task. Anything outside -> ask first.
- **Ask, don't assume**: unclear requirement? Stop and ask.
- **Be critical**: add to your rules - _"Don't just be agreeable. Criticize when needed."_ Agents tend to just agree with us.

### Suggested allow/confirm

- Auto-allow: `mcp.read.*`, `cd`, `ls`, `grep`, `pnpm check`, `pnpm format`, `pnpm test`, `git status`, `git log`.
- Always confirm: `git add/commit/push`, package installs, shell scripts, CI config changes, MR/PR creation.

---

## Testing

- **Co-locate** specs next to code: `*.spec.ts` under `src/`.
- Minimum: **one happy-path Vitest spec per AC** touched by the task.
- Prioritize **services/stores/composables**; in components, test pure logic. UI-heavy flows -> manual steps.
- Put **manual steps** in the task output -> "How to test".

**Gherkin (light)** - turns acceptance into binary steps:

```text
Scenario: guest checkout on mobile
  Given I have items in the cart
  When I tap "Checkout"
  Then I see the payment screen with total and shipping
```

Mirror the happy path in a Vitest spec. When a bug slips, add a spec and move on.

---

## Model notes

See [WORKFLOW.md](WORKFLOW.md) for model notes and the running test log.
