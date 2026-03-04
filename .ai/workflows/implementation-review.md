# Mode: Implementation Reviewer (IR)

**Purpose**  
Perform thorough post-implementation review against BizSpec, TechPlan, and Jira requirements. Verify ALL aspects of implementation including functionality, tests, and documentation. This is the final quality gate before MR creation.

**Triggers**

- User says: `REVIEW: <JIRA-ID>` or "review implementation for <JIRA-ID>" or "review code for <JIRA-ID>"
- User asks to review a completed implementation before creating MR

**Preconditions**

- `.ai/tasks/<JIRA-ID>/01-bizspec.md` exists
- `.ai/tasks/<JIRA-ID>/02-techplan.md` exists
- Output file exists at `.ai/tasks/<JIRA-ID>/output.md`
- Implementation code has been committed/staged

**Review Mindset**

**Think like a QA tester and end user, not just a developer:**

- Does this solve the user's actual problem described in Jira?
- Is the feature usable and intuitive?
- Would a user be confused by what they see?
- Does it match the user story intent, not just the technical spec?
- Are there obvious UX issues (missing labels, confusing flows, etc.)?

**Review Protocol**

## Phase 1: Artifact Review + User Story Understanding (15 min)

1. **Load all artifacts**:

   - **Jira ticket**: Read full description, understand the USER'S PROBLEM and desired outcome
   - BizSpec (all ACs, edge cases, non_goals, Open Questions answers)
   - TechPlan (approach, decisions, data contracts, test plan)
   - Output file (changes, impact, test results)

2. **Understand the "Why"**:

   - What user problem does this solve? (from Jira description)
   - What user workflow is being enabled/improved?
   - What should the user be able to accomplish after this feature?
   - Are there screenshots/mockups in Jira? (compare with implementation)

3. **Create checklist** from artifacts:
   - Extract all AC IDs from BizSpec
   - Extract all "should not" requirements (non_goals, explicit negatives in ACs)
   - Extract all edge cases that require code handling
   - List all files mentioned in task outputs
   - Note any user-facing text, labels, error messages mentioned

## Phase 2: Component Tree Traversal (CRITICAL)

**This is the most important phase - do NOT skip or assume.**

1. **Identify entry points** from task outputs:

   - Page components
   - Route definitions
   - Service methods called

2. **Full file reads** (read entire files, not partial):

   - Start from page component → read COMPLETELY (template + script)
   - For each child component referenced → read COMPLETELY
   - For each composable imported → read COMPLETELY
   - For each service method called → read COMPLETELY
   - Continue until reaching leaf nodes (no more deps)

3. **UI element verification**:

   - **For each "should not have" requirement**: Explicitly search template for that UI element
   - Search for: buttons (Add/Import/Delete/Edit), inputs, navigation items, menu items
   - Check conditional rendering (`v-if`, `v-show`) - trace the condition value
   - Check props passed to shared components that control UI visibility

4. **Trace data flow**:
   - API calls → response handling → state updates → template rendering
   - Verify each AC requirement has corresponding code path

## Phase 3: AC Verification (Business/QA Mindset)

For EACH Acceptance Criterion:

1. **Identify implementation location** from task outputs
2. **Read the actual code** (full file, not grep results)
3. **Verify requirement is met** (technical):

   - If AC says "should display X" → verify template has X
   - If AC says "should NOT have Y" → verify template does NOT have Y
   - If AC says "should call API Z" → verify service method is called

4. **Verify from USER perspective** (business/QA):

   - Would a user understand how to accomplish the AC scenario?
   - Are labels/text clear and match Jira descriptions?
   - Are there obvious missing pieces that break the user flow?
   - Does the UI match what's described in Jira (if screenshots/descriptions exist)?
   - Are error messages helpful to users (not technical jargon)?

5. **If uncertain**: STOP and ASK USER for clarification, do not assume

## Phase 4: Test Coverage Verification

1. **Unit tests**:
   - For each AC marked with test location in TechPlan → verify spec file exists
   - Read spec file → verify test cases cover AC happy paths
   - Check test execution results in task outputs

## Phase 5: Edge Cases & Non-Goals

1. **Edge cases**: For each edge case in BizSpec → verify handling in code (null checks, empty arrays, division by zero, etc.)
2. **Non-goals**: For each non_goal in BizSpec → verify feature is NOT implemented

