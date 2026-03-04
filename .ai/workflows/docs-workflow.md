# Documentation Generation Workflow

## Investigation Protocol

### Phase 1: Discovery (Required Reads)

**Must read COMPLETELY (all lines):**

1. Target page file (e.g., `src/pages/index.vue`)
2. All imported components from page template
3. Toolbar/header components (check for global actions)
4. All composables imported and used

**Targeted reads (first 50-100 lines or grep):** 5. Business-core logic files for state management patterns 6. Unit test files to understand tested behaviors 7. Service types for API contracts

### Phase 2: Component-Based Understanding

**Strategy: Understand the page through its components**

Instead of searching for specific patterns, follow the human approach:

1. **List all components from page template:**

   - Extract every component tag from `<template>` section
   - Categorize: Page-specific vs Shared vs External library

2. **For each page-specific component:**

   - Read component file completely
   - Understand: What does it do? What state? What APIs?
   - Note: Props it receives, events it emits, features it provides

3. **For each shared component:**

   - Check if doc exists in `.ai/docs/shared/`
   - If yes → reference it
   - If no → read component file completely, create shared doc
   - Understand its role in this page's context

4. **For each composable used in page `<script>`:**

   - Read composable file (or at least exported functions/types)
   - Understand what state/logic it provides
   - Note: Return values, side effects, integration with components

5. **Synthesize workflows from components:**
   - Group related components by user goal
   - Example: `FiltersToolbar` + `useFilters()` + `InputDialog` = "Filter Management" workflow
   - Document the flow: User interaction → Component → Composable → API → Result

**Key Principle:** Let the code structure guide the documentation, don't assume features exist.

### Phase 3: API and Service Integration

**After understanding components, identify APIs:**

1. **From page script:** Look for `service.methodName()` calls
2. **From composables:** Read composable files to find API calls
3. **From components:** Check if components make direct API calls

**For each API found:**

- Read service types (request/response signatures)
- Understand data aggregation level
- Note which workflow uses which API

**Token Management for Shared Components:**

1. **Check for existing docs first:**

   - Look in `.ai/docs/shared/`
   - If doc exists, reference it instead of re-reading

2. **Shared component strategy:**

   - **Shared components** (used in 2+ pages):
     - Document once in `.ai/docs/shared/<component-name>.md`
     - Read component file completely
     - Page docs reference: "Uses DateRangePicker (see [shared docs](../shared/date-range-picker.md))"
     - Examples: `DateRangePicker`, `StatusBadge`, `DataTable`
   - **Page-specific** (used in 1 page only):
     - Document fully in page doc
     - Read component file completely
     - Examples: `DashboardChart`, `SettingsForm`

3. **Reading strategy:**
   - **First encounter** of shared component → Read fully, create shared doc
   - **Subsequent encounters** → Reference existing shared doc, don't re-read
   - **Page-specific components** → Always read fully, document inline

### Phase 4: Shared Component Strategy

Before writing, verify:

- [ ] All workflows from toolbar actions documented
- [ ] All grid features identified (pivot, grouping, drill-down)
- [ ] Toolbar integration checked (if toolbar components present)
- [ ] All API endpoints listed with accurate purposes
- [ ] All composables documented in architecture section
- [ ] Cell renderers and custom components listed
- [ ] Related features cross-referenced accurately
- [ ] Shared components referenced (not duplicated)

### Phase 5: Verification Checklist

Before writing, verify all components are understood:

- [ ] All components from template listed and categorized
- [ ] All page-specific components read and understood
- [ ] All shared components either documented or referenced
- [ ] All composables in script understood
- [ ] All API calls identified with their purposes
- [ ] Workflows synthesized from component interactions
- [ ] No assumed features - everything verified in code

### Phase 7: Review

Before marking complete:

- [ ] Re-read page file to verify all components documented
- [ ] Check each workflow maps to actual components + composables
- [ ] Verify no placeholder/wrong content
- [ ] Confirm all APIs have correct signatures from service types
- [ ] No "TODO" sections remain
- [ ] Related Features has purpose statement + specific integration points
- [ ] Every component in template appears somewhere in the doc

5. **Link to files** - Use relative paths to actual source files

### Phase 6: Review

Before marking complete:

- [ ] Re-read page file to catch missed features
- [ ] Check each workflow against actual code
- [ ] Verify no placeholder/wrong content
- [ ] Confirm all composables documented
- [ ] No "TODO" sections remain
- [ ] Related Features has purpose statement + specific integration points

## Stop Conditions

- Cannot find the page/feature file → Ask user for path
- Page uses patterns not understood → Document as "needs investigation" and ask
- Conflicting information in code → Add to "Known Constraints" and flag
- Shared component not documented yet and is complex → Create shared doc first

## Quality Gates

**Before considering docs complete:**

✅ All workflows have components + APIs listed  
✅ Architecture section has composables table  
✅ API contracts show actual TypeScript signatures  
✅ "Patterns to Reuse" references real implementations  
✅ Related Features has purpose + integration points  
✅ User can understand the page without reading code  
✅ Shared components properly referenced (not duplicated)
