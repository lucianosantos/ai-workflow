# Shared Component Documentation

This directory contains documentation for complex shared components used across multiple pages.

## When to Document Here

Document a component in this directory if:

1. **Used in 2+ pages**

That's it! All shared components get documented here, regardless of complexity.

## When NOT to Document Here

Don't document here if:

- Component from external library (e.g., your design system, PrimeVue) - already has external docs
- Page-specific component used in only 1 page - document in page doc instead

## Example Shared Components

- `DataTable` - Reusable data grid with CRUD
- `FilterPanel` - Generic filter panel component

## Referencing in Page Docs

In pages' documentation, reference shared components like:

```markdown
**Components:** `DataTable` (see [shared docs](../shared/data-table.md))
```

## Documentation Template

Use the same structure as page docs but focus on:

- Props/API
- State management
- Events emitted
- Integration requirements
- Example usage
