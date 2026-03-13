# AI Workflow Templates

This folder contains **canonical templates** used by AI agents and humans in the development workflow.
Each template has minimal **YAML front-matter** (machine-readable) and a **Markdown body** (human-readable).
Agents MUST follow these exactly - they are the contract between **BA -> DP -> DI -> IR -> GIT** phases.

## Entry Points

- **Cursor**: `.cursorrules` (router) + `.cursor/rules/*.mdc` (phase and context rules)
- **Workflows**: `.ai/workflows/*.md` (canonical phase specs)
- **Standards**: `.ai/standards/*.md` (coding, testing, API patterns)

---

## 1. `bizspec.md` - Business Analysis Output

**Purpose:** Captures BA analysis from Jira tickets before any dev starts.
**Who fills it:** Business Analyst (BA agent) after reading Jira.
**When:** Immediately after ticket review and stakeholder clarification.

**Contents:**

- Summary, Explicit/Implicit requirements
- Acceptance criteria (Gherkin), Edge cases
- Open questions (`[BLOCKER]`/`[INFO]`)
- `developmentReady: READY|NOT_READY`

**Next step:** If `developmentReady: READY`, Planner can proceed.

---

## 2. `techplan.md` - Technical Plan

**Purpose:** High-level technical plan, architecture decisions, and work breakdown.
**Who fills it:** Dev Planner (DP agent), using BizSpec as input.
**When:** After BA delivers a "Development Ready" spec.

**Contents:**

- Impact analysis, C4 approach, ADR decisions
- Data/Contracts, Test traceability table
- Open questions (`[BLOCKER]`/`[INFO]`)
- Tasks (INVEST), Risks/Dependencies
- `plan_ready: READY|NOT_READY`

**Next step:** If `plan_ready: READY`, implementation can start (manual or orchestrated).

---

## 3. `techtask.md` - Task Specification

**Purpose:** Single implementation task with DoD, AC refs, test checklist.
**Who fills it:** Dev Planner during task decomposition.
**When:** During TechPlan creation.

---

## 4. `output.md` - Implementation Output

**Purpose:** Single file per JIRA tracking all changes, impact, and test results.
**Who fills it:** Dev Implementer (DI agent) - first task creates, subsequent append.
**When:** During and after implementation.

---

## 5. `mr.md` - Merge Request Template

**Purpose:** MR description structure for GitLab.
**Who fills it:** Git Operations (GIT agent) using output.md as source.
**When:** After implementation review passes.

---

## 6. `page-doc.md` - Page Documentation

**Purpose:** Comprehensive page documentation for existing features.
**Who fills it:** Docs Generator (DOCS agent).
**When:** On demand or during full rebuild.

---

## 7. `component-doc.md` - Component Documentation

**Purpose:** Documentation for any component encountered during page documentation.
**Who fills it:** Docs Generator (DOCS agent).
**When:** During page documentation - every component gets its own doc file.

**Contents:**

- Purpose, props, events, state, API calls
- List of pages that use this component
- Integration notes for parent pages