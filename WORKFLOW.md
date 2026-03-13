# Workflow - Concepts & Principles

> Deeper reading on the ideas behind this AI workflow. Start with [README.md](README.md) if you haven't set things up yet.

---

## 1) Prompting

We don't "chat," we **give jobs**. Clear role, inputs, constraints, expected outputs.

- **Role** (be explicit and contextual):  
  _"You are a **senior engineer** working with **[your stack]** in this repo. Follow our `.cursorrules`, `.cursor/rules/*.mdc`, and the relevant `.ai/standards/` files."_
- **Inputs**: point to Jira, relevant file paths, and tiny excerpts - not the whole repo.
- **Constraints**: code style, foldering, naming, error handling, and the **scope** of the task.
- **Output**: which files to change/create, which doc to update, which tests to add.
- **If unclear**: ask questions first. Don't assume requirements.

**Code standards notes**

- **Dead code removal**: clean up the **agent's own scaffolding/experiments** from iterations (temporary helpers, debug prints, unused imports/var/functions). Leave the codebase clean.
- **Avoid narrative comments** (agents love these):
  ```ts
  // Declaring bank balance
  const balance = x;
  ```
  Prefer comments that explain **why** a non-obvious decision exists, or reference the task if it's a workaround. Let code and tests say the **what**.

---

## 2) Context engineering

The model isn't magic - **context is the multiplier**. Good context means smaller prompts, better answers, fewer mistakes.

- **Pin standards**: point the agent to the **right standard per role**:
  - Biz/Tech planning modes -> link `.ai/standards/tech.md` + any API/contract docs.
  - Implementer mode -> link `.ai/standards/dev-playbook.md` + `.ai/standards/api-and-mocks.md` + specific module docs.  
    You can do this via links in the prompt **or** by encoding the mapping inside `.cursorrules` / `.cursor/rules/*.mdc` so the agent loads the right doc for the job.
- **New chat per task**: as chats get long, agents start to **perform worse** (drift, stale assumptions, cost). Create **scoped tasks** with fresh chats. Bring back only the **minimal pack** (Jira, BizSpec/TechPlan snippet, standards for that task).
- **IDs over walls of text**: reference files, functions, endpoints, feature flags by path/ID. The agent can open them via tools. Less prose, more pointers.
- **Keep context current**: refresh the tiny excerpts if Jira or code changed. Don't rely on week-old memory.

**Rule of thumb**: if a human would skim it in 60s, the agent should too. Trim the rest.

---

## 3) Cursor-based v3

v3 is **Cursor-based**.

That matters because the workflow is not only in markdown docs anymore:

- `.cursorrules` is the **legacy root router**.
- `.cursor/rules/*.mdc` are the **Cursor project rules**.
- These rules are scoped by file patterns, so the agent can automatically receive extra context when working on code, services, or tests.

In practice, this means v3 has two layers:

1. **Phase routing** - which workflow should run.
2. **File-context routing** - which standards should auto-attach while editing.

This is why the `.cursor/` folder matters in v3. Per Cursor's rules model, these rules affect Agent and Inline Edit / Cmd-K, not Cursor Tab.

---

## 4) DP as orchestrator

This is the biggest conceptual change from v2 to v3.

In v2, `PLAN:` was mainly a planning phase.
In v3, the **Dev Planner** has a much bigger role: it can also act as the **orchestrator** of the delivery flow.

After the BizSpec is ready and the TechPlan is approved, DP can:

1. Confirm implementation should start.
2. Run each planned task sequentially via `DO:`.
3. Keep the shared `output.md` coherent across tasks.
4. Trigger `IR:` after implementation is complete.
5. Present findings to the user.
6. Trigger `PATCH:` for approved fixes.
7. Repeat review / patch cycles if needed.
8. Hand off to `GIT:` when the implementation is actually ready.

So the real v3 flow is closer to:

`BA -> PLAN (+ orchestration) -> DO -> IR -> PATCH -> GIT`

The planner is no longer just a writer of `02-techplan.md`. It becomes the manager of the execution loop.

---

## 5) MCP

**What it is**: MCP gives the agent **precise access** to things it needs: Jira issues, Git/MRs, code files, and internal docs (like your UI lib). Instead of pasting big blobs, the agent **fetches exactly** the item by ID/path.

**How we use it (clean flow)**

