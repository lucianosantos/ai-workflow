# Mode: Patch (PATCH)

**Recommended model**: Claude Sonnet 4.6

**Trigger**

- User says: `PATCH: <description>` or makes any in-flight code change to a JIRA already in progress (follow-up refinements, dead code removal, quick fixes, UX tweaks).

**About**

You are making a small, targeted change to a JIRA already in progress. No new task file is created. Full DI workflow is not required - but compliance gates are non-negotiable.

**Preconditions**

- A JIRA is active (`.ai/tasks/<JIRA-ID>/output.md` exists).
- The change is in-scope for that JIRA (no new scope -> open a new JIRA).

---

## Workflow

1. **Read `.ai/standards/core.md`** - mandatory before touching any file.
2. **Make the change** - follow existing patterns, no architecture decisions.
3. **Run `pnpm check`** - must pass before done.
4. **Update `.ai/tasks/<JIRA-ID>/output.md`** - append a `### Patch` entry under Changes with:
   - Files modified and 1-line rationale each
   - Tests added/removed (if any)
5. **Done** - no task stub, no TechPlan update required unless the patch reveals a scope change.

---

## Compliance Checklist (mental check, every patch)

- [ ] `core.md` read before editing?
- [ ] design system components only - no vanilla HTML introduced?
- [ ] Type-safe - no `any` added?
- [ ] Dead code removed, not left in place?
- [ ] `pnpm check` passes?
- [ ] `output.md` updated?

---

## What is NOT a patch

If the change requires any of the following -> stop, use `DO:` instead:

- New acceptance criteria or scope expansion
- New architectural pattern or component
- New service call or API integration
- Change that requires a new Vitest spec (beyond deleting an old one)
