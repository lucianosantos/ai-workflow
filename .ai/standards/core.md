# Technical Standards

> Architecture, coding, and quality standards

## 🏗 Architecture

-   SPA with feature-based organization
-   UI library components (no vanilla HTML)
-   Type-safe API comms, centralized error handling
-   Mock-first backend dev
-   Code generation preserved (never edit @hygen anchors)

---

## 📂 File Organization

src/
├── components/{feature}/
├── composables/
├── pages/
└── types/

---

## 🎨 Component Standards

-   **UI library-first**: use your design system components (buttons, inputs, grids, etc.)
-   **Research Method**: ALWAYS use UI lib MCP (`mcp_ui-components_*`) for component documentation
-   **NEVER**: grep `node_modules` or read source files for component API
-   Use design tokens, not hardcoded styles
-   Responsive by default
-   Accessibility: ARIA + keyboard navigation

---

## 🔧 Libs you commonly use Standards

### Standard 1
### Standard 2
### Standard 3

---

## 🧱 Principles

**DRY**: Extract shared logic, no copy-paste  
**KISS**: Prefer simple, readable solutions  
**YAGNI**: Only build what’s needed

---

## 💎 Code Quality

-   Extract shared logic into composables
-   Type safety: no `any`, typed props/events/interfaces
-   Self-documenting names > comments

---

## 🧪 Testing

-   Start now with **Vitest unit tests** for the critical paths touched by the task.
-   **Manual test steps** must be documented in the Task file and mapped to BA **AC** IDs.
-   Aim for at least one **unit test per AC happy path**, plus easy edge cases.
-   Use **MSW** (or equivalent) to mock API calls inside unit tests when needed.
-   No e2e/contract tests for now; leave placeholders in TechPlan for future upgrade.
-   Keep **regression steps** (manual) documented.

---

## ⚡ Performance

-   Bundle: code-split, tree-shake, lazy-load
-   Runtime: use computed, avoid heavy watchers
-   Measure bundle size & runtime perf

---

## 🔒 Security

-   Validate/sanitize inputs
-   No secrets in logs
-   Respect auth/permissions
-   Prevent XSS, CSRF, SQLi

---

## 📝 Comment Policy

✅ Allowed:

-   Complex business logic
-   Regulatory / vendor bug notes
-   Performance constraints
-   Workarounds

❌ Forbidden:

-   Narrative/obvious descriptions
-   Commented-out code

---

## ⚠️ Blockers

❌ Reject immediately if:

-   Dead code left in place
-   Narrative comments present
-   Vanilla HTML instead of UI library components
-   Scope violations (unrelated changes)
-   Built-in options ignored for custom hacks