1. **Business analysis** -> Jira MCP to read the issue and write acceptance bullets + open questions.
2. **Dev planner** -> **Context7 MCP** (library/docs search) and **UI lib MCP** (component library docs) to pull updated API/component info and produce a Tech Plan with examples and tasks.
3. **Implementer** -> same Context7/UI lib MCP to mirror patterns and use the right APIs.
4. **Git Ops** -> **Git MCP** to assemble the PR title/description from the tasks' `output.md`, ask for approval, and then create the MR with assignee/reviewers (CODEOWNERS).

**Why this matters**: fewer hallucinations, more **grounded** work. The agent touches **exact sources** instead of guessing from memory.

---

## 6) Guardrails

**What are guardrails?** The rules that define **what the agent can do**, **when it must ask**, and **how it should behave** when things are unclear. "With great power comes great responsibility".

- **Default-deny** tools: reads are easy; **writes require confirmation** or policy checks.
- **Scope guard**: touch **only** files/modules in the task. Anything outside -> ask first.
- **Ask, don't assume**: unclear requirement? missing pattern? open question in Jira? -> stop and ask. No "assumption coding."
- **Be critical**: add to your `.cursorrules`: _"Don't just be agreeable. Criticize when needed and propose safer alternatives."_ Important because agents tend to just agree with us.

**Editor posture**

- **VS Code** -> usually **confirms everything by default**. Add a **short allowlist** for safe reads/checks.
- **Cursor** -> tends to **allow a lot**. Change to confirmation by default, use `.cursorrules` for phase routing, and let `.cursor/rules/*.mdc` add the right file-level context.

**Suggested allow/confirm for beginners**

- Auto-allow: `mcp.read.*`, `cd`, `ls`, `grep`, `pnpm check`, `pnpm format`, `pnpm test`, `git status`, `git log`.
- Always confirm: `git add/commit/push`, package installs, shell scripts, CI config changes, MR/PR creation.

---

## 7) Testing

The agents can create e2e, unit, manual steps... This depends on the landscape of the project. We can add to our tech planning to create:

- **Co-locate** specs next to code: `*.spec.ts` under `src/`.
- Minimum: **one happy-path Vitest spec per acceptance bullet** touched by the task.
- Prioritize **services/stores/composables**; in components, test pure logic (events/formatting). UI-heavy flows -> manual steps for now.
- Put **manual steps** in `<task>/output.md` -> "How to test".

**Gherkin (light)** - turns acceptance into binary steps:

```text
Scenario: guest checkout on mobile
  Given I have items in the cart
  When I tap "Checkout"
  Then I see the payment screen with total and shipping
```

Mirror the **happy path** in a small Vitest spec. When a bug slips, add a spec and move on.

---

## 8) About models

AI is not magic. The spec is the most important aspect of AI usage. To achieve good coding results, the ticket (Jira / ClickUp / task / etc.) MUST be very well specified.

Also, in my last workflow iterations, I've been working to enhance project docs and check if the final results get better.

### I tested

- old OpenAI 4.x models: they did not act like agents. I needed to manually add files to context and it did not create steps. I did not test 5.x models yet.
- Gemini 3 Pro: ignored the workflow :) I haven't used it since.
- Claude models: I've mainly tested Opus and Sonnet. I did not use Haiku that much, but it might work well for coding. As my objective is not to keep testing different models, I've been using only Claude's models.
- Grok Code Fast: I didn't use it to plan. If the tasks are well planned, it's very good and fast to code.

### Prioritize reasoning models for the business analysis, tech planning, and tasks creation

- Claude Opus 4.6 and Opus 4.5
- Claude Sonnet 4.6

### Coding

- Claude Sonnet 4.6
- Claude Haiku 4.5
- Grok Code Fast 1

---

## Wrap up

- **Prompting**: roles, minimal inputs, explicit outputs; "ask, don't assume."
- **Context engineering**: `.cursorrules` + the right standards per mode; new chat per task; IDs over walls of text.
- **Cursor-based v3**: `.cursor/rules/*.mdc` matters; `.cursorrules` is still there, but it's the legacy format.
- **DP orchestration**: the planner now manages the implementation / review / patch loop.
- **MCP**: precise access to Jira/Git/docs/components; Context7/UI lib MCP for up-to-date info; Git MCP for PRs.
- **Guardrails**: default-deny, scope guard, be critical; confirmations in the editor.
- **Testing**: Vitest happy paths + manual steps, co-located.
- **Workflow**: BizSpec -> Tech Plan (+ tasks, orchestration) -> Implement -> Review -> Patch -> Git Ops -> PR

Small, clear, testable steps. The agent goes faster, and we keep control.