## Phase 6: Business Value & UX Check

**Think like the end user from Jira:**

1. **User workflow validation**:

   - Can the user actually complete the workflow described in Jira?
   - Are there missing steps that would confuse a user?
   - Is the feature accessible where the user expects it? (navigation, page location)

2. **Usability red flags**:

   - Buttons/actions with unclear labels or no labels
   - Missing feedback (loading states, success/error messages)
   - Confusing empty states (no data scenarios)
   - Inconsistent terminology vs. Jira/BizSpec

3. **Jira description alignment**:

   - Re-read the Jira "description" section (user's request in plain language)
   - Does the implementation deliver what's described there?
   - Are there screenshots/examples in Jira? Does code match them?
   - If Jira says "similar to X page", does it actually look/behave similarly?

4. **Ask yourself: "Would I be confused if I used this feature?"**

   - If yes → flag as usability issue
   - If unclear → STOP and ASK USER

5. **Manual test checklists**:
   - Verify task outputs document manual test execution
   - Check for "✅" or explicit "passed" marks

## Output Format

**Summary Section**:

- Implementation status (% complete)
- Critical issues count (blocking MR)
- Moderate issues count (should fix)
- Minor issues count (can defer)

**Issues List**:

Format each issue as:

```
### [Priority: 🔴 Critical / 🟡 Moderate / 🟢 Minor] Issue Title

**Requirement**: [Quote exact AC or requirement from BizSpec/TechPlan/Jira]
**Finding**: [What you found in the code, with file:line references]
**Evidence**: [Code snippet or component tree path showing the issue]
**Impact**: [What breaks or is incomplete - from USER perspective]
**User Impact**: [How does this affect the end user? What would they experience?]
**Fix needed**: [Specific action to resolve]
```

**Examples of business/QA issues to flag**:

- Page has "Add" button but Jira says "read-only view"
- Labels don't match terminology in Jira (e.g., "Portfolio" vs "Account")
- Missing loading state → user sees blank screen with no feedback
- Error messages show technical details → user doesn't know what to do
- Feature requires 5 clicks but Jira implied "quick access"
- No empty state message → user doesn't know if data is loading or missing
- Navigation item placed far from related features mentioned in Jira

**Questions Section** (if any doubts):

If anything is unclear during review:

- STOP immediately
- List specific questions with context
- Ask user for clarification
- Resume review only after answers received

**Verification Checklist**:

- [ ] All AC IDs verified (list any missing)
- [ ] All "should not" requirements verified
- [ ] All edge cases handled
- [ ] Component tree fully traversed
- [ ] Output file matches actual code
- [ ] Unit tests pass and cover ACs
- [ ] Manual tests documented
- [ ] No assumptions made (all doubts clarified)
- [ ] **Jira user story intent fulfilled** (solves user's problem)
- [ ] **User workflow completable** (no confusing gaps)
- [ ] **Labels/terminology match Jira**
- [ ] **No obvious UX issues** (missing feedback, unclear actions)

## Critical Rules

1. **Read entire files**: Never rely on partial reads or grep snippets for UI verification
2. **Trace component hierarchy**: Page → child → grandchild → leaf, read each completely
3. **Think like a user**: Imagine clicking through this feature - would it be confusing or unclear?
4. **Jira is the source of truth for user intent**: Not just BizSpec - check what user originally asked for
5. **No pattern matching**: Don't assume structure based on other implementations, verify in THIS code
6. **Question everything**: If uncertain about ANY requirement, ask user before continuing
7. **Explicit negatives**: "Should not have X" requires explicit verification that X is absent
8. **Conditional UI**: Check ALL conditions that control visibility (v-if, props, computed)

## Stop Conditions

- Any AC cannot be verified in code → flag as **missing implementation**
- Any "should not" requirement found in code → flag as **spec violation**
- Cannot trace component tree (missing imports) → flag as **code error**
- Any doubt about requirement interpretation → **STOP and ASK USER**
- Test failures found in task outputs → flag as **blocking issue**

## Review Outcome

**Ready for MR**: All ACs verified, no critical issues, all tests pass, no clarification needed  
**Not Ready**: Critical issues found or clarification needed before proceeding
