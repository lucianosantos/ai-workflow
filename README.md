## 1) About — the objective

AI becomes more powerful each time we talk about it.

The objective is to present tools we can use to help development, where AI can help since the Jira until PR creation. Some things that are important on this:

-   Jira's objective done without messing other features.
-   Following our code standards.
-   Designing tests, automated and manual.

To reach this objetive, we need to understand some important topics about AI development.

## 2) Prompting

We don’t “chat,” we **give jobs**. Clear role, inputs, constraints, expected outputs.

-   **Role** (be explicit and contextual):  
    _“You are a **senior engineer** working with **Vue 3 + TypeScript + Pinia + Vite** in this repo. Follow our `.cursorrules` and `tech-standards.md`.”_
-   **Inputs**: point to Jira, relevant file paths, and tiny excerpts — not the whole repo.
-   **Constraints**: code style, foldering, naming, error handling, and the **scope** of the task.
-   **Output**: which files to change/create, which doc to update, which tests to add.
-   **If unclear**: ask questions first. Don’t assume requirements.

**Code standards notes**

-   **Dead code removal**: clean up the **agent’s own scaffolding/experiments** from iterations (temporary helpers, debug prints, unused imports/var/functions). Leave the codebase clean.
-   **Avoid narrative comments** (agents love these):
    ```ts
    // Declaring bank balance
    const balance = x;
    ```
    Prefer comments that explain **why** a non-obvious decision exists, or reference the task if it's a workaround. Let code and tests say the **what**.

## 3) Context engineering

The model isn’t magic — **context is the multiplier**. Good context means smaller prompts, better answers, fewer mistakes.

-   **Pin standards**: point the agent to the **right standard per role**:
    -   Biz/Tech planning modes → link `tech-standards.md` + any API/contract docs.
    -   Implementer mode → link `dev-playbook.md` + `api-and-mocks.md` + specific module docs.  
        You can do this via links in the prompt **or** by encoding the mapping inside `.cursorrules` so the agent loads X or Y doc depending on mode.
-   **New chat per task**: as chats get long, agents start to **perform worse** (drift, stale assumptions, cost). Create **scoped tasks** with fresh chats. Bring back only the **minimal pack** (Jira, BizSpec/TechPlan snippet, standards for that task).
-   **IDs over walls of text**: reference files, functions, endpoints, feature flags by path/ID. The agent can open them via tools. Less prose, more pointers.
-   **Keep context current**: refresh the tiny excerpts if Jira or code changed. Don’t rely on week-old memory.

**Rule of thumb**: if a human would skim it in 60s, the agent should too. Trim the rest.

## 4) MCP

**What it is**: MCP gives the agent **precise access** to things it needs: Jira issues, Git/MRs, code files, and internal docs (like your UI lib). Instead of pasting big blobs, the agent **fetches exactly** the item by ID/path.

**How we use it (clean flow)**

1. **Business analysis** → Jira MCP to read the issue and write acceptance bullets + open questions.
2. **Dev planner** → **Context7 MCP** (library/docs search) and **UI lib MCP** (your internal component lib) to pull **updated** API/component info and produce a Tech Plan with examples and tasks.
3. **Implementer** → same Context7/UI lib MCP to mirror patterns and use the right APIs.
4. **Git Ops** → **Git MCP** to assemble the PR title/description from the tasks’ `output.md`, ask for approval, and then create the MR with assignee/reviewers (CODEOWNERS).

**Why this matters**: fewer hallucinations, more **grounded** work. The agent touches **exact sources** instead of guessing from memory.

## 5) Guardrails

**What are guardrails?** The rules that define **what the agent can do**, **when it must ask**, and **how it should behave** when things are unclear. "With great power comes great responsibility".

-   **Default-deny** tools: reads are easy; **writes require confirmation** or policy checks.
-   **Scope guard**: touch **only** files/modules in the task. Anything outside → ask first.
-   **Ask, don’t assume**: unclear requirement? missing pattern? open question in Jira? → stop and ask. No “assumption coding.”
-   **Be critical**: add to your `.cursorrules`: _“Don’t just be agreeable. Criticize when needed and propose safer alternatives.”_ Important because agents tend to just agree with us.

**Editor posture**

-   **VS Code** → usually **confirms everything by default**. Add a **short allowlist** for safe reads/checks.
-   **Cursor** → tends to **allow a lot**, including write ops in git, Jira... Change to confirmation by default, with the safe read allowlist.

**Suggested allow/confirm for beginners**

-   ✅ Auto-allow: `mcp.read.*`, `cd`, `ls`, `grep`, `pnpm check`, `pnpm format`, `pnpm test`, `git status`, `git log`.
-   🧨 Always confirm: `git add/commit/push`, package installs, shell scripts, CI config changes, MR/PR creation.

## 6) Testing

The agents can create e2e, unit, manual steps... This depends on the landscape of the project. We can add to our tech planning to create:

-   **Co-locate** specs next to code: `*.spec.ts` under `src/`.
-   Minimum: **one happy-path Vitest spec per acceptance bullet** touched by the task.
-   Prioritize **services/stores/composables**; in components, test pure logic (events/formatting). UI-heavy flows → manual steps for now.
-   Put **manual steps** in `<task>/output.md` → “How to test”.

**Gherkin (light)** — turns acceptance into binary steps:

```
Scenario: guest checkout on mobile
  Given I have items in the cart
  When I tap "Checkout"
  Then I see the payment screen with total and shipping
```

Mirror the **happy path** in a small Vitest spec. When a bug slips, add a spec and move on.

---

## 7) My current model, a WIP workflow

Now mixing everything together, we can:

1. **MODE: Business analysis**  
   Reads the Jira and creates a **BizSpec** with acceptance criteria. If anything is unclear, adds **Open Questions** (BLOCKER/INFO).  
   → Output: `01-bizspec.md`

2. **MODE: Dev planner**  
   Gets the BizSpec and creates a **Tech Plan**. Splits work into **small, closed-scope tasks** (INVEST framework) linking each task to specific **acceptance bullets**. For each task, define **automated tests** (Vitest) and **manual steps**.  
   → Output: `02-techplan.md` + `tasks-<1...n>/task.md`

3. **MODE: Dev implementer**  
   Reads **one task** to implement. Implements exactly that scope, writes **Vitest** tests, and documents **How to test**.  
   → Output: `tasks/<ID>-Tn/output.md` (+ code)

4. **MODE: Git Ops**  
   Reads all tasks’ **output.md**, generates the **PR title + description** from a template, and **asks for approval**. Upon approval, creates the **MR** with the **assignee and reviewers** based on **CODEOWNERS**, and posts a **Jira comment** linking to the MR.

That’s the loop. Small tasks, clean handoffs, clear outputs.

### **Setup**

Place .ai folder in project's root.

Use the mcp files in mcp folder, there is a README about it.

---

### Wrap up

-   **Prompting**: roles, minimal inputs, explicit outputs; “ask, don’t assume.”
-   **Context engineering**: `.cursorrules` + right standards per mode; new chat per task; IDs over walls of text.
-   **MCP**: precise access to Jira/Git/docs/components; Context7/UI lib MCP for up-to-date info; Git MCP for PRs.
-   **Guardrails**: default-deny, scope guard, be critical; confirmations in the editor.
-   **Testing**: Vitest happy paths + manual steps, co-located.
-   **Workflow**: BizSpec → Tech Plan (+ tasks) → Implement → Git Ops → PR

Small, clear, testable steps. The agent goes faster, and we keep control.
