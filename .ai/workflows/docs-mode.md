# Mode: Docs Generator (DOCS)

**Purpose**  
Create thorough, accurate documentation for pages and features that serves as reference for BA, Planner, and Implementer modes. Prevent missing features and incorrect descriptions.

**Triggers**

- User says: `DOCS: <page-name>` - Document specific page
- User says: `DOCS: all` - Rebuild all page documentation
- User requests documentation for existing functionality.

**Workflow Reference**

Follow `.ai/workflows/docs-workflow.md` for complete investigation and writing protocol.

**Template**

Use `.ai/templates/page-doc.md` for page documentation structure.

**Output Location**

- Pages: `.ai/docs/pages/<page-name>.md`
- Shared components: `.ai/docs/shared/<component-name>.md`

**Critical Rules**

1. **Complete reads required** - Read page file entirely, not partially
2. **No assumptions** - Grep/search for features before assuming they don't exist
3. **No assumptions 2** - If there is any doubt, add as questions in the doc file. If there is any answers in the doc. Reprocess the doc to accomodate the answer/doubt.
4. **Verify component purposes** - Read the component file, don't guess from name
6. **Check for global features** - Toolbars, filters, data feeds often in toolbar components
6. **API accuracy** - Read service types to confirm request/response shapes
7. **No future features** - Document only what exists in code
8. **Shared component strategy** - Document complex shared components once in `.ai/docs/shared/`, simple ones inline
   **Token Management for Shared Components**

- **Shared components** (used in 2+ pages):
  - First encounter → Read fully, create shared doc in `.ai/docs/shared/<component-name>.md`
  - Subsequent pages → Reference existing shared doc, don't re-read
- Examples: `DateRangePicker`, `StatusBadge`, `DataTable`
- **Page-specific components** (used in 1 page only):
  - Always read fully and document in page doc
  - Examples: `DashboardChart`, `SettingsForm`

**Modes**

1. **Single Page (`DOCS: <page-name>`)**:

   - Document one page completely
   - After completion: grep all `.ai/docs/pages/*.md` for references to this page
   - For each referencing page:
     - Read its "Related Features" section
     - Determine if integration details need updating based on changes
     - Update if needed or confirm "no changes required"
   - Output summary of cross-reference updates made

2. **Full Rebuild (`DOCS: all`)**:
   - Iterate through all pages in `src/pages/`
   - Document each using standard workflow
   - Shared component docs reused (token efficient)
   - No cross-reference check needed (everything rebuilt fresh)

**Quality Gates**

Before marking docs complete:

- [ ] No "TODO" or placeholder sections
- [ ] All workflows have components + APIs listed
- [ ] Architecture section has composables table
- [ ] API contracts show actual TypeScript signatures
- [ ] "Patterns to Reuse" references real implementations
- [ ] Related Features has purpose statement + specific integration points
- [ ] Shared components properly referenced (not duplicated)
- [ ] User can understand the page without reading code
