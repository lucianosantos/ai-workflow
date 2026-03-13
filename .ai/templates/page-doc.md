# [Page Name] Page

**Route:** `/route-path`  
**Page File:** [src/pages/filename.vue](../../../src/pages/filename.vue)  
**Domain:** [Business domain, e.g., Data management, reporting]

---

## Overview

[1-2 sentence description of what the page does and its purpose in the application]

**Core Capabilities:**

- [Capability 1]
- [Capability 2]
- [Capability 3]

---

## User Workflows

### 1. [Workflow Name]

**User Goal:** [What the user wants to accomplish]

**Flow:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Components:** [List components used]  
**Business Logic:** [List composables used]  
**APIs:** [List API calls]

[Repeat for each workflow]

---

## Architecture

### State Management

**[State Category 1]:**

- `stateName` - Description
- How it's synced/persisted

**[State Category 2]:**

- `stateName` - Description

### Data Flow

```
[Simple flow diagram or description]
User Action -> Composable -> API -> Backend
                |
         Update State
                |
         Component Re-renders
```

**Example - [Specific Flow]:**

1. [Step describing data flow]
2. [Step describing state update]
3. [Step describing UI update]

### Key Composables (Business Logic)

Located in [path/to/composables/](../../../path/to/composables/):

| Composable | Purpose   | Returns           |
| ---------- | --------- | ----------------- |
| `useX()`   | [Purpose] | [What it returns] |
| `useY()`   | [Purpose] | [What it returns] |

---

## Components

### Core Grid/Display Components

**[ComponentName.vue](../../../path/to/component.vue)**

- [Description of what it does]
- [Key feature 1]
- [Key feature 2]
- Has unit tests: [test file name]

### Toolbars & Controls

**[ToolbarName.vue](../../../path/to/toolbar.vue)**

- [Description]
- Contains: [List of controls/actions]

### Cell Renderers / Custom Components

**[CellRenderer.vue](../../../path/to/cell.vue)**

- [Description]
- [Special behavior]

---

## API Contracts

All endpoints prefixed with JSON-RPC method names.

### `methodName`

**Purpose:** [What this endpoint does]

**Request:**

```typescript
{
  param1: type;
  param2?: type;
}
```

**Response:**

```typescript
{
  result: Type;
}
```

**Data Aggregation:** [Row-level / Entity-level / Transaction-level / Aggregated]

[Repeat for each API endpoint]

---

## Patterns to Reuse

### [Pattern Name]

**When to use:** [Trigger/scenario for using this pattern]

**Implementation:**

- [Key implementation detail 1]
- [Key implementation detail 2]
- See: [File references]

**Example reuse:** "[Example scenario where this pattern applies]"

[Repeat for each reusable pattern]

---

## Testing Patterns

### Unit Tests

- **[Test category]:** [path/to/test.spec.ts](../../../path/to/test.spec.ts)
- **[Test category]:** [path/to/test.spec.ts](../../../path/to/test.spec.ts)

**Coverage:** [What's covered by unit tests]

### E2E Tests

**Location:** [cypress/e2e/feature-*.cy.ts](../../../cypress/e2e/)

**Scenarios:**

- [Scenario 1]
- [Scenario 2]

---

## Known Constraints & Edge Cases

1. **[Constraint Name]:** [Description of limitation or edge case]
2. **[Constraint Name]:** [Description of limitation or edge case]
3. **[Constraint Name]:** [Description of limitation or edge case]

---

## Related Features

**Purpose:** This section maps how this page connects to other app features to help understand cross-feature impact during planning.

- **[Related Feature] ([page-file.vue](../../../src/pages/page-file.vue)):**
  - [How they're related]
  - [Specific integration point]
  - See [Feature page](./feature.md) for details