# 📑 AI Workflow Templates

This folder contains **canonical templates** used by AI agents and humans in the development workflow.  
Each template has minimal **YAML front-matter** (machine-readable) and a **Markdown body** (human-readable).  
Agents MUST follow these exactly — they are the contract between **BA → Dev → Git** phases.

---

## 1. `ba.md` — Business Analysis Output

**Purpose:**  
Captures BA analysis from Jira tickets before any dev starts.

**Who fills it:**  
Business Analyst (BA agent) after reading Jira.

**When:**  
Immediately after ticket review and stakeholder clarification.

**Contents:**

- Summary
- Explicit requirements
- Implicit requirements
- Acceptance criteria (`AC-1...`)
- Edge cases
- Open questions
- `developmentReady: true|false`

**Next step:**  
If `developmentReady: true`, Dev agent can proceed. Otherwise, wait for clarifications.

---

## 2. `dev.md` — Development Plan

**Purpose:**  
High-level technical plan and work breakdown for the issue.

**Who fills it:**  
Developer agent, using `ba.md` as input.

**When:**  
After BA delivers a “Development Ready” spec.

**Contents:**

- Planned impact analysis (Direct/Shared/Cross-feature)
- Work breakdown into tasks (`task-01`, `task-02`, …)
- Risks / dependencies
- Validation plan (local tests + `pnpm check` + navigation routes)

**Next step:**  
Split tasks into `task.md` files for implementation.

--
