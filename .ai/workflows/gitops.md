# Mode: GitOps (GIT)

**Purpose**  
Create reviewed, traceable Merge Requests (MRs) with strict previews and confirmations. No merges or force-pushes by the agent.

**Triggers**

- User says: `GIT:` …, “create MR for <JIRA-ID>”, “open MR”, “prepare MR body”, or asks for branch/commit/push with preview.

**Global safety (inherits router rules)**

- Must **preview and confirm** before: branch creation, commit, push, MR creation.
- No merges, no force pushes, no repo settings changes.

**Global git settings**

- **GitLab MCP only**: Use ONLY GitLab MCP for ALL git and MR operations (branches, commits, push, MR creation, status checks).
- **Never use GitKraken MCP**: GitKraken MCP is disabled for this project - use GitLab MCP exclusively.

**Preconditions**

- DI gate passed for the target work (see DI-01).
- `pnpm test` and `pnpm check` are clean.
- Task output exists at `.ai/tasks/<JIRA-ID>/output.md` and reflects latest changes.
- MR description template exists at `./.ai/templates/mr.md`.

---

## 1) Branches

- **Name:** `{feat|fix|task}/<project-name>-<JIRA-ID>-<kebab-title>` (≤ 100 chars).
- **Base:** `origin/master` (or repo default branch if different).
- **Flow:**
  1. Derive `<kebab-title>` from Jira title.
  2. Confirm → `git checkout -b {branch} origin/master`.
  3. After first commit, confirm → `git push -u origin {branch}`.

> These mirror your Git rules. Keep human approval on every write op.  
> Allowed ops (with confirmation): create local branches/commits, push branches, create MRs, read repo info. **Forbidden:** merges, force-pushes. (Source workflow)

---

## 2) Commits

- **Format:** `type: description` (first line ≤ 100 chars; lowercase after colon).  
  Examples: `fix: prevent invalid foo combo`, `feat: enable autosize for feature grid`, `task: upgrade ag-grid to v32`.
- **Flow:**
  1. Stage changes.
  2. Preview exact commit message and ask: “Commit with message: `<msg>`?”
  3. Run commit only after approval.

---

## 3) MR Composition (from template + task outputs)

**Inputs**

- **Template:** `./.ai/templates/mr.md` (single source for MR description sections).
- **Source:** `.ai/tasks/<JIRA-ID>/output.md` (single file per JIRA).

**Build**

1. Parse `output.md` and map its sections into the MR template.
2. **Title format:** `{type}: {jira in lowercase (<project-name>-1234)} {concise summary}` (≤ 100 chars).
3. Render **Title + Description** (Markdown) using the template.
4. **MR Description Rules**:
   - **Changes section**: Write at macro/feature level (what capability was added), NOT task-by-task implementation details
   - **No internal references**: Remove all AC-X, Edge-X, task-X references - these are internal only
   - **How to Test**: Keep test steps but remove AC/Edge tags, use plain numbered steps
   - **Notes section**: Only include deployment notes, follow-ups, or critical context for reviewers

**Preview & Confirmation (hard gate)**

- Show the **exact** Title and the full Description (Markdown) to the user:
  - “Create MR with this Title and Description?”
- **Only** create the MR after explicit “yes”.

**Create MR**

- Create via Gitlab MCP.
- Assign **yourself**; add reviewers; get usernames from CODEOWNERS. The assignee should not be a reviewer.
- **Reviewer assignment**:
  1. Read `.gitlab/CODEOWNERS` file
  2. Extract usernames (exclude yourself if listed)
  3. Get user IDs via `gitlab_get_users` for each username
  4. Pass reviewer IDs to `reviewerIds` parameter as array
  5. If CODEOWNERS is empty or missing → **stop and ask user** to update CODEOWNERS before creating MR
- Post **one** Jira comment with the MR link, message:
  - “MR created: [{link}]({link})” (no extra comments, no spam).

**Post-create checks**

- Reviewers/assignee set; link visible in Jira.
- No extra/spam comments.

---

## 4) Checklists (must be true before MR)

- [ ] Branch/commit naming valid; first lines ≤ 100 chars.
- [ ] Lint/typecheck pass; scope tight; dead code removed.
- [ ] **Changes**, **Impact Analysis**, **How to Test** present in `output.md`.
- [ ] **MR Title + Description previewed and user approved.**
- [ ] MR created; assignee = self; reviewers set; Jira updated once.

---

## 5) Stop Conditions

- Missing or stale `.ai/tasks/<JIRA-ID>/output.md`.
- Tests/checks failing.
- Attempt to merge/force-push (disallowed).
- MR template not found.
