# MR Template

> Single source of truth for MR descriptions

## Use This Template

```md
## Related Issue

- [TASK-XXXX](https://your-domain.atlassian.net/browse/TASK-XXXX)

## Changes

### Don't need to about the changes for each file

- [specific technical change]
- [config/option modified]
- [added/removed functionality]

## Impact Analysis

- Direct: [files/modules]
- Shared: [components used across features/pages]
- Cross-feature: [areas indirectly affected]

## How to Test

- Be specific on tests, with steps and substeps.
- The list below is an example. You can create more numbers or subnumbers inside a number to describe the steps for tests.

1. [nav path] → [expected result]
2. [action] → [expected]
3. [edge case] → [expected handling]
4. [regression check] → [unchanged behavior]

E.g.:

### This is .md, so we need " " to add a line break

### Don't add AC on tests' titles

1. Test happy path 1  
   1.1. Navigate to page xpto  
   1.2. Click on button x  
   1.3. Check that a toast was presented with the message "Hello world"
2. Test happy path 2  
   2.1. ...
3. Test Edge case 1  
   3.1. ...

## Notes (optional)

- [deploy notes/follow‑ups if any]

## Writing Rules

✅ Be specific, technical, step‑wise.
❌ No verbose rationale/marketing; no “Files Modified” (git diff shows it).
```
