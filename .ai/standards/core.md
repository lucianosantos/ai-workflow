# Technical Standards

> Architecture, coding, and quality standards

## Architecture

- SPA with feature-based organization
- Shared component library first (no vanilla HTML by default)
- Type-safe API comms, centralized error handling
- Mock-first backend dev
- Code generation preserved (never edit generated anchors or generated sections unless the workflow explicitly requires it)

---

## File Organization

```text
src/
├── components/{feature}/
├── composables/
├── pages/
└── types/
```

---

## Component Standards

- **Design-system-first**: use your shared component library (buttons, inputs, grids, etc.)
- **Research Method**: ALWAYS use approved docs or MCP sources for component documentation
- **NEVER**: grep `node_modules` or library source files as your primary component API reference
- Use design tokens, not hardcoded styles
- Responsive by default
- Accessibility: ARIA + keyboard navigation

---

## AG-Grid Standards

Priority order:

1. GridOptions
2. defaultColDef
3. columnDefs
4. API calls (last resort)

Column sizing:

- Content -> minWidth (autosize)
- Utility -> fixed width
- Grouped/dynamic -> autosize on visibility events

Avoid: `setTimeout` hacks, imperative sizing on mounted

### Service Patterns

**Reactive Parameters:**

```typescript
// Correct: Manual execute with current values
const getData = () => execute({ param: reactiveParam.value });

// Wrong: execute() uses stale captured values
const { execute } = service.get({ params: { param: ref.value } });
execute(); // Uses old value
```

**Post-Operation Grid:**

```typescript
// Reliable row operations after data updates
await nextTick(); // Grid processing time
gridApi.forEachNode((node) => { if (node.data?.id === id) /* operate */ });
// `getRowNode(id)` often fails immediately after updates
```

### Vue Reactivity Patterns

**Prefer `computed` over `watch` for derived state:**

```typescript
// Correct: Computed for transforming/deriving data
const lookupMap = computed(() => {
  if (!dataList.value) return new Map();
  return new Map(dataList.value.map((item) => [item.key, item.value]));
});

// Wrong: Watch for simple transformations
const lookupMap = ref(new Map());
watch(
  dataList,
  (data) => {
    lookupMap.value = new Map(data.map((item) => [item.key, item.value]));
  },
  { immediate: true }
);
```

**Use `watch` only for side effects:**

```typescript
// Correct: Watch for side effects (logging, API calls, DOM updates)
watch(selectedId, async (id) => {
  await logActivity(id);
  highlightElement(id);
});

// Correct: Watch when you need old/new values
watch(filters, (newFilters, oldFilters) => {
  if (newFilters.date !== oldFilters.date) {
    trackFilterChange();
  }
});
```

---

## Data Fetching Patterns

**Parent-Child Responsibility:**

```typescript
// Page/Parent: Data fetching layer
// src/pages/dashboard.vue
const { data: userData } = service.getUsers();
const { data: ordersData } = service.getOrders();

<UserGrid :users="userData" :orders="ordersData" />

// Component/Child: Presentation layer
// src/components/UserGrid.vue
interface Props {
  users: User[] | undefined;
  orders: Order[] | undefined;
}
const props = defineProps<Props>();
```

**When to colocate requests:**

- Group related service calls in parent (e.g., user data + user preferences)
- Keep requests together when they share filtering params
- Don't force grouping if it breaks encapsulation (e.g., deeply nested features)
- Don't duplicate requests across multiple parents

**Service call organization:**

```typescript
// Related requests grouped logically
const filteringMetadata = useFilteringMetadata(appliedFilters);

// Feature data requests together
const { data: summaryData } = service.getSummary({ params: filteringMetadata });
const { data: detailData } = service.getDetails({ params: filteringMetadata });
const { data: metadataData } = service.getMetadata();

// Unrelated feature requests separate
const { data: notifications } = service.getNotifications();
```

---

## Principles

**DRY**: Extract shared logic, no copy-paste
**KISS**: Prefer simple, readable solutions
**YAGNI**: Only build what's needed

---

## Code Quality

- Extract shared logic into composables
- Type safety: no `any`, typed props/events/interfaces
- Self-documenting names > comments
- When implementing changes, always cleanup the code, do not leave dead code

---

## Testing

- Start now with **Vitest unit tests** for the critical paths touched by the task.
- **Manual test steps** must be documented in the Task file and mapped to BA **AC** IDs.
- Aim for at least one **unit test per AC happy path**, plus easy edge cases.
- Use **MSW** (or equivalent) to mock API calls inside unit tests when needed.
- No e2e/contract tests for now; leave placeholders in TechPlan for future upgrade.
- Keep **regression steps** (manual) documented.

---

## Performance

- Bundle: code-split, tree-shake, lazy-load
- Runtime: use computed, avoid heavy watchers
- Measure bundle size & runtime perf

---

## Security

- Validate/sanitize inputs
- No secrets in logs
- Respect auth/permissions
- Prevent XSS, CSRF, SQLi

---

## Comment Policy

Allowed:

- Complex business logic
- Regulatory / vendor bug notes
- Performance constraints
- Workarounds

Forbidden:

- Narrative/obvious descriptions
- Commented-out code

---

## Blockers

Reject immediately if:

- Dead code left in place
- Narrative comments present
- Vanilla HTML instead of shared component patterns
- Scope violations (unrelated changes)
- Built-in options ignored for custom hacks
