# Mode: Docs Generator (DOCS)

**Recommended model**: Claude Opus 4.6

**Purpose**  
Create thorough, accurate documentation for pages and features that serves as reference for BA, Planner, and Implementer modes. Prevent missing features and incorrect descriptions.

**Triggers**

- User says: `DOCS: <page-name>` - Document specific page
- User says: `DOCS: all` - Rebuild all page documentation
- User requests documentation for existing functionality.

**Templates**

- Page docs: `.ai/templates/page-doc.md`
- Component docs: `.ai/templates/component-doc.md`

**Output Location**

- Pages: `.ai/docs/pages/<page-name>.md`
- Components: `.ai/docs/components/<path-based-name>.md`
  - Naming: `src/components/feature/SpecificButton.vue` -> `feature-SpecificButton.md`
  - Rule: take the path after `src/components/`, replace `/` with `-`, drop `.vue`
  - For components outside `src/components/`: use full relative path (e.g., `pages-feature-FeatureForm.md`)

**Critical Rules**

1. **Complete reads required** - Read page file entirely, not partially
2. **No assumptions** - Grep/search for features before assuming they don't exist
3. **No assumptions 2** - If there is any doubt, add as questions in the doc file. If there is any answers in the doc, reprocess the doc to accommodate the answer/doubt.
4. **Verify component purposes** - Read the component file, don't guess from name
5. **Check for global features** - Filters, snapshots, and shared actions often live in toolbars
6. **API accuracy** - Read service types to confirm request/response shapes
7. **No future features** - Document only what exists in code
8. **Every component gets its own doc** - Always create a file in `.ai/docs/components/`. Page docs reference component docs, never embed component details inline.

---

## Investigation Protocol

### Phase 1: Discovery (Required Reads)

**Must read COMPLETELY (all lines):**

1. Target page file (e.g., `src/pages/index.vue`)
2. All imported components from page template
3. Toolbar/header components (check for global actions)
4. All composables imported and used
5. Business-core logic files for state management patterns
6. Unit test files to understand tested behaviors
7. Service types for API contracts

### Phase 2: Component Documentation

For each component found in the page template:

1. **Derive the doc path** using the naming convention above
2. **Check if the doc already exists** in `.ai/docs/components/`
   - If yes -> read it, verify it's still accurate, update if needed
   - If no -> read the component file completely, create the doc using `.ai/templates/component-doc.md`
3. **In the page doc**, reference the component doc with a link and 1-line context for this page
   - Example: `[FeatureGrid](../components/feature-FeatureGrid.md)` - main grid displaying the primary records for this page

**For external library components** (design system components, AG-Grid): do NOT create docs - these have external documentation.

### Phase 3: Composable & Business Logic Understanding

For each composable used in page `<script>`:

1. Read composable file (or at least exported functions/types)
2. Understand what state/logic it provides
3. Note: Return values, side effects, integration with components
4. Document in the page doc's Architecture section (composables are page-level orchestration, not separate docs)

### Phase 4: API and Service Integration

**After understanding components, identify APIs:**

1. **From page script:** Look for `service.methodName()` calls
2. **From composables:** Read composable files to find API calls
3. **From components:** Check if components make direct API calls

**For each API found:**

- Read service types (request/response signatures)
- Understand data aggregation level
- Note which workflow uses which API

### Phase 5: Writing

**Page doc** (use `.ai/templates/page-doc.md`):

- Workflows: user goals, steps, which components + composables + APIs are involved
- Architecture: state management, data flow, composables table
- Components: **reference list only** - link to component doc + 1-line role in this page
- API contracts: request/response signatures, data aggregation
- Patterns to reuse, testing, constraints, related features

**Component doc** (use `.ai/templates/component-doc.md`):

- Purpose, props, events, state, key behavior
- Pages that use it (add current page if not listed)
- API calls (if any)
- Integration notes

### Phase 6: Review

Before marking complete:

- [ ] Re-read page file to verify all components documented
- [ ] Every component in template has a corresponding doc in `.ai/docs/components/`
- [ ] Page doc references all component docs (not duplicating their content)
- [ ] All workflows have components + APIs listed
- [ ] Architecture section has composables table
- [ ] API contracts show actual TypeScript signatures
- [ ] "Patterns to Reuse" references real implementations
- [ ] Related Features has purpose statement + specific integration points
- [ ] No "TODO" or placeholder sections
- [ ] User can understand the page without reading code

---

## Modes

1. **Single Page (`DOCS: <page-name>`)**:

   - For each component in the page template:
     - Check if doc exists in `.ai/docs/components/`
     - If yes -> verify it's current, update "Pages" section if this page isn't listed
     - If no -> read component file, create doc
   - Write page doc with workflow descriptions and component references
   - After completion: grep all `.ai/docs/pages/*.md` for references to this page
   - For each referencing page:
     - Read its "Related Features" section
     - Determine if integration details need updating based on changes
     - Update if needed or confirm "no changes required"
   - Output summary of component docs created/updated and cross-reference updates

2. **Full Rebuild (`DOCS: all`)**:
   - Iterate through all pages in `src/pages/`
   - For each page, document components first (create/update component docs)
   - Then write page docs referencing the component docs
   - Component docs are reused across pages (no duplication)

---

## Stop Conditions

- Cannot find the page/feature file -> Ask user for path
- Page uses patterns not understood -> Document as "needs investigation" and ask
- Conflicting information in code -> Add to "Known Constraints" and flag