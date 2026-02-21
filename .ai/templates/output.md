---
schema: ai/dev-output@2
jira: <JIRA-ID>
task: <Task-ID>
updated_at: <ISO8601>
---

## Changes

-   [file/component] — what changed (1–2 lines each)

## Impact Analysis (actual)

-   **Direct:** <affected feature/module>
-   **Shared:** <shared composables/services>
-   **Cross-feature:** <other areas to verify>

## How to Test

### Vitest

-   Run: `pnpm test`
-   Specs executed: <list spec files or grep pattern>

### Manual (mapped to ACs)

1. **(AC-1 Happy)**
   1.1. Navigate to [nav path]...
   1.2. Do [action]...
   1.3. Expects [result]...
2. **(AC-1 Error)**
   2.1. Navigate to [nav path]...
   2.2. Do [action]...
   2.3. Expects [result]...
3. **Regression:** …
